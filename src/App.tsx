import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import NuestraIdentidadPage from "./pages/NuestraIdentidadPage";
import SobreNosotrosDetalle from "./pages/SobreNosotrosDetalle";
import NuestrosClientesPage from "./pages/NuestrosClientesPage";
import CestasPage from "./pages/CestasPage";
import ExperienciaPage from "./pages/ExperienciaPage";
import ExperienciaSelectaPage from "./pages/ExperienciaSelectaPage";
import PreguntasFrecuentesPage from "./pages/PreguntasFrecuentesPage";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
