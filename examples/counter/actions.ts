import { z } from '@dsh-workbench/runtime';
import { note } from './model';
export { note } from './model';

const output = z.object({ count: z.number().int().nonnegative() });
export const count = note.query({ description: '读取当前计数。', output }, async ctx => ({ count: (await ctx.db.get('counters', 'root'))?.count ?? 0 }));
export const increment = note.mutation({ output }, async ctx => {
  const count = (await ctx.db.get('counters', 'root'))?.count ?? 0;
  if (count >= Number.MAX_SAFE_INTEGER) throw new Error('计数已达到上限');
  await ctx.db.put('counters', 'root', { count: count + 1 });
  return { count: count + 1 };
});
export const reset = note.mutation({ output }, async ctx => {
  await ctx.db.put('counters', 'root', { count: 0 });
  return { count: 0 };
});
