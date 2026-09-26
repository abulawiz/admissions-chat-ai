import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Users, Settings, ShieldCheck, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Conversations", icon: MessageSquare },
  { label: "Knowledge files", icon: FileText },
  { label: "Applicants", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Array<{ id?: string; title: string; user: string; status?: string; time?: string }>>([]);
  const [metrics, setMetrics] = useState({ total: 0, applicants: 0, messages: 0, files: 0 });
  const [uploading, setUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, navigate, user]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // Use paginated file list to avoid listing everything
      const [convRes, msgRes, filesRes] = await Promise.all([
        supabase
          .from("conversations")
          .select("id, title, user_id, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }),
        supabase.storage.from("admission-documents").list(user.id, { limit: 100 }),
      ]);

      const conversationRows = convRes.data ?? [];
      if (conversationRows.length) {
        setConversations(
          conversationRows.slice(0, 8).map((item: any) => ({
            id: item.id,
            title: item.title,
            user: `${item.user_id?.slice ? item.user_id.slice(0, 8) + "…" : item.user_id}`,
            status: "Open",
            time: item.updated_at ? new Date(item.updated_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "-",
          }))
        );
      } else setConversations([]);

      setMetrics({
        total: (conversationRows ?? []).length,
        applicants: new Set((conversationRows ?? []).map((r: any) => r.user_id)).size,
        messages: (msgRes.count as number) ?? 0,
        files: (filesRes.data?.length ?? 0),
      });
    } catch (err) {
      console.error("loadDashboard error", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => void loadDashboard())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => void loadDashboard())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => void loadDashboard())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, () => void loadDashboard())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard, user]);

  const filtered = useMemo(
    () =>
      conversations.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) || item.user.toLowerCase().includes(query.toLowerCase())
      ),
    [conversations, query]
  );

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const safeName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

    try {
      const { data, error } = await supabase.storage.from("admission-documents").upload(safeName, file, { upsert: false, contentType: file.type });

      setUploading(false);

      if (error) {
        // If bucket not found or permission issues, fallback to server-side upload
        console.warn("client upload error", error);
        if (error.status === 404 || /bucket/i.test(error.message || "")) {
          toast.error("Bucket not found or permission denied. Attempting server-side upload...");

          try {
            // read file as base64
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const res = await fetch("/api/admin/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: safeName, fileType: file.type, contentBase64: base64 }),
            });
            const body = await res.json();
            if (res.ok) {
              toast.success(`${file.name} uploaded via server.`);
              void loadDashboard();
            } else {
              console.error("server upload failed", body);
              toast.error("Server-side upload failed: " + (body.error ?? "unknown"));
            }
          } catch (e) {
            console.error("fallback upload failed", e);
            toast.error("Fallback upload failed");
          }
        } else if (error.status === 409) {
          toast.error("A file with the same name already exists. Rename and try again.");
        } else {
          toast.error("Upload failed: " + (error.message ?? "unknown"));
        }
      } else {
        toast.success(`${file.name} uploaded to the knowledge base.`);
        void loadDashboard();
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while uploading file");
      setUploading(false);
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const sendEmail = async () => {
    // Simple prompt flow to collect email details
    const to = window.prompt("Recipient email:");
    if (!to) return;
    const subject = window.prompt("Subject:", "Message from Admissions Admin") || "";
    const body = window.prompt("HTML body (simple):", "<p>Hello,</p><p>This is a message from the admissions admin.</p>") || "";

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html: body }),
      });
      if (!res.ok) {
        const j = await res.json();
        toast.error("Failed to send email: " + (j?.error ?? res.statusText));
      } else {
        toast.success("Email sent");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email");
    }
  };

  if (loading || !user) return <div className="min-h-[70vh] flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8f7] flex">
      <aside className={`hidden lg:flex fixed lg:static inset-y-0 left-0 z-40 w-72 bg-primary-dark text-primary-foreground flex-col shadow-xl`}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-primary-foreground/10"><Link to="/" className="font-display text-lg font-bold">NSUK Admin</Link></div>
        <div className="p-4 flex-1">
          <nav className="space-y-2">
            {nav.map((n) => (
              <button key={n.label} onClick={() => setActive(n.label)} className={`w-full text-left px-3 py-2 rounded ${active === n.label ? "bg-primary-foreground/10" : ""}`}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Admin dashboard</h1>
            <Badge variant="outline">{user.email ?? user.id}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" onChange={uploadFile} className="hidden" />
              <Button variant="ghost" size="sm"><Upload className="mr-2" /> Upload</Button>
            </label>
            <Button variant="default" size="sm" onClick={sendEmail}>Send email</Button>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total conversations</CardTitle>
                <CardDescription>{dataLoading ? "—" : metrics.total.toLocaleString()}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Applicants</CardTitle>
                <CardDescription>{dataLoading ? "—" : metrics.applicants.toLocaleString()}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>{dataLoading ? "—" : metrics.messages.toLocaleString()}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>{dataLoading ? "—" : metrics.files.toLocaleString()}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent conversations</CardTitle>
                <CardDescription>Monitor applicant support</CardDescription>
              </div>
              <div>
                <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id ?? c.title}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.user}</TableCell>
                      <TableCell>{c.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
