import { useState } from "react";
import { Button } from "@heroui/react";
import type { WidgetProps } from "@dsh-workbench/react";
export default function Counter({ data, updateData }: WidgetProps<{count:number}>) {
  const [busy,setBusy]=useState(false), [error,setError]=useState("");
  async function change(count:number) { setBusy(true); try { await updateData({count}); setError(""); } catch(e) { setError(String(e)); } finally {setBusy(false);} }
  return <section style={{padding:20,color:"var(--wb-ink)"}}><p>每一个小进展都算数</p><strong aria-live="polite" style={{fontSize:48}}>{data.count ?? 0}</strong><div style={{display:"flex",gap:8,marginTop:12}}><Button isDisabled={busy} onPress={()=>void change((data.count??0)+1)}>加一</Button><Button variant="secondary" isDisabled={busy} onPress={()=>void change(0)}>清零</Button></div>{error&&<p role="alert">{error}</p>}</section>;
}
