import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AppLayout from "@/components/AppLayout";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TripsPage from "@/pages/TripsPage";
import TripDetailPage from "@/pages/TripDetailPage";
import NewTripPage from "@/pages/NewTripPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminTripsPage from "@/pages/admin/AdminTripsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/new" element={<NewTripPage />} />
                <Route path="/trips/:id" element={<TripDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/trips" element={<AdminTripsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
