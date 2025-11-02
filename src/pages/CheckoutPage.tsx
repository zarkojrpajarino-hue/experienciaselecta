import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CheckoutState {
  items: any[];
  isGiftMode: boolean;
  total: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, removeMultipleItems } = useCart();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    codigoPostal: "",
    ciudad: "",
    notas: ""
  });
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const state = location.state as CheckoutState;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  useEffect(() => {
    if (!state || !state.items || state.items.length === 0) {
      navigate("/carrito");
    }
  }, [state, navigate]);

  if (!state) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.direccion) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    // Aquí iría la lógica de procesamiento del pago
    toast.success("¡Pedido realizado con éxito!");
    
    // Limpiar carrito
    const itemIds = state.items.map(item => item.id);
    removeMultipleItems(itemIds);
    
    // Redirigir
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="link"
            onClick={() => navigate("/carrito")}
            className="text-black hover:text-black/80 p-0 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al carrito
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins font-bold">
                  {state.isGiftMode ? "Datos para el regalo" : "Datos de envío"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="border-2 border-black"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-2 border-black"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="border-2 border-black"
                    />
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                      className="border-2 border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigoPostal">Código Postal</Label>
                      <Input
                        id="codigoPostal"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        className="border-2 border-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="border-2 border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notas">Notas adicionales</Label>
                    <Textarea
                      id="notas"
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      className="border-2 border-black"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-poppins font-bold py-6 text-lg"
                  >
                    Confirmar pedido • {state.total.toFixed(2)}€
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Resumen del pedido */}
            <Card className="border-2 border-black h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins font-bold">
                  Resumen del pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-poppins font-semibold text-black">
                        {item.nombre || item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-poppins font-bold text-black">
                      {((item.precio || item.price) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
                
                <div className="border-t-2 border-black pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-poppins font-bold">Total</p>
                    <p className="text-2xl font-poppins font-bold" style={{ color: '#D4AF37' }}>
                      {state.total.toFixed(2)}€
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
