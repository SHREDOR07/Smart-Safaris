import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import EditTripDialog from "@/components/EditTripDialog";
import TripMap from "@/components/TripMap";
import { useToast } from "@/hooks/use-toast";

type Trip = Tables<"trips">;
type Expense = Tables<"expenses">;

const categoryIcons: Record<string, string> = {
  Food: "🍕",
  Transport: "🚗",
  Lodging: "🏨",
  Activities: "🎯",
  Shopping: "🛍️",
  Other: "📦",
};

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [profile, setProfile] = useState<{ preferred_currency: string } | null>(null);

  const fetchData = async () => {
    if (!user || !id) return;
    const [tripRes, expRes, profRes] = await Promise.all([
      supabase.from("trips").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
      supabase.from("expenses").select("*").eq("trip_id", id).eq("user_id", user.id).order("expense_date", { ascending: false }),
      supabase.from("profiles").select("preferred_currency").eq("user_id", user.id).maybeSingle(),
    ]);
    if (tripRes.data) setTrip(tripRes.data);
    if (expRes.data) setExpenses(expRes.data);
    if (profRes.data) setProfile(profRes.data);
  };

  useEffect(() => { fetchData(); }, [user, id]);

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const currency = profile?.preferred_currency || "USD";

  const handleDeleteExpense = async (expenseId: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    }
  };

  if (!trip) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold flex-1">{trip.title}</h1>
        <Button variant="ghost" size="icon" onClick={() => setShowEditTrip(true)}>
          <Pencil className="w-4 h-4" />
        </Button>
      </div>

      {/* Trip info */}
      <div className="rounded-xl bg-card border border-border p-4 mb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
            <p className="font-medium">{trip.location || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <p className="font-medium capitalize">{trip.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Dates</p>
            <p className="font-medium">{format(new Date(trip.start_date), "MMM d")} – {format(new Date(trip.end_date), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Budget</p>
            <p className="font-medium">{currency} {Number(trip.budget).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Spent: {currency} {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span>Remaining: {currency} {(Number(trip.budget) - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all"
              style={{ width: `${Math.min((totalSpent / Number(trip.budget)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      {trip.location && (
        <div className="mb-6">
          <h2 className="font-display font-semibold mb-3">Map & Route</h2>
          <TripMap location={trip.location} />
        </div>
      )}

      {/* Expenses */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold">Expenses</h2>
        <Button size="sm" onClick={() => setShowAddExpense(true)} className="bg-gradient-brand glow-primary font-display text-sm">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {expenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">No expenses recorded yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
              <span className="text-xl">{categoryIcons[exp.category] || "📦"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{exp.description}</p>
                <p className="text-xs text-muted-foreground">{exp.category} · {format(new Date(exp.expense_date), "MMM d")}</p>
              </div>
              <p className="font-display font-semibold text-sm">{currency} {Number(exp.amount).toLocaleString()}</p>
              <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => handleDeleteExpense(exp.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        tripId={trip.id}
        userId={user!.id}
        onAdded={fetchData}
      />
      <EditTripDialog
        open={showEditTrip}
        onOpenChange={setShowEditTrip}
        trip={trip}
        onUpdated={fetchData}
      />
    </div>
  );
};

export default TripDetailPage;
