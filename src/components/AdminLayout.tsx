import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Plane, LogOut, Compass, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/trips", icon: Plane, label: "Trips & Expenses" },
];

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-border bg-card/50 backdrop-blur">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Compass className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-display font-bold text-gradient leading-none">Smart Safaris</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Console</p>
          </div>
        </div>

        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 md:mt-auto md:absolute md:bottom-0 md:w-60 space-y-2 hidden md:block">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
