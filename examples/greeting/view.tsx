import { NoteSurface, defineNoteView, useNote } from '@dsh-workbench/react';

function Greeting() {
  const { config } = useNote<typeof import('./actions')>();
  return <NoteSurface>
    <div style={{ fontSize: 'var(--ui-text-heading)' }}>👋</div>
    <h2>{config.name ? `你好，${config.name}` : '欢迎来到你的桌面'}</h2>
    <p>{config.name ? '今天也给自己留一点从容。' : '在便笺设置中填写 name，换成你的专属问候。'}</p>
  </NoteSurface>;
}

export default defineNoteView({
  compact: async () => ({ default: Greeting }), expanded: async () => ({ default: Greeting }),
  prerequisites: { configurationInView: true },
});
