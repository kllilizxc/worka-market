import { defineMessages } from '@dsh-workbench/runtime/view';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmptyState, List, ListRow, NoteSurface, NoteHeader, Toolbar, useMessages, QueryState, defineNoteView, useMutation, useNote } from '@dsh-workbench/react';

const messages = defineMessages('zh-CN', {"nextItem": "下一件小事", "add": "添加", "previous": "上一页", "next": "下一页", "verify": "核对保存结果", "empty": "还没有事项", "emptyDescription": "先写下一件。"}, { en: {"nextItem": "Next small task", "add": "Add", "previous": "Previous", "next": "Next", "verify": "Check saved result", "empty": "No tasks yet", "emptyDescription": "Write down one thing to do."} });

function Checklist() {
  const copy = useMessages(messages);
  const [text, setText] = useState('');
  const { mode, mutations, usePagedQuery } = useNote<typeof import('./actions')>();
  const page = usePagedQuery('list');
  const add = useMutation(mutations.add, { query: page });
  const setDone = useMutation(mutations.setDone, { query: page });
  const busy = [add.status, setDone.status].some(status => status === 'pending' || status === 'unknown');
  const error = add.error ?? setDone.error;
  const unknown = add.status === 'unknown' ? add : setDone.status === 'unknown' ? setDone : undefined;
  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    if (await add.mutate({ text: value })) { setText(''); page.reset(); }
  }
  async function retryUnknown() {
    if (unknown === add) { if (await add.retry()) { setText(''); page.reset(); } }
    else if (unknown) await unknown.retry();
  }
  return <NoteSurface header={<><NoteHeader /><Toolbar>
    <div style={{ display: 'grid', gap: 4, flex: 1, minWidth: 0 }}>
      <Label htmlFor="checklist-next">{copy.nextItem}</Label>
      <Input id="checklist-next" value={text} disabled={busy} onChange={event => setText(event.currentTarget.value)} onKeyDown={event => { if (event.key === 'Enter') void submit(); }} />
    </div>
    <Button disabled={busy || !text.trim()} onClick={() => void submit()}>{copy.add}</Button>
  </Toolbar></>} footer={<>
    {mode === 'expanded' && <Toolbar>
      <Button variant="secondary" disabled={!page.hasPrevious || page.loading || busy} onClick={page.previous}>{copy.previous}</Button>
      <Button variant="secondary" disabled={!page.hasNext || page.loading || busy} onClick={page.next}>{copy.next}</Button>
    </Toolbar>}
    {error && <p role="alert">{error.message}</p>}
    {unknown && <Button variant="secondary" onClick={() => void retryUnknown()}>{copy.verify}</Button>}
  </>}>
    <QueryState query={page}>{data => data.items.length
      ? <List>{(mode === 'compact' ? data.items.slice(0, 3) : data.items).map(item =>
        <ListRow key={item.id} title={<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Checkbox checked={item.done} disabled={busy}
          onCheckedChange={done => void setDone.mutate({ id: item.id, done: done === true })} />{item.text}</label>} />)}</List>
      : <EmptyState title={copy.empty} description={copy.emptyDescription} />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Checklist }), expanded: async () => ({ default: Checklist }) });
