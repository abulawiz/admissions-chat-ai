import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/knowledge"); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not load"); setItems(j.items || []);
    } catch (e: any) { toast.error(e.message || "Could not load knowledge"); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async (e?: any) => {
    if (!editing || !editing.title || !editing.content) return toast.error("Title and content required");
    setSaving(true);
    try {
      const r = await fetch("/api/admin/knowledge", { method: editing.id ? "POST" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not save"); toast.success("Saved"); setEditing(null); await load();
    } catch (e: any) { toast.error(e.message || "Save failed"); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const r = await fetch("/api/admin/knowledge", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!r.ok) { const j = await r.json().catch(()=>({})); throw new Error(j.error || "Delete failed"); }
      toast.success("Deleted"); await load();
    } catch (e: any) { toast.error(e.message || "Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Knowledge base</h3><div><Button onClick={() => setEditing({ title: "", content: "", tags: [] })}>Create</Button></div></div>
      {editing && <Card className="mb-4"><CardHeader><CardTitle>{editing.id ? "Edit" : "New"}</CardTitle></CardHeader><CardContent><div className="space-y-2"><Input value={editing.title} onChange={(e)=>setEditing({...editing, title: e.target.value})} placeholder="Title" /><textarea value={editing.content} onChange={(e)=>setEditing({...editing, content: e.target.value})} className="w-full rounded-md border p-2" rows={8} placeholder="Content" /><div className="flex gap-2 justify-end"><Button variant="ghost" onClick={()=>setEditing(null)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div></div></CardContent></Card>}
      <div className="grid gap-3">
        {items.map((it:any)=> <Card key={it.id}><CardHeader><CardTitle>{it.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{(it.content||"").slice(0,300)}{it.content && it.content.length>300?"…":""}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={()=>setEditing(it)}>Edit</Button><Button size="sm" variant="destructive" onClick={()=>remove(it.id)}>Delete</Button><Button size="sm" onClick={async ()=>{ try { const r = await fetch("/api/admin/knowledge/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: it.id, text: it.content }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error||"Ingest failed"); toast.success("Ingest started"); } catch(e:any){ toast.error(e.message||"Ingest failed"); } }}>Ingest (embed)</Button></div></CardContent></Card>)}
      </div>
    </div>
  );
}
