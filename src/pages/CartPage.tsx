import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import CheckoutModal from "@/components/CheckoutModal";
import { motion } from "framer-motion";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalAmount } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGiftMode, setIsGiftMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar si viene de /cestas (modo regalo)
  const isFromGiftCatalog = location.state?.fromGiftCatalog === true;

  useEffect(() => {
    // Si viene del catálogo de regalo, activar modo regalo automáticamente
    if (isFromGiftCatalog) {
      setIsGiftMode(true);
    }
  }, [isFromGiftCatalog]);

  const handleCheckout = (giftMode: boolean = false) => {
    setIsGiftMode(giftMode);
    setIsCheckoutOpen(true);
  };

  // Map CartItem to BasketItem for CheckoutModal
  const basketItems = cart.map(item => ({
    id: item.id,
    name: item.nombre,
    price: item.precio,
    category: item.categoria,
    quantity: item.quantity
  }));

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <Button
              onClick={() => navigate('/#categoria-cestas')}
              variant="ghost"
              className="mb-6 text-black hover:text-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a cestas
            </Button>
            
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
          <Button
            onClick={() => navigate('/#categoria-cestas')}
            variant="ghost"
            className="mb-6 text-black hover:text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Seguir comprando
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-3xl font-poppins font-bold text-black mb-6 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-gold" />
                Tu Carrito
              </h1>

              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-poppins font-bold text-black">
                            {item.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {item.categoria}
                          </p>
                          <p className="text-xl font-poppins font-bold text-gold mt-2">
                            {item.precio.toFixed(2)}€
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 text-black hover:text-gold"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <span className="w-8 text-center font-poppins font-bold text-black">
                              {item.quantity}
                            </span>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 text-black hover:text-gold"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-poppins text-black">
                    Resumen del pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items breakdown */}
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.nombre} x{item.quantity}
                        </span>
                        <span className="font-poppins font-bold text-black">
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
                      {getTotalAmount().toFixed(2)}€
                    </span>
                  </div>

                  <Separator />

                  <p className="text-xs text-gray-500 text-center">
                    Gastos de envío calculados en el checkout
                  </p>

                  {/* Checkout Buttons - Solo regalo si viene de /cestas */}
                  {isFromGiftCatalog ? (
                    <Button
                      onClick={() => handleCheckout(true)}
                      className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-lg py-6"
                    >
                      🎁 Regalar esta cesta
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleCheckout(true)}
                        variant="outline"
                        className="w-full border-gold text-gold hover:bg-gold hover:text-black font-poppins font-bold text-lg py-6"
                      >
                        🎁 Regalar esta cesta
                      </Button>

                      <Button
                        onClick={() => handleCheckout(false)}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-lg py-6"
                      >
                        Pagar para mí
                      </Button>
                    </>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    Pago seguro con Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsGiftMode(false);
        }}
        basketItems={basketItems}
        totalAmount={getTotalAmount()}
        isGiftMode={isGiftMode}
      />
    </>
  );
};

export default CartPage;
