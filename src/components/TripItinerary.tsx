import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, MapPin, CalendarDays } from "lucide-react";
import { format, eachDayOfInterval, parseISO, isValid } from "date-fns";

type ItineraryItem = Tables<"itinerary_items">;

interface Props {
  tripId: string;
  userId: string;
  startDate: string;
  endDate: string;
}

const emptyForm = {
  id: "",
  title: "",
  notes: "",
  location: "",
  item_date: "",
  start_time: "",
  end_time: "",
};

const TripItinerary = ({ tripId, userId, startDate, endDate }: Props) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("item_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const openAdd = (date?: string) => {
    setForm({ ...emptyForm, item_date: date || startDate });
    setDialogOpen(true);
  };

  const openEdit = (item: ItineraryItem) => {
    setForm({
      id: item.id,
      title: item.title,
      notes: item.notes ?? "",
      location: item.location ?? "",
      item_date: item.item_date,
      start_time: item.start_time ?? "",
      end_time: item.end_time ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.item_date) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      trip_id: tripId,
      user_id: userId,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      location: form.location.trim() || null,
      item_date: form.item_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    };
    const { error } = form.id
      ? await supabase.from("itinerary_items").update(payload).eq("id", form.id)
      : await supabase.from("itinerary_items").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Itinerary updated" : "Added to itinerary" });
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Build day buckets across the full trip range so users can plan empty days too
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = isValid(start) && isValid(end) && start <= end
    ? eachDayOfInterval({ start, end })
    : [];

  const formatTime = (t: string | null) => {
    if (!t) return null;
    // t is "HH:MM:SS"
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return format(d, "h:mm a");
  };

  return (
    <div className="rounded-xl bg-card border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-display font-semibold text-base leading-tight">Itinerary</h2>
            <p className="text-xs text-muted-foreground">Plan your day-by-day activities</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => openAdd()}
          className="bg-gradient-brand glow-primary font-display text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
      ) : days.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Set valid trip dates to plan an itinerary.
        </p>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayItems = items.filter((i) => i.item_date === dayKey);
            return (
              <div key={dayKey}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {format(day, "EEE, MMM d")}
                  </p>
                  <button
                    onClick={() => openAdd(dayKey)}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add
                  </button>
                </div>

                {dayItems.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic px-3 py-2 rounded-lg bg-secondary/40 border border-dashed border-border">
                    Nothing planned
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {dayItems.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg bg-secondary/60 border border-border p-3 flex gap-3"
                      >
                        <div className="flex flex-col items-center min-w-[3.5rem] text-center">
                          {item.start_time ? (
                            <>
                              <span className="text-xs font-medium text-primary">
                                {formatTime(item.start_time)}
                              </span>
                              {item.end_time && (
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTime(item.end_time)}
                                </span>
                              )}
                            </>
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => remove(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Activity" : "Add to Itinerary"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Visit the Louvre"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.item_date}
                min={startDate}
                max={endDate}
                onChange={(e) => setForm({ ...form, item_date: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Optional"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional details, booking refs, tips…"
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-gradient-brand glow-primary font-display"
            >
              {saving ? "Saving…" : form.id ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripItinerary;
