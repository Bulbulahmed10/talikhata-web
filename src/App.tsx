import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Reports from "./pages/Reports";
import PWAInstallButton from "./components/PWAInstallButton";
import PWAStatus from "./components/PWAStatus";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route 
            path="/" 
            element={user ? <Index /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/customers" 
            element={user ? <Customers /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/customers/:id" 
            element={user ? <CustomerDetail /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/reports" 
            element={user ? <Reports /> : <Navigate to="/auth" replace />} 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* PWA Install Button - Always visible */}
        <PWAInstallButton />
        
        {/* PWA Status Indicator */}
        <PWAStatus />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
