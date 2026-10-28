import { useState } from 'react';
import { Button } from '@heroui/react/button';
import { Checkbox } from '@heroui/react/checkbox';
import { TextField } from '@heroui/react/textfield';
import { Label } from '@heroui/react/label';
import { Input } from '@heroui/react/input';
import { EmptyState, NoteSurface, QueryState, defineNoteView, useMutation, useNote } from '@dsh-workbench/react';

function Checklist() {
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
  return <NoteSurface header={<div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
    <TextField value={text} onChange={setText} isDisabled={busy} style={{ flex: 1, minWidth: 0 }}>
      <Label>下一件小事</Label><Input onKeyDown={event => { if (event.key === 'Enter') void submit(); }} />
    </TextField>
    <Button isDisabled={busy || !text.trim()} onPress={() => void submit()}>添加</Button>
  </div>} footer={<>
    {mode === 'expanded' && <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" isDisabled={!page.hasPrevious || page.loading || busy} onPress={page.previous}>上一页</Button>
      <Button variant="secondary" isDisabled={!page.hasNext || page.loading || busy} onPress={page.next}>下一页</Button>
    </div>}
    {error && <p role="alert">{error.message}</p>}
    {unknown && <Button variant="secondary" onPress={() => void retryUnknown()}>核对保存结果</Button>}
  </>}>
    <QueryState query={page}>{data => data.items.length
      ? <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{(mode === 'compact' ? data.items.slice(0, 3) : data.items).map(item =>
        <li key={item.id} style={{ padding: '6px 0', overflowWrap: 'anywhere' }}><Checkbox isSelected={item.done} isDisabled={busy}
          onChange={done => void setDone.mutate({ id: item.id, done })}><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>{item.text}</Checkbox.Content></Checkbox></li>)}</ul>
      : <EmptyState title="还没有事项" description="先写下一件。" />}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Checklist }), expanded: async () => ({ default: Checklist }) });
