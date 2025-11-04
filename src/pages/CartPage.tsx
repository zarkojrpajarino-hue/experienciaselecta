import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";

const CartPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Redirigir automáticamente a checkout cuando hay items en el carrito
  useEffect(() => {
    const proceedToCheckout = (items: any[]) => {
      const giftItems = items.filter((item) => item.isGift === true);
      const personalItems = items.filter((item) => !item.isGift);
      const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
      navigate('/checkout', {
        replace: true,
        state: { giftItems, personalItems, total }
      });
    };

    if (cart.length > 0) {
      proceedToCheckout(cart as any[]);
      return;
    }

    // Si aún no se ha cargado el contexto, comprobar localStorage para evitar parpadeo
    try {
      const saved = localStorage.getItem('shopping-cart');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        proceedToCheckout(parsed);
      }
    } catch {}
  }, [cart, navigate]);

  // Evitar parpadeo de "carrito vacío" si hay items en localStorage
  const localHasItems = (() => {
    try {
      const saved = localStorage.getItem('shopping-cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  })();

  // Si hay items (en contexto o detectados en localStorage), no mostrar la página de vacío
  if (cart.length > 0 || localHasItems) {
    // Si aún no están en contexto pero sí en localStorage, mostrar un loader suave
    if (cart.length === 0 && localHasItems) {
      return (
        <>
          <Navbar />
          <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
          </div>
        </>
      );
    }
    return null; // Dejar que la redirección ocurra sin mostrar "vacío"
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-poppins font-bold text-black mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 mb-6">
                Añade productos para empezar tu experiencia selecta
              </p>
              <Button
                onClick={() => navigate('/#categoria-cestas')}
                className="bg-gold hover:bg-gold/90 text-black font-poppins font-bold"
              >
                Explorar cestas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CartPage;
