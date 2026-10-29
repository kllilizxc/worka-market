import { defineMessages } from '@dsh-workbench/runtime/view';
import { NoteSurface, NoteHeader, Section, useMessages, defineNoteView, useNote } from '@dsh-workbench/react';

const messages = defineMessages('zh-CN', {hello: (name: string) => `你好，${name}`, "welcome": "欢迎来到你的桌面", "calm": "今天也给自己留一点从容。", "configure": "在便笺设置中填写 name，换成你的专属问候。"}, { en: {hello: (name: string) => `Hello, ${name}`, "welcome": "Welcome to your desktop", "calm": "Leave yourself a little breathing room today.", "configure": "Set name in note settings to personalize your greeting."} });

function Greeting() {
  const copy = useMessages(messages);
  const { config } = useNote<typeof import('./actions')>();
  return <NoteSurface header={<NoteHeader />}>
    <Section title={config.name ? copy.hello(config.name) : copy.welcome}>
    <p>{config.name ? copy.calm : copy.configure}</p></Section>
  </NoteSurface>;
}

export default defineNoteView({
  compact: async () => ({ default: Greeting }), expanded: async () => ({ default: Greeting }),
  prerequisites: { configurationInView: true },
});
