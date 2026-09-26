import { useState, type FormEvent } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ReminderCard() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); try { const response = await fetch("/api/reminders/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: name, email }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); toast.success("Reminder booked. We will email you when POST-UTME starts."); setName(""); setEmail(""); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not book reminder"); } finally { setSaving(false); } };
  return <Card className="max-w-xl mx-auto border-primary/20"><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-5 text-primary" /> POST-UTME reminder</CardTitle><CardDescription>Get one email when POST-UTME registration officially starts.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name (optional)" /><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" /><Button disabled={saving} className="w-full">{saving ? "Saving…" : "Remind me"}</Button></form></CardContent></Card>;
}
