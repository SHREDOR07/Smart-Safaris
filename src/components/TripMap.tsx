import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// Fix leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface TripMapProps {
  location: string;
}

const TripMap = ({ location }: TripMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !location) {
      setStatus("error");
      return;
    }

    // Avoid double-init on hot reload
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, { scrollWheelZoom: false });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const destIcon = L.divIcon({
      html: `<div style="background:hsl(263,70%,60%);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -32],
      className: "",
    });

    // 1. Geocode destination via Photon (CORS-friendly, free)
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.features?.length) { setStatus("error"); return; }

        // Photon returns GeoJSON: coordinates are [lon, lat]
        const [destLon, destLat] = data.features[0].geometry.coordinates as [number, number];
        const destLatLng = L.latLng(destLat, destLon);

        const destMarker = L.marker(destLatLng, { icon: destIcon })
          .addTo(map)
          .bindPopup(location);

        setStatus("ready");
        map.setView(destLatLng, 6);

        // 2. Try GPS
        if (!navigator.geolocation) {
          setGeoError(true);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
            const userMarker = L.marker(userLatLng).addTo(map).bindPopup("Your location");

            // Fit both markers
            const bounds = L.latLngBounds([userLatLng, destLatLng]);
            map.fitBounds(bounds, { padding: [60, 60] });

            // 3. Fetch driving route via OSRM
            fetch(
              `https://router.project-osrm.org/route/v1/driving/${pos.coords.longitude},${pos.coords.latitude};${destLon},${destLat}?overview=full&geometries=geojson`
            )
              .then((r) => r.json())
              .then((rd) => {
                if (rd.routes && rd.routes[0]) {
                  const coords = rd.routes[0].geometry.coordinates as [number, number][];
                  const latlngs: L.LatLngTuple[] = coords.map(([lon, lat]) => [lat, lon]);
                  L.polyline(latlngs, { color: "hsl(263,70%,60%)", weight: 4, opacity: 0.85 }).addTo(map);
                } else {
                  // Fallback straight line
                  L.polyline([userLatLng, destLatLng], { color: "hsl(263,70%,60%)", weight: 3, dashArray: "8,8" }).addTo(map);
                }
              })
              .catch(() => {
                L.polyline([userLatLng, destLatLng], { color: "hsl(263,70%,60%)", weight: 3, dashArray: "8,8" }).addTo(map);
              });
          },
          () => setGeoError(true),
          { timeout: 8000 }
        );
      })
      .catch(() => setStatus("error"));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-card border border-border text-muted-foreground gap-2">
        <MapPin className="w-5 h-5" />
        <p className="text-sm">
          Could not locate <span className="font-medium text-foreground">"{location}"</span> on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      <div className="px-3 py-2 bg-card border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
        <Navigation className="w-3.5 h-3.5 text-primary" />
        <span>
          Route to <span className="font-medium text-foreground">{location}</span>
        </span>
        {status === "loading" && (
          <span className="ml-auto flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading…
          </span>
        )}
        {geoError && status === "ready" && (
          <span className="ml-auto text-yellow-500">GPS unavailable — destination only</span>
        )}
      </div>
      <div ref={mapRef} style={{ height: 260, width: "100%" }} />
    </div>
  );
};

export default TripMap;
