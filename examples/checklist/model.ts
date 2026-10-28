import { defineNote, z } from '@dsh-workbench/runtime';

export const note = defineNote({
  collections: { items: { schema: z.object({ text: z.string().min(1).max(500), done: z.boolean() }) } },
  update: { dataVersion: 'example-checklist@1' },
});
