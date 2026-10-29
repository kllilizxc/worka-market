import { defineMessages } from '@dsh-workbench/runtime/view';
import { useState } from 'react';
import { Button } from '@heroui/react/button';
import { Checkbox } from '@heroui/react/checkbox';
import { TextField } from '@heroui/react/textfield';
import { Label } from '@heroui/react/label';
import { Input } from '@heroui/react/input';
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
    <TextField value={text} onChange={setText} isDisabled={busy} style={{ flex: 1, minWidth: 0 }}>
      <Label>{copy.nextItem}</Label><Input onKeyDown={event => { if (event.key === 'Enter') void submit(); }} />
    </TextField>
    <Button isDisabled={busy || !text.trim()} onPress={() => void submit()}>{copy.add}</Button>
  </Toolbar></>} footer={<>
    {mode === 'expanded' && <Toolbar>
      <Button variant="secondary" isDisabled={!page.hasPrevious || page.loading || busy} onPress={page.previous}>{copy.previous}</Button>
      <Button variant="secondary" isDisabled={!page.hasNext || page.loading || busy} onPress={page.next}>{copy.next}</Button>
    </Toolbar>}
    {error && <p role="alert">{error.message}</p>}
    {unknown && <Button variant="secondary" onPress={() => void retryUnknown()}>{copy.verify}</Button>}
  </>}>
    <QueryState query={page}>{data => data.items.length
      ? <List>{(mode === 'compact' ? data.items.slice(0, 3) : data.items).map(item =>
        <ListRow key={item.id} title={<Checkbox isSelected={item.done} isDisabled={busy}
          onChange={done => void setDone.mutate({ id: item.id, done })}><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>{item.text}</Checkbox.Content></Checkbox>} />)}</List>
      : <EmptyState title={copy.empty} description={copy.emptyDescription} />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Checklist }), expanded: async () => ({ default: Checklist }) });
