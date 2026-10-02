import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, parseSource } from './validate.mjs';

const entry = { id: 'example/note', name: 'Note', author: 'Example', description: 'A note', source: 'https://github.com/example/notes' };
test('accepts a minimal entry and rejects duplicate stable IDs', async () => {
  await validateCatalog({ schemaVersion: 1, notes: [entry] });
  await assert.rejects(validateCatalog({ schemaVersion: 1, notes: [entry, entry] }), /Duplicate/);
});
test('rejects unknown format versions, fields and empty metadata', async () => {
  for (const value of [{ schemaVersion: 2, notes: [] }, { schemaVersion: 1, notes: [{ ...entry, name: ' ' }] }, { schemaVersion: 1, notes: [{ ...entry, token: 'unwanted' }] }]) await assert.rejects(validateCatalog(value));
});
test('rejects credentials, external hosts and asset traversal', async () => {
  assert.throws(() => parseSource('https://user:secret@github.com/a/b'));
  assert.throws(() => parseSource('https://elsewhere.example/a/b'));
  await assert.rejects(validateCatalog({ schemaVersion: 1, notes: [{ ...entry, screenshots: ['assets/../secret.png'] }] }));
  assert.deepEqual(parseSource('https://github.com/a/b/tree/release/v1/notes/test'), { repository: 'https://github.com/a/b', tree: ['release', 'v1', 'notes', 'test'] });
});
