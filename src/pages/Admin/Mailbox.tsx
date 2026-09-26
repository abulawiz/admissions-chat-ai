import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Mailbox() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/mail-history"); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not load emails"); setEmails(j.emails || []);
    } catch (e: any) { toast.error(e.message || "Could not load emails"); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Mail History</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>To</TableHead><TableHead>Subject</TableHead><TableHead>Provider</TableHead><TableHead>When</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((m: any) => (
              <TableRow key={m.id}><TableCell>{m.recipient}</TableCell><TableCell>{m.subject}</TableCell><TableCell>{m.provider}</TableCell><TableCell>{new Date(m.created_at).toLocaleString()}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
