import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, ChevronDown, ChevronRight, Receipt } from "lucide-react";
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

type Trip = Tables<"trips">;
type Expense = Tables<"expenses">;

const AdminTripsPage = () => {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "trip" | "expense"; id: string; label: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });
    setTrips(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = async (tripId: string) => {
    if (expandedId === tripId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(tripId);
    if (!expenses[tripId]) {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("expense_date", { ascending: false });
      setExpenses((prev) => ({ ...prev, [tripId]: data ?? [] }));
    }
  };

  const deleteTrip = async (id: string) => {
    await supabase.from("expenses").delete().eq("trip_id", id);
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip deleted" });
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
    setConfirmDelete(null);
  };

  const deleteExpense = async (id: string, tripId: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Expense deleted" });
      setExpenses((prev) => ({
        ...prev,
        [tripId]: (prev[tripId] ?? []).filter((e) => e.id !== id),
      }));
    }
    setConfirmDelete(null);
  };

  const filtered = trips.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase()) ||
    t.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">All Trips & Expenses</h1>
      <p className="text-muted-foreground mb-6">Browse and remove any user's data.</p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, location, or user ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading trips…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No trips found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => {
              const open = expandedId === t.id;
              return (
                <li key={t.id}>
                  <div className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(t.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{t.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{t.status}</Badge>
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.location || "No location"} · ${Number(t.budget).toFixed(2)} budget
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">user: {t.user_id}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setConfirmDelete({ type: "trip", id: t.id, label: t.title })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {open && (
                    <div className="bg-secondary/40 px-4 pb-4 pl-11">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Receipt className="w-3 h-3" /> Expenses ({expenses[t.id]?.length ?? 0})
                      </p>
                      {!expenses[t.id] ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                      ) : expenses[t.id].length === 0 ? (
                        <p className="text-sm text-muted-foreground">No expenses logged.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {expenses[t.id].map((e) => (
                            <li key={e.id} className="flex items-center gap-3 text-sm bg-card rounded-md px-3 py-2 border border-border">
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{e.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {e.category} · {new Date(e.expense_date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="font-medium text-accent">${Number(e.amount).toFixed(2)}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() =>
                                  setConfirmDelete({ type: "expense", id: e.id, label: e.description })
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirmDelete?.type === "trip" ? "trip" : "expense"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{confirmDelete?.label}</strong>
              {confirmDelete?.type === "trip" && " and all its expenses"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirmDelete) return;
                if (confirmDelete.type === "trip") deleteTrip(confirmDelete.id);
                else {
                  const tripId = Object.keys(expenses).find((tid) =>
                    expenses[tid].some((e) => e.id === confirmDelete.id)
                  );
                  if (tripId) deleteExpense(confirmDelete.id, tripId);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTripsPage;
