import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import DatabaseFix from "./pages/DatabaseFix";
import TestRegistration from "./pages/TestRegistration";
import NotFound from "./pages/NotFound";
import "./utils/testDatabase";
import "./utils/testRegistration";
import "./utils/fixDatabasePolicies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AuthGuard requiredRole="admin"><AdminDashboard /></AuthGuard>} />
            <Route path="/student" element={<AuthGuard requiredRole="student"><StudentDashboard /></AuthGuard>} />
            <Route path="/admin-dashboard" element={<AuthGuard requiredRole="admin"><AdminDashboard /></AuthGuard>} />
            <Route path="/student-dashboard" element={<AuthGuard requiredRole="student"><StudentDashboard /></AuthGuard>} />
            <Route path="/database-fix" element={<DatabaseFix />} />
            <Route path="/test-registration" element={<TestRegistration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
