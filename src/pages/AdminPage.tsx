import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Bell, BookOpen, FileText, LayoutDashboard, MessageSquare, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UsersPage from "./Admin/UsersPage";
import Mailbox from "./Admin/Mailbox";
import KnowledgePage from "./Admin/KnowledgePage";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Conversations", icon: MessageSquare },
  { label: "Knowledge", icon: BookOpen },
  { label: "Mailbox", icon: FileText },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, applicants: 0, messages: 0, files: 0 });
  const [uploading, setUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, navigate, user]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [convRes, msgRes, filesRes] = await Promise.all([
        supabase.from("conversations").select("id, title, user_id, updated_at").order("updated_at", { ascending: false }).limit(100),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }),
        supabase.storage.from("admission-documents").list(user.id, { limit: 100 }),
      ]);
      if (convRes.error) throw convRes.error;
      const rows = convRes.data ?? [];
      setConversations(rows.slice(0, 8).map((item: any) => ({ id: item.id, title: item.title || "Untitled", user: item.user_id ? `${item.user_id.slice(0, 8)}…` : "Unknown", time: item.updated_at ? new Date(item.updated_at).toLocaleString() : "-" })));
      setMetrics({ total: rows.length, applicants: new Set(rows.map((r:any)=>r.user_id)).size, messages: msgRes.count ?? 0, files: filesRes.data?.length ?? 0 });
    } catch (e) { console.error(e); toast.error("Failed to load dashboard"); }
    setDataLoading(false);
  }, [user]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("admin-dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => void loadDashboard())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => void loadDashboard());
    void channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadDashboard, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return conversations; return conversations.filter((item) => item.title.toLowerCase().includes(q) || item.user.toLowerCase().includes(q));
  }, [conversations, query]);

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Files must be 10 MB or smaller.");
    setUploading(true);
    const safeName = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    try {
      const { error } = await supabase.storage.from("admission-documents").upload(safeName, file, { upsert: false, contentType: file.type || "application/octet-stream" });
      if (!error) { toast.success("Uploaded"); void loadDashboard(); setUploading(false); return; }
      // fallback to server
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error("Session expired");
      const body = new FormData(); body.append("file", file); body.append("path", safeName);
      const r = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Upload failed"); toast.success("Uploaded"); void loadDashboard();
    } catch (err: any) { console.error(err); toast.error(err.message || "Upload failed"); }
    setUploading(false);
  };

  if (loading || !user) return <div className="min-h-[70vh] flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8f7] flex">
      <aside className="hidden lg:flex w-72 shrink-0 bg-primary-dark text-primary-foreground flex-col shadow-xl">
        <div className="h-16 px-6 flex items-center border-b border-primary-foreground/10"><Link to="/" className="font-display text-lg font-bold">NSUK Admin</Link></div>
        <nav className="p-4 space-y-2">{nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded ${active === label ? "bg-primary-foreground/10" : ""}`}><Icon className="size-4" />{label}</button>)}</nav>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8 gap-4"><div className="flex items-center gap-3 min-w-0"><h1 className="text-lg font-semibold">Admin dashboard</h1><Badge variant="outline" className="truncate hidden sm:inline-flex">{user.email ?? user.id}</Badge></div><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={uploadFile} className="hidden" /><Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>Upload</Button></div></header>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          {active === "Overview" && <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{new Date().toLocaleDateString()}</p><h2 className="text-3xl font-bold">Overview</h2></div><Input className="sm:max-w-xs" placeholder="Search conversations" value={query} onChange={(e)=>setQuery(e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[["Total conversations", metrics.total], ["Applicants", metrics.applicants], ["Messages", metrics.messages], ["Files", metrics.files]].map(([label, value]) => <Card key={label}><CardHeader><CardTitle>{label}</CardTitle><CardDescription>{dataLoading ? "—" : (Number(value) || 0).toLocaleString()}</CardDescription></CardHeader></Card>)}</div>
            <Card><CardHeader><CardTitle>Recent conversations</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>User</TableHead><TableHead>Time</TableHead></TableRow></TableHeader><TableBody>{filtered.map((c) => <TableRow key={c.id}><TableCell>{c.title}</TableCell><TableCell>{c.user}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}{!dataLoading && filtered.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No conversations.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
          </>}

          {active === "Users" && <UsersPage />}
          {active === "Mailbox" && <Mailbox />}
          {active === "Knowledge" && <KnowledgePage />}

        </div>
      </main>
    </div>
  );
}
