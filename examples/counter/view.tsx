import { defineMessages } from '@dsh-workbench/runtime/view';
import { Button } from '@/components/ui/button';
import { NoteSurface, NoteHeader, Toolbar, useMessages, QueryState, Stat, defineNoteView, useMutation, useNote } from '@dsh-workbench/react';

const messages = defineMessages('zh-CN', {"increment": "加一", "reset": "清零", "verify": "核对保存结果", "label": "每一个小进展都算数"}, { en: {"increment": "Add one", "reset": "Reset", "verify": "Check saved result", "label": "Every small step counts"} });

function Counter() {
  const copy = useMessages(messages);
  const { mutations, useQuery } = useNote<typeof import('./actions')>();
  const count = useQuery('count');
  const increment = useMutation(mutations.increment, { query: count });
  const reset = useMutation(mutations.reset, { query: count });
  const busy = [increment.status, reset.status].some(status => status === 'pending' || status === 'unknown');
  const error = increment.error ?? reset.error;
  const unknown = increment.status === 'unknown' ? increment : reset.status === 'unknown' ? reset : undefined;
  return <NoteSurface header={<NoteHeader />} footer={<Toolbar>
    <Button disabled={busy} onClick={() => void increment.mutate({})}>{copy.increment}</Button>
    <Button variant="secondary" disabled={busy} onClick={() => void reset.mutate({})}>{copy.reset}</Button>
    {unknown && <Button variant="secondary" onClick={() => void unknown.retry()}>{copy.verify}</Button>}
    {error && <p role="alert">{error.message}</p>}
  </Toolbar>}>
    <QueryState query={count}>{value => <Stat label={copy.label} value={value.count} />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Counter }), expanded: async () => ({ default: Counter }) });
