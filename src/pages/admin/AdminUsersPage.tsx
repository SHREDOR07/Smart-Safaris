import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff, Trash2, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserRow {
  user_id: string;
  full_name: string;
  preferred_currency: string;
  created_at: string;
  isAdmin: boolean;
}

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, preferred_currency, created_at"),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    const rows: UserRow[] = (profiles ?? []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name || "(no name)",
      preferred_currency: p.preferred_currency,
      created_at: p.created_at,
      isAdmin: adminIds.has(p.user_id),
    }));
    rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    setUsers(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (row: UserRow) => {
    if (row.isAdmin) {
      if (row.user_id === currentUser?.id) {
        toast({ title: "Cannot demote yourself", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", row.user_id)
        .eq("role", "admin");
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Admin role revoked" });
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: row.user_id, role: "admin" });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Promoted to admin" });
    }
    load();
  };

  const deleteUser = async (row: UserRow) => {
    // Delete profile + user data; auth.users row remains (admin-only deletion of auth users
    // requires service role and is intentionally not exposed client-side).
    const { error: expErr } = await supabase.from("expenses").delete().eq("user_id", row.user_id);
    const { error: tripErr } = await supabase.from("trips").delete().eq("user_id", row.user_id);
    const { error: catErr } = await supabase.from("custom_categories").delete().eq("user_id", row.user_id);
    const { error: roleErr } = await supabase.from("user_roles").delete().eq("user_id", row.user_id);
    const { error: profErr } = await supabase.from("profiles").delete().eq("user_id", row.user_id);
    const err = expErr || tripErr || catErr || roleErr || profErr;
    if (err) {
      toast({ title: "Partial delete", description: err.message, variant: "destructive" });
    } else {
      toast({ title: "User data deleted", description: "Auth account remains; remove from Cloud → Users to fully revoke." });
    }
    setConfirmDelete(null);
    load();
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Users</h1>
      <p className="text-muted-foreground mb-6">Manage roles and remove user data.</p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or user ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((u) => (
              <li key={u.user_id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{u.full_name}</p>
                    {u.isAdmin && (
                      <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                        Admin
                      </Badge>
                    )}
                    {u.user_id === currentUser?.id && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.user_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.preferred_currency} · joined {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAdmin(u)}
                    disabled={u.isAdmin && u.user_id === currentUser?.id}
                  >
                    {u.isAdmin ? (
                      <><ShieldOff className="w-3.5 h-3.5 mr-1.5" /> Revoke</>
                    ) : (
                      <><Shield className="w-3.5 h-3.5 mr-1.5" /> Make Admin</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmDelete(u)}
                    disabled={u.user_id === currentUser?.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes <strong>{confirmDelete?.full_name}</strong>'s profile, trips,
              expenses, categories, and roles. Their auth account will remain — fully delete it from
              Cloud → Users if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteUser(confirmDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersPage;
