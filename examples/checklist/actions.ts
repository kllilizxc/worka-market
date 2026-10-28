import { pageInput, z } from '@dsh-workbench/runtime';
import { note } from './model';
export { note } from './model';

const fields = ['text', 'done'] as const;
export const list = note.query({
  description: '分页读取清单事项。', input: pageInput, output: note.collections.items.pageSchema(fields),
}, (ctx, input) => ctx.db.page('items', { cursor: input.cursor, select: fields }));

export const add = note.mutation({
  input: z.object({ text: z.string().trim().min(1).max(500) }), output: z.object({ id: z.string() }),
}, async (ctx, { text }) => ({ id: await ctx.db.insert('items', { text, done: false }) }));

export const setDone = note.mutation({
  input: z.object({ id: z.string().min(1), done: z.boolean() }), output: z.object({ id: z.string() }),
}, async (ctx, { id, done }) => {
  if (!await ctx.db.get('items', id)) throw new Error('事项不存在');
  await ctx.db.patch('items', id, { done });
  return { id };
});
