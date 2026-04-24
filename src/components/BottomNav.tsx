import { NavLink, useLocation } from "react-router-dom";
import { Home, Map, Settings, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const baseTabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/trips", icon: Map, label: "Trips" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useUserRole();

  const tabs = isAdmin
    ? [...baseTabs, { to: "/admin", icon: Shield, label: "Admin" }]
    : baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
