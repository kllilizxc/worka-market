import { readFile, realpath, stat, mkdtemp, rm } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const config = await readFile(resolve(root, 'market.config.json'), 'utf8').then(JSON.parse, error => {if (error.code !== 'ENOENT') throw error; return {sourceOrigins:['https://github.com']};});
export function parseJsonl(text) {
  return text.split(/\r?\n/).flatMap((line, index) => {
    if (!line.trim()) return [];
    try {return [JSON.parse(line)];} catch {throw new Error(`Invalid JSON on line ${index + 1}`);}
  });
}
export function legacyCatalog(entries) {
  return {schemaVersion:1, notes:entries.filter(entry => entry.kind === 'note').map(({schemaVersion,kind,...entry}) => entry)};
}
/** Implements the small JSON Schema vocabulary used by this repository, without runtime dependencies. */
export function validateSchema(value, schema, path = '$') {
  const fail = () => { throw new Error(`Invalid catalog field: ${path}`); };
  if (schema.oneOf) {
    const successes = schema.oneOf.filter(choice => { try { validateSchema(value, choice, path); return true; } catch { return false; } });
    if (successes.length !== 1) fail();
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) fail();
  if ('const' in schema && value !== schema.const) fail();
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
    for (const key of schema.required ?? []) if (!(key in value)) fail();
    for (const [key, item] of Object.entries(value)) {
      if (!schema.properties?.[key]) { if (schema.additionalProperties === false) fail(); }
      else validateSchema(item, schema.properties[key], `${path}.${key}`);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > (schema.maxItems ?? Infinity)) fail();
    value.forEach((item, index) => validateSchema(item, schema.items, `${path}[${index}]`));
  } else if (schema.type === 'string') {
    if (typeof value !== 'string' || value.trim().length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? Infinity) || schema.pattern && !new RegExp(schema.pattern).test(value)) fail();
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') fail();
}

export function parseSource(source) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || !config.sourceOrigins.includes(url.origin) || url.port || url.username || url.password || url.search || url.hash) throw new Error('Source origin must be explicitly allowed by this store');
  const [owner, repo, ...tail] = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (!owner || !repo || !/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo) || tail.length && tail[0] !== 'tree' || tail.some(p => p === '..' || p === '.' || /[\\\0]/.test(p))) throw new Error('Invalid source path');
  if (tail[0] !== 'tree' || !/^[a-f0-9]{40}$/i.test(tail[1] ?? '')) throw new Error('Source must pin a full Git commit');
  return { repository: `${url.origin}/${owner}/${repo.replace(/\.git$/, '')}`, tree: tail.slice(1) };
}

export async function validateCatalog(catalog, directory = root) {
  const schema = JSON.parse(await readFile(resolve(root, 'catalog.schema.json'), 'utf8'));
  if (!Array.isArray(catalog) || catalog.length > 2000) throw new Error('Invalid catalog');
  catalog.forEach(entry => validateSchema(entry, schema));
  const ids = new Set();
  for (const note of catalog) {
    if (ids.has(note.id)) throw new Error(`Duplicate ID: ${note.id}`);
    ids.add(note.id); parseSource(note.source);
    for (const path of [...(note.screenshots ?? []), ...(note.icon?.type === 'svg' ? [note.icon.path] : [])]) {
      if (path.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Invalid asset path');
      const base = await realpath(resolve(directory, 'assets')), file = await realpath(resolve(directory, path));
      const rel = relative(base, file);
      if (isAbsolute(rel) || rel.startsWith('..') || !(await stat(file)).isFile()) throw new Error('Asset escapes assets directory');
      if (note.icon?.path === path && ((await stat(file)).size > 64 * 1024 || !/<svg[\s>]/.test(await readFile(file, 'utf8')))) throw new Error('Invalid SVG icon');
    }
  }
}

export async function validateRemote(catalog) {
  const temp = await mkdtemp(resolve(tmpdir(), 'worka-market-check-'));
  const repos = new Map();
  const git = async (cwd, ...args) => (await execute('git', args, { cwd, timeout: 120_000, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })).stdout.trim();
  try {
    for (const note of catalog) {
      const { repository, tree } = parseSource(note.source);
      if (note.trackingRef) tree[0] = note.trackingRef;
      let repo = repos.get(repository);
      if (!repo) { repo = resolve(temp, String(repos.size)); await git(temp, 'clone', '--bare', '--filter=blob:none', '--', repository + '.git', repo); repos.set(repository, repo); }
      let commit, directory = '.';
      if (!tree.length) commit = await git(repo, 'rev-parse', '--verify', 'HEAD^{commit}');
      else for (let count = tree.length; count > 0 && !commit; count--) {
        const ref = tree.slice(0, count).join('/');
        for (const candidate of [`refs/heads/${ref}`, `refs/tags/${ref}`, ref]) {
          try { commit = await git(repo, 'rev-parse', '--verify', '--end-of-options', candidate + '^{commit}'); directory = tree.slice(count).join('/') || '.'; break; } catch {}
        }
      }
      if (!commit) throw new Error(`Unresolvable source: ${note.id}`);
      const prefix = directory === '.' ? '' : directory + '/';
      if (note.kind === 'desktop') {
        const desktop = JSON.parse(await git(repo, 'show', `${commit}:${prefix}desktop.json`));
        if (desktop.schemaVersion !== 3 || desktop.name !== note.name || !Array.isArray(desktop.notes) || !desktop.notes.length) throw new Error(`Invalid desktop publication: ${note.id}`);
        const keys = new Set();
        for (const member of desktop.notes) {
          if (!member.key || keys.has(member.key) || !member.name || !member.layout) throw new Error(`Invalid desktop member: ${note.id}`);
          keys.add(member.key);
          if (member.source?.repository) {
            parseSource(`${member.source.repository}/tree/${member.source.ref}`);
            if (!member.source.path || member.source.path.split(/[\\/]/).includes('..')) throw new Error('Invalid member source path');
          } else if (member.source) {
            if (!member.source.path || member.source.path.startsWith('/') || member.source.path.split(/[\\/]/).includes('..')) throw new Error('Invalid member source path');
            const manifest = JSON.parse(await git(repo, 'show', `${commit}:${prefix}${member.source.path}/worka-note.json`));
            if (![1, 2].includes(manifest.schemaVersion) || !Array.isArray(manifest.files)) throw new Error('Invalid bundled member publication');
          }
        }
        for (const relation of desktop.relations ?? []) if (!Array.isArray(relation.nodeKeys) || relation.nodeKeys.some(key => !keys.has(key))) throw new Error('Invalid desktop connection');
        console.log(`Verified desktop ${note.id} @ ${commit.slice(0,8)}`);
        continue;
      }
      const manifest = JSON.parse(await git(repo, 'show', `${commit}:${prefix}worka-note.json`));
      if (![1, 2].includes(manifest.schemaVersion) || manifest.name !== note.name || !Array.isArray(manifest.files)) throw new Error(`Publication name/manifest mismatch: ${note.id}`);
      for (const provider of Object.values(manifest.providers ?? {})) parseSource(provider.source);
      for (const path of manifest.files) {
        if (typeof path !== 'string' || path.startsWith('/') || path.includes('\\') || path.split('/').some(p => !p || p === '..' || p === '.')) throw new Error(`Invalid publication path: ${note.id}`);
        const treeEntry = await git(repo, 'ls-tree', commit, '--', prefix + path);
        if (!/^100(?:644|755) blob /.test(treeEntry)) throw new Error(`Missing or non-file publication entry: ${note.id}/${path}`);
      }
      if (manifest.icon?.type === 'svg') {
        if (note.icon?.type !== 'svg' || !!note.icon.monochrome !== !!manifest.icon.monochrome) throw new Error(`Icon mismatch: ${note.id}`);
        const upstream = await git(repo, 'show', `${commit}:${prefix}${manifest.icon.path}`);
        if ((await readFile(resolve(root, note.icon.path), 'utf8')).trim() !== upstream) throw new Error(`Icon snapshot differs: ${note.id}`);
      } else if (JSON.stringify(manifest.icon ?? null) !== JSON.stringify(note.icon ?? null)) throw new Error(`Icon mismatch: ${note.id}`);
      console.log(`Verified ${note.id} @ ${commit.slice(0, 8)}`);
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const catalog = parseJsonl(await readFile(resolve(root, 'catalog.jsonl'), 'utf8'));
  if (process.argv.includes('--write-legacy')) await (await import('node:fs/promises')).writeFile(resolve(root, 'catalog.json'), JSON.stringify(legacyCatalog(catalog), null, 2) + '\n');
  else if (JSON.stringify(JSON.parse(await readFile(resolve(root, 'catalog.json'),'utf8'))) !== JSON.stringify(legacyCatalog(catalog))) throw new Error('catalog.json is generated; run node scripts/validate.mjs --write-legacy');
  await validateCatalog(catalog);
  if (process.argv.includes('--remote')) await validateRemote(catalog);
  console.log(`Validated ${catalog.length} entries`);
}
