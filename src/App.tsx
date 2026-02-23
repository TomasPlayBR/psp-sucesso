import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import LandingPage from "@/pages/LandingPage";
import Hub from "@/pages/Hub";
import Blacklist from "@/pages/Blacklist";
import BlacklistPublica from "@/pages/BlacklistPublica";
import JuntateaNos from "@/pages/JuntateaNos";
import Codigos10 from "@/pages/Codigos10";
import Logs from "@/pages/Logs";
import Superiores from "@/pages/Superiores";
import Missoes from "@/pages/Missoes";
import MissionLogs from "@/pages/MissionLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Landing page pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Páginas públicas */}
      <Route path="/blacklist-pub" element={<BlacklistPublica />} />
      <Route path="/junta-te" element={<JuntateaNos />} />
      <Route path="/login" element={currentUser ? <Navigate to="/hub" replace /> : <Login />} />

      {/* Hub — protegido, todos os autenticados */}
      <Route path="/hub" element={
        <ProtectedRoute>
          <Layout><Hub /></Layout>
        </ProtectedRoute>
      } />

      {/* Blacklist interna — protegido */}
      <Route path="/blacklist" element={
        <ProtectedRoute>
          <Layout><Blacklist /></Layout>
        </ProtectedRoute>
      } />

      {/* Códigos 10 — protegido, todos os autenticados */}
      <Route path="/codigos10" element={
        <ProtectedRoute>
          <Layout><Codigos10 /></Layout>
        </ProtectedRoute>
      } />

      {/* Logs — só superiores */}
      <Route path="/logs" element={
        <ProtectedRoute requireSuperior>
          <Layout><Logs /></Layout>
        </ProtectedRoute>
      } />

      {/* Superiores — só superiores */}
      <Route path="/superiores" element={
        <ProtectedRoute requireSuperior>
          <Layout><Superiores /></Layout>
        </ProtectedRoute>
      } />

     {/* Missões — protegido, todos os autenticados */}
      <Route path="/missoes" element={
        <ProtectedRoute>
          <Layout><Missoes /></Layout>
        </ProtectedRoute>
      } />

     {/* Logs de Missões — só superiores */}
      <Route path="/mission-logs" element={
       <ProtectedRoute requireSuperior>
         <Layout><MissionLogs /></Layout>
       </ProtectedRoute>
     } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

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
