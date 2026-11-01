import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
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
      if (!schema.properties?.[key]) { if (schema.additionalProperties === false) fail(); else if (typeof schema.additionalProperties === 'object') validateSchema(item,schema.additionalProperties,path+'.'+key); }
      else validateSchema(item, schema.properties[key], `${path}.${key}`);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > (schema.maxItems ?? Infinity)) fail();
    value.forEach((item, index) => validateSchema(item, schema.items, `${path}[${index}]`));
  } else if (schema.type === 'string') {
    if (typeof value !== 'string' || value.trim().length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? Infinity) || schema.pattern && !new RegExp(schema.pattern).test(value)) fail();
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') fail();
}

const schema = JSON.parse(await readFile(resolve(root,'catalog.schema.json'),'utf8'));
export function validateCatalog(entries) {
  const ids = new Set(), packages = new Set();
  for (const row of entries) {
    validateSchema(row,schema);
    const url = new URL(row.repository);
    if (!config.sourceOrigins.includes(url.origin) || url.href !== row.repository || url.pathname.split('/').length !== 3) throw new Error('Invalid repository');
    if (row.path !== '.' && (/[\\:\0]/.test(row.path) || row.path.split('/').some(p=>!p || p==='.' || p==='..'))) throw new Error('Invalid package path');
    const key = row.repository.toLowerCase()+'/'+row.path;
    if (ids.has(row.id) || packages.has(key)) throw new Error('Duplicate listing ID or package');
    ids.add(row.id); packages.add(key);
  }
}
export async function validateRemote(entries) {
  const temp = await mkdtemp(resolve(tmpdir(),'worka-market-paths-')), repos = new Map();
  const git = async (args, cwd) => (await execute('git',args,{cwd,timeout:120_000,env:{...process.env,GIT_TERMINAL_PROMPT:'0'}})).stdout.trim();
  try {
    for (const row of entries) {
      let dir = repos.get(row.repository);
      if (!dir) {
        dir = resolve(temp,String(repos.size));
        const refs = await git(['ls-remote','--sort=-version:refname','--tags','--refs','--',row.repository,'refs/tags/v*']);
        const tag = refs.split('\n').map(line=>line.split('\t')[1]).find(ref=>/^refs\/tags\/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(ref ?? ''));
        await git(['init','--bare','--quiet',dir]);
        await git(['fetch','--quiet','--depth=1','--filter=blob:none','--',row.repository,tag ?? 'HEAD'],dir);
        repos.set(row.repository,dir);
      }
      const files = row.kind === 'note' ? ['worka-note.json','worka-prebuilt/manifest.json'] : ['desktop.json'];
      for (const file of files) {
        const path = row.path === '.' ? file : row.path+'/'+file;
        if (await git(['cat-file','-t','FETCH_HEAD:'+path],dir) !== 'blob') throw new Error('Missing package file: '+row.id+'/'+path);
      }
    }
  } finally { await rm(temp,{recursive:true,force:true}); }
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const entries = parseJsonl(await readFile(resolve(root,'catalog-v4.jsonl'),'utf8'));
  validateCatalog(entries);
  if (process.argv.includes('--remote')) await validateRemote(entries);
  console.log('Validated '+entries.length+' package links.');
}
