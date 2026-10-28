import { Button } from '@heroui/react/button';
import { NoteSurface, QueryState, Stat, defineNoteView, useMutation, useNote } from '@dsh-workbench/react';

function Counter() {
  const { mutations, useQuery } = useNote<typeof import('./actions')>();
  const count = useQuery('count');
  const increment = useMutation(mutations.increment, { query: count });
  const reset = useMutation(mutations.reset, { query: count });
  const busy = [increment.status, reset.status].some(status => status === 'pending' || status === 'unknown');
  const error = increment.error ?? reset.error;
  const unknown = increment.status === 'unknown' ? increment : reset.status === 'unknown' ? reset : undefined;
  return <NoteSurface footer={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <Button isDisabled={busy} onPress={() => void increment.mutate({})}>加一</Button>
    <Button variant="secondary" isDisabled={busy} onPress={() => void reset.mutate({})}>清零</Button>
    {unknown && <Button variant="secondary" onPress={() => void unknown.retry()}>核对保存结果</Button>}
    {error && <p role="alert">{error.message}</p>}
  </div>}>
    <QueryState query={count}>{value => <Stat label="每一个小进展都算数" value={value.count} />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Counter }), expanded: async () => ({ default: Counter }) });
