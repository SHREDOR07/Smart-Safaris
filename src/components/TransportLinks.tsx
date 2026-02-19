import { Car, ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaxiService {
  name: string;
  description: string;
  logo: string;
  url: string;
  regions: string[];
  tag: "global" | "regional" | "booking";
  tagLabel: string;
  color: string;
}

const TAXI_SERVICES: TaxiService[] = [
  {
    name: "Uber",
    description: "Ride-hailing available in 70+ countries",
    logo: "🚗",
    url: "https://www.uber.com",
    regions: ["Americas", "Europe", "Asia", "Africa", "Oceania"],
    tag: "global",
    tagLabel: "Global",
    color: "hsl(0 0% 0%)",
  },
  {
    name: "Bolt",
    description: "Affordable rides across Europe & Africa",
    logo: "⚡",
    url: "https://bolt.eu",
    regions: ["Europe", "Africa"],
    tag: "regional",
    tagLabel: "Europe · Africa",
    color: "hsl(120 60% 40%)",
  },
  {
    name: "Grab",
    description: "Southeast Asia's leading super-app",
    logo: "🟢",
    url: "https://www.grab.com",
    regions: ["Southeast Asia"],
    tag: "regional",
    tagLabel: "SE Asia",
    color: "hsl(120 50% 35%)",
  },
  {
    name: "Lyft",
    description: "Rides across the United States & Canada",
    logo: "🩷",
    url: "https://www.lyft.com",
    regions: ["North America"],
    tag: "regional",
    tagLabel: "North America",
    color: "hsl(310 80% 55%)",
  },
  {
    name: "inDrive",
    description: "Fare-negotiation rides in 40+ countries",
    logo: "🔵",
    url: "https://indrive.com",
    regions: ["Americas", "Europe", "Asia", "Africa"],
    tag: "global",
    tagLabel: "40+ Countries",
    color: "hsl(210 80% 50%)",
  },
  {
    name: "DiDi",
    description: "China's top platform, expanding globally",
    logo: "🟠",
    url: "https://www.didiglobal.com",
    regions: ["Asia", "Americas"],
    tag: "regional",
    tagLabel: "Asia · Americas",
    color: "hsl(30 90% 50%)",
  },
  {
    name: "Ola",
    description: "India, UK, Australia & New Zealand",
    logo: "🟡",
    url: "https://www.olacabs.com",
    regions: ["South Asia", "UK", "Oceania"],
    tag: "regional",
    tagLabel: "India · UK · AU",
    color: "hsl(45 90% 50%)",
  },
  {
    name: "FreeNow",
    description: "Licensed taxis across major European cities",
    logo: "🚕",
    url: "https://free-now.com",
    regions: ["Europe"],
    tag: "regional",
    tagLabel: "Europe",
    color: "hsl(50 80% 45%)",
  },
  {
    name: "Taxifarefinder",
    description: "Compare taxi prices at any destination",
    logo: "💲",
    url: "https://www.taxifarefinder.com",
    regions: ["Global"],
    tag: "booking",
    tagLabel: "Price Compare",
    color: "hsl(250 75% 60%)",
  },
  {
    name: "Rome2rio",
    description: "Find transport routes between any two places",
    logo: "🗺️",
    url: "https://www.rome2rio.com",
    regions: ["Global"],
    tag: "booking",
    tagLabel: "Route Planner",
    color: "hsl(200 85% 50%)",
  },
];

const tagColors: Record<TaxiService["tag"], string> = {
  global: "bg-primary/15 text-primary border-primary/30",
  regional: "bg-accent/15 text-accent border-accent/30",
  booking: "bg-secondary text-secondary-foreground border-border",
};

interface TransportLinksProps {
  origin?: string;
  destination?: string;
}

const TransportLinks = ({ origin, destination }: TransportLinksProps) => {
  const buildUrl = (service: TaxiService) => {
    if (service.name === "Rome2rio" && origin && destination) {
      return `https://www.rome2rio.com/map/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    }
    return service.url;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Car className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Taxi & Ride Services</h3>
        <Badge variant="secondary" className="text-xs">{TAXI_SERVICES.length}</Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {TAXI_SERVICES.map((service) => {
          const href = buildUrl(service);
          return (
            <a
              key={service.name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 min-w-[160px] max-w-[180px] flex flex-col gap-2 rounded-xl bg-card border border-border p-3 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl leading-none">{service.logo}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">{service.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
              </div>
              <div className="mt-auto">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tagColors[service.tag]}`}
                >
                  {service.tagLabel}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default TransportLinks;
