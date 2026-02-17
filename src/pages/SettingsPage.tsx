import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Tag, Plus, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type CustomCategory = Tables<"custom_categories">;

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "KES", "ZAR", "INR", "BRL"];

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"trip" | "expense">("expense");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, preferred_currency").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name);
        setCurrency(data.preferred_currency);
      }
    });
    supabase.from("custom_categories").select("*").eq("user_id", user.id).order("created_at").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim(), preferred_currency: currency }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated!" });
  };

  const handleAddCategory = async () => {
    if (!user || !newCatName.trim()) return;
    const { data, error } = await supabase.from("custom_categories").insert({
      user_id: user.id,
      name: newCatName.trim(),
      type: newCatType,
    }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("custom_categories").delete().eq("id", id);
    if (!error) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const tripCategories = categories.filter((c) => c.type === "trip");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-display font-bold mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl bg-card border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted border-border" />
          </div>
          <div className="space-y-2">
            <Label>Preferred Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-brand glow-primary font-display font-semibold">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* Custom Categories */}
      <div className="rounded-xl bg-card border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-accent" />
          <h2 className="font-display font-semibold">Custom Categories</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name" className="bg-secondary border-border flex-1" />
          <Select value={newCatType} onValueChange={(v) => setNewCatType(v as "trip" | "expense")}>
            <SelectTrigger className="bg-secondary border-border w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="trip">Trip</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" onClick={handleAddCategory} className="bg-gradient-brand shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {tripCategories.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trip Categories</p>
            <div className="space-y-1">
              {tripCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-secondary">
                  <span className="text-sm">{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(c.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {expenseCategories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Expense Categories</p>
            <div className="space-y-1">
              {expenseCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-secondary">
                  <span className="text-sm">{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(c.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No custom categories yet.</p>
        )}
      </div>

      {/* Sign Out */}
      <Button variant="outline" onClick={signOut} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 font-display">
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default SettingsPage;
