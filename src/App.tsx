import * as React from "react";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { PageLoader } from "@/components/PageLoader";

// Import critical pages directly (no lazy loading)
import Index from "./pages/Index";
import ComprarCestasPage from "./pages/ComprarCestasPage";
import CheckoutPage from "./pages/CheckoutPage";
import ExperienciaSelectaPage from "./pages/ExperienciaSelectaPage";
import NuestrosClientesPage from "./pages/NuestrosClientesPage";
import SobreNosotrosDetalle from "./pages/SobreNosotrosDetalle";
import PreguntasFrecuentesPage from "./pages/PreguntasFrecuentesPage";

// Lazy load non-critical pages for better performance
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const NuestraIdentidadPage = lazy(() => import("./pages/NuestraIdentidadPage"));
const ExperienciaPage = lazy(() => import("./pages/ExperienciaPage"));
const RegalosPage = lazy(() => import("./pages/RegalosPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const ConocenosPage = lazy(() => import("./pages/ConocenosPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import CookieBanner from "./components/CookieBanner";
import AutoUpdater from "./components/AutoUpdater";

// (React Query deshabilitado temporalmente para evitar error de hook)


// Scroll to top on every route change - optimizado para evitar tirones
const ScrollToTopOnRouteChange = () => {
  const location = useLocation();

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Scroll instantáneo al top sin smooth behavior
    // Usa behavior: 'instant' para evitar conflictos con CSS scroll-behavior
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  
  return null;
};


const App = () => (
  <AuthProvider>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" />
        <AutoUpdater />
        <ScrollToTopOnRouteChange />
        
        <div className="min-h-screen bg-background gpu-accelerated">
          <Suspense fallback={<PageLoader />}>
            <PageLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/carrito" element={<CheckoutPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pago" element={<PaymentPage />} />
                <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
                <Route path="/nuestra-identidad" element={<NuestraIdentidadPage />} />
                <Route path="/sobre-nosotros-detalle" element={<SobreNosotrosDetalle />} />
                <Route path="/nuestros-clientes" element={<NuestrosClientesPage />} />
                <Route path="/cestas" element={<Navigate to="/comprar-cestas" replace />} />
                <Route path="/comprar-cestas" element={<ComprarCestasPage />} />
                <Route path="/experiencia" element={<ExperienciaPage />} />
                <Route path="/experiencia-selecta" element={<ExperienciaSelectaPage />} />
                <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
                <Route path="/regalos" element={<RegalosPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/review/:orderId" element={<ReviewPage />} />
                <Route path="/conocenos" element={<ConocenosPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageLayout>
          </Suspense>
          <CookieBanner />
        </div>
      </TooltipProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
