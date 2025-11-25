import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PageLoader } from "@/components/PageLoader";

// Páginas que se cargan directamente (críticas para UX)
import Index from "./pages/Index";
import ComprarCestasPage from "./pages/ComprarCestasPage";
import CheckoutPage from "./pages/CheckoutPage";
import ExperienciaSelectaPage from "./pages/ExperienciaSelectaPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";

// Lazy-loaded pages (cargan bajo demanda)
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));

const RegalosPage = lazy(() => import("./pages/RegalosPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EmptyCartPage = lazy(() => import("./pages/EmptyCartPage"));
const AutoLogin = lazy(() => import("./pages/AutoLogin"));
const ConocenosPage = lazy(() => import("./pages/ConocenosPage"));
const PreguntasFrecuentesPage = lazy(() => import("./pages/PreguntasFrecuentesPage"));
const SobreNosotrosDetalle = lazy(() => import("./pages/SobreNosotrosDetalle"));
const NuestrosClientesPage = lazy(() => import("./pages/NuestrosClientesPage"));

const queryClient = new QueryClient();

const App = () => {
  // Scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Página principal */}
                  <Route path="/" element={<Index />} />

                  {/* Catálogo y compra */}
                  <Route path="/comprar-cestas" element={<ComprarCestasPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/carrito-vacio" element={<EmptyCartPage />} />

                  {/* Pago */}
                  <Route path="/pago" element={<PaymentPage />} />
                  <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />

                  {/* Usuario */}
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/auto-login" element={<AutoLogin />} />
                  <Route path="/regalos" element={<RegalosPage />} />

                  {/* Feedback y reviews */}
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/review/:orderId" element={<ReviewPage />} />

                  {/* Información y contenido */}
                  <Route path="/nuestra-identidad" element={<ExperienciaSelectaPage />} />
                  <Route path="/conocenos" element={<ConocenosPage />} />
                  <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
                  <Route path="/sobre-nosotros" element={<SobreNosotrosDetalle />} />
                  <Route path="/nuestros-clientes" element={<NuestrosClientesPage />} />
                  

                  {/* 404 */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
