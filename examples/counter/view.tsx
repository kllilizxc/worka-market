import { defineMessages } from '@dsh-workbench/runtime/view';
import { Button } from '@/components/ui/button';
import { NoteSurface, NoteHeader, HeroStat, QueryState, defineNoteView, useMutation, useNote, useUi } from '@dsh-workbench/react';

const messages = defineMessages('zh-CN', { increment: '加一', reset: '清零', verify: '核对保存结果', label: '每一个小进展都算数' }, { en: { increment: 'Add one', reset: 'Reset', verify: 'Check saved result', label: 'Every small step counts' } });

function Counter() {
  const copy = useUi(messages);
  const { mutations, useQuery } = useNote<typeof import('./actions')>();
  const count = useQuery('count');
  const increment = useMutation(mutations.increment, { query: count });
  const reset = useMutation(mutations.reset, { query: count });
  const busy = [increment.status, reset.status].some(status => status === 'pending' || status === 'unknown');
  const error = increment.error ?? reset.error;
  const unknown = increment.status === 'unknown' ? increment : reset.status === 'unknown' ? reset : undefined;
  return <NoteSurface header={<NoteHeader />} footer={<div className="flex items-center gap-2">
    <Button disabled={busy} onClick={() => void increment.mutate({})}>{copy.increment}</Button>
    <Button variant="secondary" disabled={busy} onClick={() => void reset.mutate({})}>{copy.reset}</Button>
    {unknown && <Button variant="secondary" onClick={() => void unknown.retry()}>{copy.verify}</Button>}
    {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
  </div>}>
    <QueryState query={count}>{value => <HeroStat label={copy.label} value={value.count} />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Counter }), expanded: async () => ({ default: Counter }) });
