import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/users", { method: "GET" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not load users");
      setUsers(j.users || []);
    } catch (e: any) { toast.error(e.message || "Could not load users"); }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const setRole = async (id: string, role: string) => {
    try {
      const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not update user");
      toast.success("Updated"); await load();
    } catch (e: any) { toast.error(e.message || "Could not update user"); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Users</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.email ?? u.user?.email ?? u.id}</TableCell>
                <TableCell>{(u.user_metadata?.role) || (u.app_metadata?.role) || "user"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setRole(u.id, "admin")}>Make admin</Button>
                    <Button size="sm" variant="outline" onClick={() => setRole(u.id, "user")}>Revoke admin</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
