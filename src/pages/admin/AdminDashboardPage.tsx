import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plane, Receipt, DollarSign } from "lucide-react";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ users: 0, trips: 0, expenses: 0, totalSpend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: users }, { count: trips }, { data: expenses }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("trips").select("*", { count: "exact", head: true }),
        supabase.from("expenses").select("amount"),
      ]);
      const totalSpend = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      setStats({
        users: users ?? 0,
        trips: trips ?? 0,
        expenses: expenses?.length ?? 0,
        totalSpend,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Total Trips", value: stats.trips, icon: Plane, color: "text-accent" },
    { label: "Expense Records", value: stats.expenses, icon: Receipt, color: "text-primary" },
    { label: "Total Spend", value: `$${stats.totalSpend.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Admin Overview</h1>
      <p className="text-muted-foreground mb-6">Platform-wide statistics and quick actions.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-display font-bold">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-card border border-border p-5">
        <h2 className="font-display font-semibold mb-2">About this console</h2>
        <p className="text-sm text-muted-foreground">
          You have full administrative access across all users, trips, and expenses. Use the sidebar
          to manage user roles or browse and edit any trip and its expenses.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
