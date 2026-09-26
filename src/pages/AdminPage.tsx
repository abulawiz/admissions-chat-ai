import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Bell, BookOpen, ChevronRight, FileText, LayoutDashboard, Menu, MessageSquare, Search, Settings, ShieldCheck, Upload, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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

const fallbackConversations = [
  { title: "JAMB cut off mark for Medicine", user: "admissions@nsuk.edu.ng", status: "Resolved", time: "2 min ago" },
  { title: "How do I apply for Post UTME?", user: "prospective.student@gmail.com", status: "Open", time: "18 min ago" },
  { title: "School fees payment options", user: "james.okafor@gmail.com", status: "Resolved", time: "42 min ago" },
  { title: "Direct entry requirements", user: "fatima.abdullahi@gmail.com", status: "Escalated", time: "1 hr ago" },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState(fallbackConversations);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("conversations").select("title, updated_at").order("updated_at", { ascending: false }).limit(8).then(({ data }) => {
      if (data?.length) setConversations(data.map((item) => ({ title: item.title, user: "Authenticated applicant", status: "Open", time: new Date(item.updated_at).toLocaleDateString() })));
    });
  }, [user]);

  const filtered = useMemo(() => conversations.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.user.toLowerCase().includes(query.toLowerCase())), [conversations, query]);

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const safeName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("admission-documents").upload(safeName, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) toast.error("Upload could not be completed. Create the admission-documents storage bucket first.");
    else toast.success(`${file.name} uploaded to the knowledge base.`);
    event.target.value = "";
  };

  if (loading || !user) return <div className="min-h-[70vh] flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f8f7] flex">
      <aside className={`${mobileOpen ? "flex" : "hidden"} lg:flex fixed lg:static inset-y-0 left-0 z-40 w-72 bg-primary-dark text-primary-foreground flex-col shadow-xl`}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-primary-foreground/10"><Link to="/" className="font-display text-lg font-bold">NSUK <span className="text-accent">Admin</span></Link><Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground" onClick={() => setMobileOpen(false)}><X /></Button></div>
        <div className="p-4"><div className="rounded-xl bg-primary-foreground/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="text-accent" /> Admissions workspace</div><p className="text-xs text-primary-foreground/60 mt-2">Manage your AI assistant and applicant support.</p></div></div>
        <nav className="flex-1 px-3 py-2 space-y-1">{nav.map((item) => <button key={item.label} onClick={() => { setActive(item.label); setMobileOpen(false); }} className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${active === item.label ? "bg-primary-foreground text-primary-dark font-semibold" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}><item.icon className="size-4" />{item.label}{item.label === "Knowledge files" && <Badge className="ml-auto bg-accent text-accent-foreground">12</Badge>}</button>)}</nav>
        <div className="p-4 border-t border-primary-foreground/10"><Link to="/chat" className="flex items-center justify-between text-sm text-primary-foreground/70 hover:text-primary-foreground">Open assistant <ChevronRight className="size-4" /></Link></div>
      </aside>
      {mobileOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-primary-dark/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></Button><div><p className="text-xs text-muted-foreground">Workspace / {active}</p><h1 className="text-lg font-bold leading-tight">{active}</h1></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon"><Bell className="size-4" /></Button><div className="size-8 rounded-full nsuk-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">{(user.email?.[0] ?? "A").toUpperCase()}</div></div></header>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Monday, September 28, 2026</p><h2 className="text-3xl font-bold mt-1">Good morning, administrator</h2><p className="text-muted-foreground mt-1">Here is what is happening with your admissions assistant.</p></div><label className="cursor-pointer"><input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={uploadFile} disabled={uploading} /><Button asChild disabled={uploading}><span><Upload data-icon="inline-start" />{uploading ? "Uploading..." : "Upload knowledge file"}</span></Button></label></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[{ label: "Total conversations", value: "1,284", change: "+12.5%", icon: MessageSquare }, { label: "Resolved by AI", value: "92.4%", change: "+4.2%", icon: ShieldCheck }, { label: "Active applicants", value: "348", change: "+8.1%", icon: Users }, { label: "Knowledge files", value: "12", change: "2 pending", icon: BookOpen }].map((stat) => <Card key={stat.label}><CardContent className="p-5"><div className="flex items-center justify-between"><div className="size-10 rounded-xl bg-primary-light flex items-center justify-center"><stat.icon className="size-5 text-primary" /></div><span className="text-xs font-semibold text-primary">{stat.change}</span></div><p className="text-2xl font-bold mt-4">{stat.value}</p><p className="text-xs text-muted-foreground mt-1">{stat.label}</p></CardContent></Card>)}</div>
          <div className="grid xl:grid-cols-[1.35fr_1fr] gap-6"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Conversation volume</CardTitle><CardDescription>Applicant questions over the last 7 days</CardDescription></div><Button variant="outline" size="sm">Last 7 days</Button></CardHeader><CardContent><div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-border pb-0">{[48, 68, 56, 84, 71, 94, 76].map((height, index) => <div key={index} className="flex-1 h-full flex flex-col justify-end gap-2"><div className="rounded-t-md nsuk-gradient w-full" style={{ height: `${height}%` }} /><span className="text-[10px] text-muted-foreground text-center">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>)}</div></CardContent></Card><Card><CardHeader><CardTitle>Resolution rate</CardTitle><CardDescription>How well the assistant handles enquiries</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div><div className="flex justify-between text-sm mb-2"><span>Resolved automatically</span><strong>92.4%</strong></div><Progress value={92.4} /></div><div><div className="flex justify-between text-sm mb-2"><span>Escalated to staff</span><strong>7.6%</strong></div><Progress value={7.6} className="[&>div]:bg-accent" /></div><Separator /><div className="flex items-center gap-3 text-sm text-muted-foreground"><BarChart3 className="size-4 text-primary" />Performance is above your 85% target.</div></CardContent></Card></div>
          <Card><CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><CardTitle>Recent conversations</CardTitle><CardDescription>Monitor applicant support activity</CardDescription></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="pl-9" /></div></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Conversation</TableHead><TableHead>Applicant</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={`${item.title}-${item.user}`}><TableCell className="font-medium min-w-64">{item.title}</TableCell><TableCell className="text-muted-foreground">{item.user}</TableCell><TableCell><Badge variant={item.status === "Resolved" ? "secondary" : item.status === "Escalated" ? "destructive" : "outline"}>{item.status}</Badge></TableCell><TableCell className="text-muted-foreground">{item.time}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
        </div>
      </main>
    </div>
  );
}
