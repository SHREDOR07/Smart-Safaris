import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Plus, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Trip = Tables<"trips">;

const statusColors: Record<string, string> = {
  upcoming: "bg-accent/20 text-accent",
  active: "bg-success/20 text-success",
  completed: "bg-muted text-muted-foreground",
};

const TripsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (data) setTrips(data);
        setLoading(false);
      });
  }, [user]);

  const grouped = trips.reduce<Record<string, Trip[]>>((acc, trip) => {
    const key = trip.location || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(trip);
    return acc;
  }, {});

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Trips</h1>
        <Button size="sm" onClick={() => navigate("/trips/new")} className="bg-gradient-brand glow-primary font-display text-sm">
          <Plus className="w-4 h-4 mr-1" /> New Trip
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-display text-lg mb-1">No trips yet</p>
          <p className="text-sm">Create your first trip to begin tracking expenses.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([location, locationTrips]) => (
          <div key={location} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">{location}</h2>
            </div>
            <div className="grid gap-3">
              {locationTrips.map((trip) => (
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(trip.start_date), "MMM d")} – {format(new Date(trip.end_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TripsPage;
