import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { store } from "@/store";
import { ErrorBoundary, LoadingSpinner } from "@/components/common";
import Layout from "./components/Layout/Layout";
import Index from "./pages/Index";
import AuthForm from "./components/AuthForm";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Reports from "./pages/Reports";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <Sonner />
          <ErrorBoundary>
            <Routes>
              <Route 
                path="/auth" 
                element={user ? <Navigate to="/" replace /> : <AuthForm />} 
              />
              <Route 
                path="/" 
                element={user ? <Layout><Index /></Layout> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/customers" 
                element={user ? <Layout><Customers /></Layout> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/customers/:id" 
                element={user ? <Layout><CustomerDetail /></Layout> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/reports" 
                element={user ? <Layout><Reports /></Layout> : <Navigate to="/auth" replace />} 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
