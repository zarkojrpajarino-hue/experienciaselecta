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

  // Redirigir sin mostrar estados intermedios
  useEffect(() => {
    if (cart.length > 0) {
      navigate('/checkout', { replace: true });
    } else {
      navigate('/#categoria-cestas', { replace: true });
    }
  }, [cart.length, navigate]);

  // No mostrar nunca página de carrito vacío
  // Mostrar un loader breve mientras redirigimos
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
    </div>
  );

  // (UI eliminada) Nunca mostrar mensaje de "carrito vacío"
  // Este return ya ha sido reemplazado por el loader anterior
  // Mantener retorno vacío por seguridad
  return null;
};

export default CartPage;
