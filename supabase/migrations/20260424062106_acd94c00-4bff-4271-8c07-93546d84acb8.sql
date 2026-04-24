
CREATE TABLE public.itinerary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  location TEXT,
  item_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_itinerary_trip_date ON public.itinerary_items(trip_id, item_date, start_time);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "Users can view own itinerary items"
ON public.itinerary_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itinerary items"
ON public.itinerary_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itinerary items"
ON public.itinerary_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itinerary items"
ON public.itinerary_items FOR DELETE
USING (auth.uid() = user_id);

-- Admin overrides
CREATE POLICY "Admins can view all itinerary items"
ON public.itinerary_items FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any itinerary item"
ON public.itinerary_items FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any itinerary item"
ON public.itinerary_items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER update_itinerary_items_updated_at
BEFORE UPDATE ON public.itinerary_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
