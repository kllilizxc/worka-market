import { z } from '@dsh-workbench/runtime';
import { note } from './model';
export { note } from './model';

const output = z.object({ count: z.number().int().nonnegative() });
export const count = note.query({ description: '读取当前计数。', output }, ctx => ctx.state.get());
export const increment = note.mutation({ description: '计数加一。', output }, async ctx => {
  const { count: current } = await ctx.state.get();
  if (current >= Number.MAX_SAFE_INTEGER) throw new Error('计数已达到上限');
  await ctx.state.put({ count: current + 1 });
  return { count: current + 1 };
});
export const reset = note.mutation({ description: '计数清零。', output }, async ctx => {
  await ctx.state.put({ count: 0 });
  return { count: 0 };
});
