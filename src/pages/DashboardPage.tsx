import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Plus, MapPin, Calendar, Compass, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Trip = Tables<"trips">;

const statusColors: Record<string, string> = {
  upcoming: "bg-accent/20 text-accent",
  active: "bg-success/20 text-success",
  completed: "bg-muted text-muted-foreground",
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [profile, setProfile] = useState<{ full_name: string; preferred_currency: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [tripsRes, expensesRes, profileRes] = await Promise.all([
        supabase.from("trips").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
        supabase.from("expenses").select("amount").eq("user_id", user.id),
        supabase.from("profiles").select("full_name, preferred_currency").eq("user_id", user.id).maybeSingle(),
      ]);

      if (tripsRes.data) {
        setTrips(tripsRes.data);
        setTotalBudget(tripsRes.data.reduce((s, t) => s + Number(t.budget), 0));
      }
      if (expensesRes.data) {
        setTotalSpent(expensesRes.data.reduce((s, e) => s + Number(e.amount), 0));
      }
      if (profileRes.data) setProfile(profileRes.data);
    };

    fetchData();
  }, [user]);

  const currency = profile?.preferred_currency || "USD";
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-display font-bold">{profile?.full_name || "Traveler"}</h1>
        </div>
        <Compass className="w-8 h-8 text-primary" />
      </div>

      {/* Budget Summary Card */}
      <div className="rounded-2xl bg-gradient-card border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Budget Overview</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-display font-bold text-destructive">
              {currency} {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className="text-2xl font-display font-bold text-success">
              {currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all duration-500"
            style={{ width: `${spentPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {spentPercent.toFixed(0)}% of total budget used
        </p>
      </div>

      {/* Trips Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="font-display font-semibold text-lg">Your Trips</h2>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/trips/new")}
          className="bg-gradient-brand glow-primary font-display text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-display">No trips yet</p>
          <p className="text-sm">Add your first trip to start tracking expenses</p>
        </div>
      ) : (
        <div className="grid gap-3 mb-4">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="w-full text-left rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold">{trip.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[trip.status]}`}>
                  {trip.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {trip.location || "No location"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {format(new Date(trip.start_date), "MMM d")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Budget: {currency} {Number(trip.budget).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Map = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export default DashboardPage;
