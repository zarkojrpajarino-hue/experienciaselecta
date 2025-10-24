import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col">
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieBanner />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
