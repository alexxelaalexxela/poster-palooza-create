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

const queryClient = new QueryClient();

/* ─────────────────────────────────────────────── */
/*                App Component                    */
/* ─────────────────────────────────────────────── */
const App = () => {
  useLoadVisitorPosters();

  /* rendu identique à l’original */
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/order" element={<Order />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;




