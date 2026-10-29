import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSchema, parseJsonl } from './validate.mjs';

// A focused authoring assertion, not a second schema for the v3 release contract.
const bundle = {
  type: 'object', additionalProperties: false, required: ['name', 'description'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 300 },
  },
};
function validateLocales(locales) {
  if (locales === undefined) return;
  assert.ok(locales && typeof locales === 'object' && !Array.isArray(locales));
  for (const [locale, value] of Object.entries(locales)) {
    assert.equal(Intl.getCanonicalLocales(locale)[0], locale);
    validateSchema(value, bundle);
  }
}
test('actual catalog examples keep valid optional listing text', async () => {
  const rows = parseJsonl(await readFile(new URL('../catalog-v3.jsonl', import.meta.url), 'utf8'));
  const examples = rows.filter(row => ['worka/checklist', 'worka/counter', 'worka/greeting'].includes(row.id));
  assert.equal(examples.length, 3);
  assert.equal(new Set(examples.map(row => row.id)).size, 3);
  for (const row of examples) {
    assert.equal(row.schemaVersion, 3);
    validateLocales(row.locales);
  }
});
test('optional locale authoring fields are strict without copying release rows', () => {
  validateLocales(undefined);
  validateLocales({ en: { name: 'Counter', description: 'Count small steps' } });
  for (const locales of [{ en: { name: 'Counter' } }, { en: { name: '', description: 'x' } }, { en: { name: 'Counter', description: 'x', extra: 'x' } }])
    assert.throws(() => validateLocales(locales));
});
