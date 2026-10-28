import { defineNote, z } from '@dsh-workbench/runtime';

export const note = defineNote({
  collections: { counters: { schema: z.object({ count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }) } },
  update: { dataVersion: 'example-counter@1' },
});
