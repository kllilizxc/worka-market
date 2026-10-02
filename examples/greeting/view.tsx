import { useNoteConfig } from "@dsh-workbench/react";
export default function Greeting() {
  const config=useNoteConfig<{name?:string}>();
  return <section style={{padding:24,color:"var(--wb-ink)"}}><div style={{fontSize:36}}>👋</div><h2>{config?.name ? `你好，${config.name}` : "欢迎来到你的桌面"}</h2><p>{config?.name ? "今天也给自己留一点从容。" : "在便笺设置中填写 name，换成你的专属问候。"}</p></section>;
}
