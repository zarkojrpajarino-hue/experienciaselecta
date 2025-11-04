import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

// Import critical pages directly (no lazy loading)
import Index from "./pages/Index";
import ComprarCestasPage from "./pages/ComprarCestasPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

// Lazy load non-critical pages for better performance
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const NuestraIdentidadPage = lazy(() => import("./pages/NuestraIdentidadPage"));
const SobreNosotrosDetalle = lazy(() => import("./pages/SobreNosotrosDetalle"));
const NuestrosClientesPage = lazy(() => import("./pages/NuestrosClientesPage"));
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
  <div className="min-h-screen bg-background flex flex-col gpu-accelerated">
    <div className="w-full h-20 bg-muted/20">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="flex-1 container mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  </div>
);

// (React Query deshabilitado temporalmente para evitar error de hook)


// Scroll to top on every route change
const ScrollToTopOnRouteChange = () => {
  const location = useLocation();

  // Disable browser scroll restoration to avoid keeping previous scroll on route changes
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = prev as ScrollRestoration;
      };
    }
  }, []);

  useEffect(() => {
    // Force immediate scroll to top on route change - multiple approaches for reliability
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also use requestAnimationFrame for post-render scroll
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [location.pathname]);
  return null;
};


const App = () => (
  <CartProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="bottom-right" />
      <AutoUpdater />
      
      <div className="min-h-screen bg-background gpu-accelerated">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<><ScrollToTopOnRouteChange /><Index /></>} />
            <Route path="/perfil" element={<><ScrollToTopOnRouteChange /><ProfilePage /></>} />
            <Route path="/carrito" element={<><ScrollToTopOnRouteChange /><CartPage /></>} />
            <Route path="/checkout" element={<><ScrollToTopOnRouteChange /><CheckoutPage /></>} />
            <Route path="/pago" element={<><ScrollToTopOnRouteChange /><PaymentPage /></>} />
            <Route path="/pago-exitoso" element={<><ScrollToTopOnRouteChange /><PaymentSuccessPage /></>} />
            <Route path="/nuestra-identidad" element={<><ScrollToTopOnRouteChange /><NuestraIdentidadPage /></>} />
            <Route path="/sobre-nosotros-detalle" element={<><ScrollToTopOnRouteChange /><SobreNosotrosDetalle /></>} />
            <Route path="/nuestros-clientes" element={<><ScrollToTopOnRouteChange /><NuestrosClientesPage /></>} />
            <Route path="/cestas" element={<Navigate to="/comprar-cestas" replace />} />
            <Route path="/comprar-cestas" element={<><ScrollToTopOnRouteChange /><ComprarCestasPage /></>} />
            <Route path="/experiencia" element={<><ScrollToTopOnRouteChange /><ExperienciaPage /></>} />
            <Route path="/experiencia-selecta" element={<><ScrollToTopOnRouteChange /><ExperienciaSelectaPage /></>} />
            <Route path="/preguntas-frecuentes" element={<><ScrollToTopOnRouteChange /><PreguntasFrecuentesPage /></>} />
            <Route path="/regalos" element={<><ScrollToTopOnRouteChange /><RegalosPage /></>} />
            <Route path="/feedback" element={<><ScrollToTopOnRouteChange /><FeedbackPage /></>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<><ScrollToTopOnRouteChange /><NotFound /></>} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </div>
    </TooltipProvider>
  </CartProvider>
);

export default App;
