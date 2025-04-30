
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Protected Route component to handle authentication
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isLoading, clientInfo } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="h-10 w-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin routes check
  if (adminOnly) {
    // Check if user is admin (using email for now)
    const isAdmin = user.email?.includes('admin');
    
    if (!isAdmin) {
      return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
