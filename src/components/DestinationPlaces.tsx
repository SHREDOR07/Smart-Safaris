import { useEffect, useState } from "react";
import { Utensils, Hotel, Star, ExternalLink, Loader2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Place {
  id: number;
  name: string;
  type: "restaurant" | "hotel";
  tags: Record<string, string>;
  lat: number;
  lon: number;
}

interface DestinationPlacesProps {
  location: string;
}

function PlaceCard({ place }: { place: Place }) {
  const cuisine = place.tags.cuisine?.replace(/_/g, " ") || null;
  const stars = place.tags.stars ? parseInt(place.tags.stars) : null;
  const website = place.tags.website || place.tags["contact:website"] || null;
  const phone = place.tags.phone || place.tags["contact:phone"] || null;
  const openingHours = place.tags.opening_hours || null;

  const mapsUrl = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}&zoom=17`;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card border border-border p-3 hover:border-primary/40 transition-colors min-w-[180px] max-w-[200px] shrink-0">
      <div className="flex items-start justify-between gap-1">
        <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
          {place.type === "restaurant" ? (
            <Utensils className="w-4 h-4 text-white" />
          ) : (
            <Hotel className="w-4 h-4 text-white" />
          )}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors mt-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex-1">
        <p className="font-display font-semibold text-sm leading-snug line-clamp-2">{place.name}</p>
        {cuisine && (
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{cuisine}</p>
        )}
        {stars && (
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-warning text-warning" />
            ))}
          </div>
        )}
        {openingHours && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{openingHours}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mt-auto">
        {website && (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
              Website
            </Badge>
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`}>
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
              Call
            </Badge>
          </a>
        )}
      </div>
    </div>
  );
}

function PlacesRow({
  title,
  icon,
  places,
}: {
  title: string;
  icon: React.ReactNode;
  places: Place[];
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-display font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">{places.length}</Badge>
      </div>
      {places.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">None found nearby.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {places.map((p) => (
            <div key={p.id} className="snap-start">
              <PlaceCard place={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DestinationPlaces = ({ location }: DestinationPlacesProps) => {
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    if (!location) return;

    setStatus("loading");

    // Step 1: Geocode location
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`)
      .then((r) => r.json())
      .then((geo) => {
        if (!geo?.features?.length) throw new Error("geocode failed");
        const [lon, lat] = geo.features[0].geometry.coordinates as [number, number];
        const radius = 5000; // 5 km

        // Step 2: Query Overpass for restaurants + hotels
        const query = `
          [out:json][timeout:15];
          (
            node["amenity"="restaurant"](around:${radius},${lat},${lon});
            node["amenity"="cafe"](around:${radius},${lat},${lon});
            node["tourism"="hotel"](around:${radius},${lat},${lon});
            node["tourism"="motel"](around:${radius},${lat},${lon});
            node["tourism"="guest_house"](around:${radius},${lat},${lon});
          );
          out body 60;
        `;

        return fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then((r) => r.json());
      })
      .then((data) => {
        const elements: any[] = data.elements || [];
        const named = elements.filter((e) => e.tags?.name);

        const rests: Place[] = named
          .filter((e) => e.tags.amenity === "restaurant" || e.tags.amenity === "cafe")
          .slice(0, 12)
          .map((e) => ({
            id: e.id,
            name: e.tags.name,
            type: "restaurant",
            tags: e.tags,
            lat: e.lat,
            lon: e.lon,
          }));

        const htls: Place[] = named
          .filter(
            (e) =>
              e.tags.tourism === "hotel" ||
              e.tags.tourism === "motel" ||
              e.tags.tourism === "guest_house"
          )
          .slice(0, 12)
          .map((e) => ({
            id: e.id,
            name: e.tags.name,
            type: "hotel",
            tags: e.tags,
            lat: e.lat,
            lon: e.lon,
          }));

        setRestaurants(rests);
        setHotels(htls);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [location]);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Finding places near {location}…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Could not load places for this destination.</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PlacesRow
        title="Restaurants & Cafés"
        icon={<Utensils className="w-4 h-4 text-primary" />}
        places={restaurants}
      />
      <PlacesRow
        title="Hotels & Motels"
        icon={<Hotel className="w-4 h-4 text-accent" />}
        places={hotels}
      />
    </div>
  );
};

export default DestinationPlaces;
