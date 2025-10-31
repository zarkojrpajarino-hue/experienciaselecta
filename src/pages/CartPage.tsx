import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, removeMultipleItems } = useCart();
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Separar cestas de regalo y cestas personales
  const giftItems = cart.filter(item => item.isGift === true);
  const personalItems = cart.filter(item => !item.isGift);
  const hasBothTypes = giftItems.length > 0 && personalItems.length > 0;

  const getGiftTotal = () => {
    return giftItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getPersonalTotal = () => {
    return personalItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const openCheckout = (items: typeof cart, giftMode: boolean) => {
    const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    navigate('/checkout', {
      state: {
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          name: item.nombre,
          precio: item.precio,
          price: item.precio,
          categoria: item.categoria,
          category: item.categoria,
          quantity: item.quantity,
          imagen: item.imagen
        })),
        isGiftMode: giftMode,
        total
      }
    });
  };

  if (cart.length === 0) {
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
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Botón volver a la página principal - encima de todo */}
          <Button
            onClick={() => {
              navigate('/');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            variant="link"
            className="text-black hover:text-gold mb-6 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la página principal
          </Button>

          <div className="space-y-8">
            {/* Cestas para Regalar Section */}
            {giftItems.length > 0 && (
              <div>
                {/* Botón seguir comprando regalos */}
                <Button
                  onClick={() => navigate('/cestas')}
                  variant="ghost"
                  className="text-black hover:text-gold bg-transparent hover:bg-transparent mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Seguir comprando regalos
                </Button>
                
                <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-black mb-6 flex items-center gap-2 sm:gap-3">
                  🎁 Cestas que vas a regalar
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Products List */}
                  <div className="lg:col-span-2 space-y-4">
                    {giftItems.map((item) => (
                      <motion.div
                        key={`gift-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                         <Card>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-4">
                              {/* Fila superior: Imagen + Info básica + Botón eliminar */}
                              <div className="flex gap-3 items-start">
                                {/* Imagen de la cesta */}
                                <div 
                                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setExpandedImage(item.imagen)}
                                >
                                  <img 
                                    src={item.imagen} 
                                    alt={item.nombre}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-2xl"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-poppins font-bold text-black mb-1 truncate">
                                    {item.nombre}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {item.categoria}
                                  </p>
                                  <p className="text-lg sm:text-xl font-bold text-gold">
                                    {item.precio.toFixed(2)}€
                                  </p>
                                </div>

                                {/* Botón eliminar */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Fila inferior: Controles de cantidad */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Cantidad:</span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-base font-bold w-8 text-center">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                         </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary for Gifts */}
                  <div className="lg:col-span-1">
                    <Card className="lg:sticky lg:top-24">
                      <CardHeader>
                        <CardTitle className="font-poppins text-black text-lg sm:text-xl">
                          Resumen de regalos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Items breakdown */}
                        <div className="space-y-2">
                          {giftItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs sm:text-sm gap-2">
                              <span className="text-gray-600 truncate flex-1">
                                {item.nombre} x{item.quantity}
                              </span>
                              <span className="font-poppins font-bold text-black flex-shrink-0">
                                {(item.precio * item.quantity).toFixed(2)}€
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Subtotal */}
                        <div className="flex justify-between text-lg">
                          <span className="font-poppins font-bold text-black">Subtotal</span>
                          <span className="font-poppins font-bold text-gold text-xl">
                            {getGiftTotal().toFixed(2)}€
                          </span>
                        </div>

                        <Separator />

                        <p className="text-xs text-gray-500 text-center">
                          Gastos de envío calculados en el checkout
                        </p>

                        <Button
                          onClick={() => openCheckout(giftItems, true)}
                          className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-base sm:text-lg py-5 sm:py-6"
                        >
                          Pagar solo regalos ({getGiftTotal().toFixed(2)}€)
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          Pago seguro con Stripe
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tus Cestas Section */}
            {personalItems.length > 0 && (
              <div>
                {/* Botón seguir comprando */}
                <Button
                  onClick={() => navigate('/#categoria-cestas')}
                  variant="ghost"
                  className="text-black hover:text-gold bg-transparent hover:bg-transparent mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Seguir comprando
                </Button>
                
                <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-black mb-6 flex items-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                  Tus cestas
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Products List */}
                  <div className="lg:col-span-2 space-y-4">
                    {personalItems.map((item) => (
                      <motion.div
                        key={`personal-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <Card>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-4">
                              {/* Fila superior: Imagen + Info básica + Botón eliminar */}
                              <div className="flex gap-3 items-start">
                                {/* Imagen de la cesta */}
                                <div 
                                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setExpandedImage(item.imagen)}
                                >
                                  <img 
                                    src={item.imagen} 
                                    alt={item.nombre}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-2xl"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-poppins font-bold text-black mb-1 truncate">
                                    {item.nombre}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {item.categoria}
                                  </p>
                                  <p className="text-lg sm:text-xl font-bold text-gold">
                                    {item.precio.toFixed(2)}€
                                  </p>
                                </div>

                                {/* Botón eliminar */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Fila inferior: Controles de cantidad */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Cantidad:</span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-base font-bold w-8 text-center">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary for Personal */}
                  <div className="lg:col-span-1">
                    <Card className="lg:sticky lg:top-24">
                      <CardHeader>
                        <CardTitle className="font-poppins text-black text-lg sm:text-xl">
                          Resumen del pedido
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Items breakdown */}
                        <div className="space-y-2">
                          {personalItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs sm:text-sm gap-2">
                              <span className="text-gray-600 truncate flex-1">
                                {item.nombre} x{item.quantity}
                              </span>
                              <span className="font-poppins font-bold text-black flex-shrink-0">
                                {(item.precio * item.quantity).toFixed(2)}€
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Subtotal */}
                        <div className="flex justify-between text-lg">
                          <span className="font-poppins font-bold text-black">Subtotal</span>
                          <span className="font-poppins font-bold text-gold text-xl">
                            {getPersonalTotal().toFixed(2)}€
                          </span>
                        </div>

                        <Separator />

                        <p className="text-xs text-gray-500 text-center">
                          Gastos de envío calculados en el checkout
                        </p>

                        <Button
                          onClick={() => openCheckout(personalItems, false)}
                          className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-base sm:text-lg py-5 sm:py-6"
                        >
                          Pagar solo tus cestas ({getPersonalTotal().toFixed(2)}€)
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          Pago seguro con Stripe
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta de pago conjunto cuando hay ambos tipos */}
            {hasBothTypes && (
              <div className="mt-8">
                <h1 className="text-3xl font-poppins font-bold text-black mb-6 flex items-center gap-3">
                  💳 Pagar ambos carritos a la vez
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Descripción */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <p className="text-lg font-poppins text-black">
                            Puedes pagar todas tus cestas (regalos y personales) en un solo proceso.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gold/10 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Cestas para regalar</p>
                              <p className="text-2xl font-poppins font-bold text-black">
                                {giftItems.length} {giftItems.length === 1 ? 'cesta' : 'cestas'}
                              </p>
                              <p className="text-lg font-poppins font-bold text-gold mt-1">
                                {getGiftTotal().toFixed(2)}€
                              </p>
                            </div>
                            <div className="p-4 bg-gold/10 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Tus cestas</p>
                              <p className="text-2xl font-poppins font-bold text-black">
                                {personalItems.length} {personalItems.length === 1 ? 'cesta' : 'cestas'}
                              </p>
                              <p className="text-lg font-poppins font-bold text-gold mt-1">
                                {getPersonalTotal().toFixed(2)}€
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumen y botón de pago */}
                  <div className="lg:col-span-1">
                    <Card className="lg:sticky lg:top-24">
                      <CardHeader>
                        <CardTitle className="font-poppins text-black text-lg sm:text-xl">
                          Resumen total
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm gap-2">
                            <span className="text-gray-600">Cestas de regalo</span>
                            <span className="font-poppins font-bold text-black flex-shrink-0">
                              {getGiftTotal().toFixed(2)}€
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm gap-2">
                            <span className="text-gray-600">Tus cestas</span>
                            <span className="font-poppins font-bold text-black flex-shrink-0">
                              {getPersonalTotal().toFixed(2)}€
                            </span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-base sm:text-lg">
                          <span className="font-poppins font-bold text-black">Total</span>
                          <span className="font-poppins font-bold text-gold text-xl sm:text-2xl">
                            {getTotalAmount().toFixed(2)}€
                          </span>
                        </div>

                        <Separator />

                        <p className="text-xs text-gray-500 text-center">
                          Gastos de envío calculados en el checkout
                        </p>

                        <Button
                          onClick={() => openCheckout(cart, giftItems.length > 0)}
                          className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-base sm:text-lg py-5 sm:py-6"
                        >
                          Continuar al pago ({getTotalAmount().toFixed(2)}€)
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          Pago seguro con Stripe
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Imagen Expandida Modal */}
      <AnimatePresence>
        {expandedImage && (
          <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
            <DialogContent className="max-w-4xl w-full p-4 bg-black/90 border-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex items-center justify-center"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 z-50 bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage(null);
                  }}
                >
                  <X className="w-6 h-6" />
                </Button>
                <img
                  src={expandedImage}
                  alt="Cesta expandida"
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartPage;
