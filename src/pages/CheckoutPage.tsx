import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

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

  // Scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Si no hay items, volver al carrito
  useEffect(() => {
    if (!state || !state.items || state.items.length === 0) {
      navigate("/carrito");
    }
  }, [state, navigate]);

  // Expandir items por cantidad para poder asignar por unidad (solo para regalos)
  const expandedItems = React.useMemo(() => {
    if (!state?.items) return [] as Array<any & { uniqueId: string }>;
    const out: Array<any & { uniqueId: string }> = [];
    state.items.forEach((it: any) => {
      const qty = it.quantity || 1;
      for (let i = 0; i < qty; i++) {
        out.push({ ...it, uniqueId: `${it.id}-${i}` });
      }
    });
    return out;
  }, [state]);

  // Datos de regalo (solo en modo regalo)
  const [giftData, setGiftData] = useState({
    senderName: "",
    senderEmail: "",
    recipients: [
      { recipientName: "", recipientEmail: "", recipientPhone: "", personalNote: "", basketIds: [] as string[] }
    ]
  });

  // Total a pagar: solo cestas asignadas en regalo, o total normal
  const payableTotal = React.useMemo(() => {
    if (!state?.isGiftMode) return state?.total || 0;
    const assigned = new Set(giftData.recipients.flatMap((r: any) => r.basketIds));
    return expandedItems
      .filter((it) => assigned.has(it.uniqueId))
      .reduce((s, it) => s + (it.precio || it.price || 0), 0);
  }, [state, giftData, expandedItems]);

  if (!state) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.isGiftMode) {
      const recipients = (giftData as any).recipients as any[];
      const assigned = recipients.flatMap((r) => r.basketIds);
      if (assigned.length === 0) {
        toast.error("Debes asignar al menos una cesta a un destinatario.");
        return;
      }
      for (const r of recipients) {
        if (!r.recipientName || (!r.recipientEmail && !r.recipientPhone)) {
          toast.error("Cada destinatario debe tener nombre y email o móvil.");
          return;
        }
      }
      toast.success("Asignación lista. Procederemos al pago en el siguiente paso.");
      // Aquí iría la lógica de pago (Stripe)
      return;
    }
    
    // Validación básica (modo normal)
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.direccion) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    toast.success("¡Pedido realizado con éxito!");
    const itemIds = state.items.map(item => item.id);
    removeMultipleItems(itemIds);
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
                {state.isGiftMode ? (
                  // Modo Regalo: remitente + destinatarios + asignación de cestas
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="senderName">Tu nombre *</Label>
                        <Input
                          id="senderName"
                          value={(giftData as any).senderName}
                          onChange={(e) => setGiftData((prev: any) => ({ ...prev, senderName: e.target.value }))}
                          placeholder="¿Quién regala?"
                          required
                          className="border-2 border-black"
                        />
                      </div>
                      <div>
                        <Label htmlFor="senderEmail">Tu email *</Label>
                        <Input
                          id="senderEmail"
                          type="email"
                          value={(giftData as any).senderEmail}
                          onChange={(e) => setGiftData((prev: any) => ({ ...prev, senderEmail: e.target.value }))}
                          placeholder="tu@email.com"
                          required
                          className="border-2 border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(giftData as any).recipients.map((recipient: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Regalo {index + 1}</h4>
                            {(giftData as any).recipients.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newRecipients = (giftData as any).recipients.filter((_: any, i: number) => i !== index);
                                  setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`recipientName-${index}`}>Nombre destinatario *</Label>
                            <Input
                              id={`recipientName-${index}`}
                              value={recipient.recipientName}
                              onChange={(e) => {
                                const newRecipients = [...(giftData as any).recipients];
                                newRecipients[index].recipientName = e.target.value;
                                setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                              }}
                              placeholder="¿A quién se lo regalas?"
                              required
                              className="border-2 border-black"
                            />
                          </div>

                          <div className="flex items-center justify-center gap-2 -mt-2">
                            <p className="text-center text-xs text-muted-foreground">(solo uno de los dos obligatorio)</p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-black/10">
                                  <span className="sr-only">Información sobre el proceso de regalo</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4"/>
                                    <path d="M12 8h.01"/>
                                  </svg>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                                <DialogTitle>¿Cómo funciona el proceso de regalo?</DialogTitle>
                                <DialogDescription asChild>
                                  <div className="space-y-3 text-sm leading-relaxed">
                                    <p className="font-semibold text-base">Proceso paso a paso:</p>
                                    
                                    <div className="space-y-2">
                                      <p><span className="font-bold">1. Eliges el canal de envío:</span></p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-bold">Por email:</span> El destinatario recibe un correo electrónico con un enlace seguro personalizado.</li>
                                        <li><span className="font-bold">Por móvil:</span> El destinatario recibe un SMS con un enlace seguro de reclamación.</li>
                                      </ul>
                                    </div>

                                    <div className="space-y-2">
                                      <p><span className="font-bold">2. ¿Por qué enviamos al destinatario?</span></p>
                                      <p className="pl-5">Le enviamos un mensaje para que pueda <span className="font-bold">confirmar sus datos de envío</span> y elegir la <span className="font-bold">fecha de entrega preferida</span>. Así garantizamos que reciba su regalo en el momento perfecto.</p>
                                    </div>

                                    <div className="space-y-2">
                                      <p><span className="font-bold">3. ¿Qué hace el destinatario?</span></p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        <li>Hace clic en el enlace recibido (válido durante 30 días)</li>
                                        <li>Confirma o introduce su dirección de envío</li>
                                        <li>Selecciona su fecha preferida de entrega</li>
                                        <li>¡Y listo! Recibirá su experiencia selecta en la fecha elegida</li>
                                      </ul>
                                    </div>

                                    <p className="text-xs text-muted-foreground pt-2">
                                      💡 <span className="font-semibold">Nota:</span> Tú pagas ahora, pero el destinatario controla cuándo y dónde recibe su regalo.
                                    </p>
                                  </div>
                                </DialogDescription>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`recipientEmail-${index}`}>Email destinatario</Label>
                              <Input
                                id={`recipientEmail-${index}`}
                                type="email"
                                value={recipient.recipientEmail}
                                onChange={(e) => {
                                  const newRecipients = [...(giftData as any).recipients];
                                  newRecipients[index].recipientEmail = e.target.value;
                                  setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                                }}
                                placeholder="email@ejemplo.com"
                                required={!recipient.recipientPhone}
                                className="border-2 border-black"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`recipientPhone-${index}`}>Número destinatario</Label>
                              <Input
                                id={`recipientPhone-${index}`}
                                type="tel"
                                value={recipient.recipientPhone}
                                onChange={(e) => {
                                  const newRecipients = [...(giftData as any).recipients];
                                  newRecipients[index].recipientPhone = e.target.value;
                                  setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                                }}
                                placeholder="+34 600 000 000"
                                required={!recipient.recipientEmail}
                                className="border-2 border-black"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`personalNote-${index}`}>Nota personal</Label>
                            <Textarea
                              id={`personalNote-${index}`}
                              value={recipient.personalNote}
                              onChange={(e) => {
                                const newRecipients = [...(giftData as any).recipients];
                                newRecipients[index].personalNote = e.target.value;
                                setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                              }}
                              placeholder="Escribe una nota..."
                              rows={2}
                              className="border-2 border-black"
                            />
                          </div>

                          <div>
                            <Label>Asignar cestas de regalo</Label>
                            <p className="text-xs text-muted-foreground mb-2">Selecciona qué cestas van para {recipient.recipientName || 'este destinatario'}</p>
                            <div className="space-y-2">
                              {expandedItems
                                .filter((it) => {
                                  // Mostrar solo cestas no asignadas a otros destinatarios
                                  const assignedElsewhere = (giftData as any).recipients
                                    .filter((_: any, i: number) => i !== index)
                                    .some((r: any) => r.basketIds.includes(it.uniqueId));
                                  return !assignedElsewhere;
                                })
                                 .map((it) => (
                                  <div 
                                    key={it.uniqueId} 
                                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                                    onClick={() => {
                                      const newRecipients = [...(giftData as any).recipients];
                                      const isChecked = recipient.basketIds.includes(it.uniqueId);
                                      if (!isChecked) {
                                        newRecipients[index].basketIds = [...newRecipients[index].basketIds, it.uniqueId];
                                      } else {
                                        newRecipients[index].basketIds = newRecipients[index].basketIds.filter((id: string) => id !== it.uniqueId);
                                      }
                                      setGiftData((prev: any) => ({ ...prev, recipients: newRecipients }));
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`basket-${it.uniqueId}-recipient-${index}`}
                                        checked={recipient.basketIds.includes(it.uniqueId)}
                                        onChange={() => {}} // Handled by parent div onClick
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <label htmlFor={`basket-${it.uniqueId}-recipient-${index}`} className="text-sm cursor-pointer">
                                        {(it.nombre || it.name)}
                                      </label>
                                    </div>
                                    <span className="text-sm font-semibold">{((it.precio || it.price)).toFixed(2)}€</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const assigned = new Set((giftData as any).recipients.flatMap((r: any) => r.basketIds));
                      const remaining = expandedItems.filter((it) => !assigned.has(it.uniqueId)).length;
                      return remaining > 0 && (
                        <Button type="button" variant="outline" className="w-full" onClick={() => setGiftData((prev: any) => ({ ...prev, recipients: [...prev.recipients, { recipientName: "", recipientEmail: "", recipientPhone: "", personalNote: "", basketIds: [] }] }))}>
                          <Plus className="w-4 h-4 mr-2" /> Añadir otro destinatario ({remaining} restante{remaining !== 1 ? 's' : ''})
                        </Button>
                      );
                    })()}

                    <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-poppins font-bold py-6 text-lg">
                      Proceder al pago • {payableTotal.toFixed(2)}€
                    </Button>
                  </form>
                ) : (
                  // Modo normal (envío)
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
                        <Input id="codigoPostal" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} className="border-2 border-black" />
                      </div>
                      <div>
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="border-2 border-black" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notas">Notas adicionales</Label>
                      <Textarea id="notas" name="notas" value={formData.notas} onChange={handleInputChange} className="border-2 border-black" rows={3} />
                    </div>
                    <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-poppins font-bold py-6 text-lg">
                      Confirmar pedido • {state.total.toFixed(2)}€
                    </Button>
                  </form>
                )}

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
