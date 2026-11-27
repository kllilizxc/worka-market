import { defineNote, z } from '@dsh-workbench/runtime';

export const greetingStateSchema = z.object({ name: z.string().trim().max(100) });
export const note = defineNote({
  state: {
    schema: greetingStateSchema,
    initial: { name: '' },
  },
  update: { dataVersion: 'example-greeting@2' },
});
