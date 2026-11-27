import { defineMessages } from '@dsh-workbench/runtime/view';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteSurface, NoteHeader, Section, QueryState, defineNoteView, useMutation, useNote, useUi } from '@dsh-workbench/react';

const messages = defineMessages('zh-CN', { hello: (name: string) => `你好，${name}`, welcome: '欢迎来到你的桌面', calm: '今天也给自己留一点从容。', configure: '输入你的称呼，换成专属问候。', save: '保存' }, { en: { hello: (name: string) => `Hello, ${name}`, welcome: 'Welcome to your desktop', calm: 'Leave yourself a little breathing room today.', configure: 'Enter your name to personalize your greeting.', save: 'Save' } });

function Greeting() {
  const copy = useUi(messages);
  const { mode, mutations, useQuery } = useNote<typeof import('./actions')>();
  const current = useQuery('greeting');
  const save = useMutation(mutations.setName, { query: current });
  const [draft, setDraft] = useState('');
  return <NoteSurface header={<NoteHeader />}>
    <QueryState query={current}>{data => (
      <Section title={data.name ? copy.hello(data.name) : copy.welcome}>
        <p className="text-sm text-muted-foreground">{data.name ? copy.calm : copy.configure}</p>
        {mode === 'expanded' && (
          <div className="flex items-center gap-2 pt-3">
            <Input value={draft} placeholder={data.name || 'Name'} onChange={e => setDraft(e.currentTarget.value)} />
            <Button disabled={save.status === 'pending'} onClick={() => void save.mutate({ name: draft })}>{copy.save}</Button>
          </div>
        )}
      </Section>
    )}</QueryState>
  </NoteSurface>;
}

export default defineNoteView({ compact: async () => ({ default: Greeting }), expanded: async () => ({ default: Greeting }) });
