import { z } from '@dsh-workbench/runtime';
import { greetingStateSchema, note } from './model';
export { note } from './model';

export const greeting = note.query({ description: '读取当前问候称呼。', output: greetingStateSchema }, ctx => ctx.state.get());
export const setName = note.mutation({ description: '更新问候称呼。', input: z.object({ name: z.string().trim().max(100) }), output: greetingStateSchema }, async (ctx, { name }) => {
  await ctx.state.put({ name });
  return { name };
});
