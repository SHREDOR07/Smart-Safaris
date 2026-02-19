import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Database } from "@/integrations/supabase/types";

import beachBg from "@/assets/category-beach.jpg";
import adventureBg from "@/assets/category-adventure.jpg";
import foodBg from "@/assets/category-food.jpg";
import luxuryBg from "@/assets/category-luxury.jpg";
import cultureBg from "@/assets/category-culture.jpg";
import businessBg from "@/assets/category-business.jpg";

const CATEGORIES = [
  { value: "beach", label: "Beach", emoji: "🏖️", bg: beachBg },
  { value: "adventure", label: "Adventure", emoji: "🏔️", bg: adventureBg },
  { value: "food", label: "Food & Gastronomy", emoji: "🍜", bg: foodBg },
  { value: "luxury", label: "Luxury & Spa", emoji: "💎", bg: luxuryBg },
  { value: "culture", label: "Culture & Heritage", emoji: "🏛️", bg: cultureBg },
  { value: "business", label: "Business & Urban", emoji: "🏙️", bg: businessBg },
  { value: "nature", label: "Nature & Hiking", emoji: "🌿", bg: adventureBg },
  { value: "history", label: "History & Arts", emoji: "🎭", bg: cultureBg },
  { value: "resort", label: "Resort", emoji: "🌴", bg: luxuryBg },
  { value: "gastronomy", label: "Wine & Dine", emoji: "🍷", bg: foodBg },
];

type Trip = Tables<"trips">;
type TripStatus = Database["public"]["Enums"]["trip_status"];

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  onUpdated: () => void;
}

const EditTripDialog = ({ open, onOpenChange, trip, onUpdated }: EditTripDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(trip.title);
  const [location, setLocation] = useState(trip.location);
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [budget, setBudget] = useState(String(trip.budget));
  const [status, setStatus] = useState<TripStatus>(trip.status);
  const [category, setCategory] = useState(trip.category || "adventure");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(trip.title);
    setLocation(trip.location);
    setStartDate(trip.start_date);
    setEndDate(trip.end_date);
    setBudget(String(trip.budget));
    setStatus(trip.status);
    setCategory(trip.category || "adventure");
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("trips").update({
      title: title.trim(),
      location: location.trim(),
      start_date: startDate,
      end_date: endDate,
      budget: parseFloat(budget) || 0,
      status,
      category,
    }).eq("id", trip.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      onOpenChange(false);
      onUpdated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TripStatus)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all text-left ${
                    category === cat.value
                      ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={cat.bg} alt={cat.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
                  {category === cat.value && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                  <div className="relative z-10 flex items-center gap-2 px-3 h-full">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-xs font-semibold text-foreground leading-tight">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-brand glow-primary font-display font-semibold">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripDialog;

