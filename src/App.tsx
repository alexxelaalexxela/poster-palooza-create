import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePosterStore } from "@/store/usePosterStore";      // ← ajoute
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Order from "@/pages/Order";
import NotFound from "@/pages/NotFound";
import { useLoadVisitorPosters } from "./hooks/useLoadVisitorPosters";


import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import { AuthProvider } from "@/hooks/useAuth"; // On va créer ce hook

const queryClient = new QueryClient();

const App = () => {
  useLoadVisitorPosters();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider> {/* Enveloppez avec le fournisseur d'auth */}
            <Toaster />
            <Sonner />
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/order" element={<Order />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;