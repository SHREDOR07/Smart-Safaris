import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
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

type TripStatus = Database["public"]["Enums"]["trip_status"];

const NewTripPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<TripStatus>("upcoming");
  const [category, setCategory] = useState("Personal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !startDate || !endDate) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("trips").insert({
      user_id: user.id,
      title: title.trim(),
      location: location.trim(),
      start_date: startDate,
      end_date: endDate,
      budget: parseFloat(budget) || 0,
      status,
      category,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip created!" });
      navigate("/trips");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">New Trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Safari Adventure" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi, Kenya" className="bg-secondary border-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-secondary border-border" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Budget</Label>
          <Input type="number" step="0.01" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          {loading ? "Creating..." : "Create Trip"}
        </Button>
      </form>
    </div>
  );
};

export default NewTripPage;
