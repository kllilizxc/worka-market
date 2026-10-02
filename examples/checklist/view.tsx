import { useState } from "react";
import { Button, TextField, Label, Input, Checkbox } from "@heroui/react";
import type { WidgetProps } from "@dsh-workbench/react";
type Item={id:string;text:string;done:boolean};
export default function Checklist({data,updateData}:WidgetProps<{items:Item[]}>) {
  const [text,setText]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function save(items:Item[],clear=false) {setBusy(true);try {await updateData({items});if(clear)setText("");setError("");}catch(e){setError(String(e));}finally{setBusy(false);}}
  const items=data.items??[];
  return <section style={{padding:16,color:"var(--wb-ink)"}}><TextField value={text} onChange={setText} isDisabled={busy}><Label>下一件小事</Label><Input /></TextField><Button style={{marginTop:8}} isDisabled={busy||!text.trim()} onPress={()=>void save([...items,{id:crypto.randomUUID(),text:text.trim(),done:false}],true)}>添加</Button><ul style={{listStyle:"none",padding:0}}>{items.map(item=><li key={item.id} style={{padding:"6px 0",overflowWrap:"anywhere"}}><Checkbox isSelected={item.done} isDisabled={busy} onChange={done=>void save(items.map(row=>row.id===item.id?{...row,done}:row))}><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>{item.text}</Checkbox.Content></Checkbox></li>)}</ul>{!items.length&&<p>还没有事项，先写下一件。</p>}{error&&<p role="alert">{error}</p>}</section>;
}
