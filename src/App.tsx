import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePosterStore } from "@/store/usePosterStore";      // ← ajoute
import Layout from "@/components/Layout";
import Index from "@/pages/Index";

import About from "@/pages/About";
import Order from "@/pages/Order";
import NotFound from "@/pages/NotFound";
import Subscribe from "@/pages/Subscribe";
import SubscribeCheckout from "@/pages/SubscribeCheckout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import { useLoadVisitorPosters } from "./hooks/useLoadVisitorPosters";


import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import { AuthProvider } from "@/hooks/useAuth"; // On va créer ce hook
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";

const queryClient = new QueryClient();

function PostersBootstrap() {
  useLoadVisitorPosters();
  return null;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider> {/* Enveloppez avec le fournisseur d'auth */}
            <PostersBootstrap />
            <Toaster />
            <Sonner />
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                
                <Route path="/about" element={<About />} />
                <Route path="/order" element={<Order />} />
                <Route path="/order/confirmation" element={<OrderConfirmation />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/subscribe/checkout" element={<SubscribeCheckout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
                <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
                <Route path="/verifier-email" element={<VerifyEmail />} />
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