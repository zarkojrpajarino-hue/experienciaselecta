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
    if (cart.length > 0) {
      const giftItems = cart.filter(item => item.isGift === true);
      const personalItems = cart.filter(item => !item.isGift);
      const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
      
      // Immediate redirect without showing cart page
      navigate('/checkout', {
        replace: true,
        state: {
          giftItems,
          personalItems,
          total
        }
      });
    }
  }, [cart, navigate]);

  // Solo mostrar cuando el carrito está vacío
  if (cart.length > 0) {
    return null; // No mostrar nada mientras se redirige
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
