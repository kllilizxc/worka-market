import { defineNote, z } from '@dsh-workbench/runtime';

export const note = defineNote({
  state: {
    schema: z.object({ count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }),
    initial: { count: 0 },
  },
  update: { dataVersion: 'example-counter@2' },
});
