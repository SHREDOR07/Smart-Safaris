import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// Fix leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const currentLocationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "hue-rotate-[200deg] saturate-200",
});

const destinationIcon = new L.DivIcon({
  html: `<div style="background: hsl(263 70% 60%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  className: "",
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [60, 60] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 10);
    }
  }, [positions, map]);
  return null;
}

interface TripMapProps {
  location: string;
}

const TripMap = ({ location }: TripMapProps) => {
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [geocodeError, setGeocodeError] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const routeFetched = useRef(false);

  // Geocode destination
  useEffect(() => {
    if (!location) { setLoading(false); return; }
    const encoded = encodeURIComponent(location);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setDestCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setGeocodeError(true);
        }
      })
      .catch(() => setGeocodeError(true))
      .finally(() => setLoading(false));
  }, [location]);

  // Get user GPS
  useEffect(() => {
    if (!navigator.geolocation) { setGeoError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError(true),
      { timeout: 8000 }
    );
  }, []);

  // Fetch route via OSRM (free, no key)
  useEffect(() => {
    if (!userCoords || !destCoords || routeFetched.current) return;
    routeFetched.current = true;
    const [uLat, uLon] = userCoords;
    const [dLat, dLon] = destCoords;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${dLon},${dLat}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates as [number, number][];
          // OSRM returns [lon, lat], flip to [lat, lon]
          setRoutePoints(coords.map(([lon, lat]) => [lat, lon]));
        }
      })
      .catch(() => {
        // fallback: straight line
        if (userCoords && destCoords) setRoutePoints([userCoords, destCoords]);
      });
  }, [userCoords, destCoords]);

  const mapPositions: [number, number][] = [
    ...(userCoords ? [userCoords] : []),
    ...(destCoords ? [destCoords] : []),
  ];

  const defaultCenter: [number, number] = destCoords || [0, 20];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-56 rounded-xl bg-card border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  if (geocodeError) {
    return (
      <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-card border border-border text-muted-foreground gap-2">
        <MapPin className="w-5 h-5" />
        <p className="text-sm">Could not locate <span className="font-medium text-foreground">"{location}"</span> on the map.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      <div className="px-3 py-2 bg-card border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
        <Navigation className="w-3.5 h-3.5 text-primary" />
        <span>Route to <span className="font-medium text-foreground">{location}</span></span>
        {geoError && <span className="ml-auto text-yellow-500">GPS unavailable — destination only</span>}
      </div>
      <MapContainer
        center={defaultCenter}
        zoom={4}
        style={{ height: "260px", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {destCoords && (
          <Marker position={destCoords} icon={destinationIcon}>
            <Popup>{location}</Popup>
          </Marker>
        )}

        {userCoords && (
          <Marker position={userCoords} icon={currentLocationIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "hsl(263,70%,60%)", weight: 4, opacity: 0.8 }}
          />
        )}

        {mapPositions.length > 0 && <FitBounds positions={mapPositions} />}
      </MapContainer>
    </div>
  );
};

export default TripMap;
