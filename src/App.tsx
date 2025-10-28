import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";

// Lazy load pages for better performance
import Index from "./pages/Index";
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const NuestraIdentidadPage = lazy(() => import("./pages/NuestraIdentidadPage"));
const SobreNosotrosDetalle = lazy(() => import("./pages/SobreNosotrosDetalle"));
const NuestrosClientesPage = lazy(() => import("./pages/NuestrosClientesPage"));
const CestasPage = lazy(() => import("./pages/CestasPage"));
const ExperienciaPage = lazy(() => import("./pages/ExperienciaPage"));
const ExperienciaSelectaPage = lazy(() => import("./pages/ExperienciaSelectaPage"));
const PreguntasFrecuentesPage = lazy(() => import("./pages/PreguntasFrecuentesPage"));
const RegalosPage = lazy(() => import("./pages/RegalosPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import CookieBanner from "./components/CookieBanner";
import AutoUpdater from "./components/AutoUpdater";

// Loading component with GPU acceleration
const PageLoader = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center gpu-accelerated z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-muted-foreground font-work-sans">Cargando...</p>
    </div>
  </div>
);

// Configure QueryClient with optimized defaults for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AutoUpdater />
        <BrowserRouter>
          <div className="min-h-screen bg-background gpu-accelerated">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/nuestra-identidad" element={<NuestraIdentidadPage />} />
                <Route path="/sobre-nosotros-detalle" element={<SobreNosotrosDetalle />} />
                <Route path="/nuestros-clientes" element={<NuestrosClientesPage />} />
                <Route path="/cestas" element={<CestasPage />} />
                <Route path="/experiencia" element={<ExperienciaPage />} />
                <Route path="/experiencia-selecta" element={<ExperienciaSelectaPage />} />
                <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
                <Route path="/regalos" element={<RegalosPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieBanner />
            </Suspense>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
