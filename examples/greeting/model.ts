import { defineNote, z } from '@dsh-workbench/runtime';

export const note = defineNote({
  config: { schema: z.object({ name: z.string().trim().min(1).max(100) }), defaults: {} },
  update: { dataVersion: 'example-greeting@1' },
});
