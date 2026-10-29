import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSchema, parseJsonl } from './validate.mjs';

test('optional English listing text has strict authored fields', async () => {
  const schema = JSON.parse(await readFile(new URL('../catalog.schema.json', import.meta.url)));
  const fixtures = parseJsonl(await readFile(new URL('../tests/fixtures/catalog-locales.jsonl', import.meta.url), 'utf8'));
  assert.equal(fixtures.length, 3);
  for (const row of fixtures) validateSchema(row.locales, schema.properties.locales);
  for (const locales of [{en:{name:'Counter'}}, {en:{name:'',description:'x'}}, {en:{name:'Counter',description:'x',extra:'x'}}])
    assert.throws(() => validateSchema(locales, schema.properties.locales));
});
