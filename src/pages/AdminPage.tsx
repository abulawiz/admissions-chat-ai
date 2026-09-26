import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, LayoutDashboard, MessageSquare, Send, Settings, Upload, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET = "admission-documents";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Conversations", icon: MessageSquare },
  { label: "Knowledge files", icon: FileText },
  { label: "Applicants", icon: Users },
  { label: "Settings", icon: Settings },
];

type Conversation = { id: string; title: string; user: string; time: string };

export default function AdminPage() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, applicants: 0, messages: 0, files: 0 });
  const [uploading, setUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [email, setEmail] = useState({ to: "", subject: "", message: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, navigate, user]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [convRes, msgRes, filesRes] = await Promise.all([
        supabase.from("conversations").select("id, title, user_id, updated_at").order("updated_at", { ascending: false }).limit(100),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }),
        supabase.storage.from(BUCKET).list(user.id, { limit: 100, offset: 0, sortBy: { column: "name", order: "desc" } }),
      ]);
      if (convRes.error) throw convRes.error;
      const rows = convRes.data ?? [];
      setConversations(rows.slice(0, 8).map((item) => ({
        id: item.id,
        title: item.title || "Untitled conversation",
        user: item.user_id ? `${item.user_id.slice(0, 8)}…` : "Unknown",
        time: item.updated_at ? new Date(item.updated_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "-",
      })));
      setMetrics({ total: rows.length, applicants: new Set(rows.map((row) => row.user_id)).size, messages: msgRes.count ?? 0, files: filesRes.data?.length ?? 0 });
    } catch (error) {
      console.error("loadDashboard error", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("admin-dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => void loadDashboard())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => void loadDashboard())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => void loadDashboard());
    void channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadDashboard, user]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((item) => item.title.toLowerCase().includes(normalized) || item.user.toLowerCase().includes(normalized));
  }, [conversations, query]);

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Files must be 10 MB or smaller.");
      return;
    }
    setUploading(true);
    const safeName = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    try {
      const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, { upsert: false, contentType: file.type || "application/octet-stream", cacheControl: "3600" });
      if (!error) {
        toast.success(`${file.name} uploaded.`);
        void loadDashboard();
        return;
      }
      // Use the authenticated server fallback only when the bucket is unavailable to the browser.
      if (error.status !== 404 && !/bucket|permission|row-level security/i.test(error.message || "")) throw error;
      const token = session?.access_token;
      if (!token) throw new Error("Your session expired. Please sign in again.");
      const body = new FormData();
      body.append("file", file);
      body.append("path", safeName);
      const response = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Server upload failed");
      toast.success(`${file.name} uploaded.`);
      void loadDashboard();
    } catch (error) {
      console.error("upload error", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSendEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!session?.access_token) return toast.error("Your session expired. Please sign in again.");
    setEmailSending(true);
    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ to: email.to, subject: email.subject, text: email.message }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Email failed to send");
      toast.success("Email sent");
      setEmail({ to: "", subject: "", message: "" });
      setEmailOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email failed to send");
    } finally { setEmailSending(false); }
  };

  if (loading || !user) return <div className="min-h-[70vh] flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;

  return <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8f7] flex">
    <aside className="hidden lg:flex w-72 shrink-0 bg-primary-dark text-primary-foreground flex-col shadow-xl">
      <div className="h-16 px-6 flex items-center border-b border-primary-foreground/10"><Link to="/" className="font-display text-lg font-bold">NSUK Admin</Link></div>
      <nav className="p-4 space-y-2">{nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded ${active === label ? "bg-primary-foreground/10" : ""}`}><Icon className="size-4" />{label}</button>)}</nav>
    </aside>
    <main className="flex-1 min-w-0">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8 gap-4"><div className="flex items-center gap-3 min-w-0"><h1 className="text-lg font-semibold">Admin dashboard</h1><Badge variant="outline" className="truncate hidden sm:inline-flex">{user.email ?? user.id}</Badge></div><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={uploadFile} className="hidden" /><Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 size-4" />{uploading ? "Uploading…" : "Upload"}</Button><Button size="sm" onClick={() => setEmailOpen(true)}><Send className="mr-2 size-4" />Send email</Button></div></header>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
        {emailOpen && <Card><CardHeader><CardTitle>Send email</CardTitle><CardDescription>Send a message through the configured email provider.</CardDescription></CardHeader><CardContent><form onSubmit={handleSendEmail} className="space-y-3"><Input type="email" required placeholder="Recipient email" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} /><Input required placeholder="Subject" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} /><textarea required minLength={1} rows={5} placeholder="Message" value={email.message} onChange={(e) => setEmail({ ...email, message: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setEmailOpen(false)}>Cancel</Button><Button type="submit" disabled={emailSending}>{emailSending ? "Sending…" : "Send email"}</Button></div></form></CardContent></Card>}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[["Total conversations", metrics.total], ["Applicants", metrics.applicants], ["Messages", metrics.messages], ["Files", metrics.files]].map(([label, value]) => <Card key={label as string}><CardHeader><CardTitle>{label}</CardTitle><CardDescription>{dataLoading ? "—" : Number(value).toLocaleString()}</CardDescription></CardHeader></Card>)}</div>
        <Card><CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><CardTitle>Recent conversations</CardTitle><CardDescription>Monitor applicant support</CardDescription></div><Input className="sm:max-w-xs" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} /></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>User</TableHead><TableHead>Time</TableHead></TableRow></TableHeader><TableBody>{filtered.map((conversation) => <TableRow key={conversation.id}><TableCell>{conversation.title}</TableCell><TableCell>{conversation.user}</TableCell><TableCell>{conversation.time}</TableCell></TableRow>)}{!dataLoading && filtered.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No conversations found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      </div>
    </main>
  </div>;
}
