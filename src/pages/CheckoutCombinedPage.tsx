import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Plus, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CartItem {
  id: string;
  nombre: string;
  name?: string;
  precio: number;
  price?: number;
  categoria: string;
  category?: string;
  quantity: number;
  imagen: string;
}

const CheckoutCombinedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { giftItems, personalItems, total } = location.state as {
    giftItems: CartItem[];
    personalItems: CartItem[];
    total: number;
  };

  // Expandir items de regalo por cantidad para asignación individual
  const expandedGiftItems = React.useMemo(() => {
    const out: Array<CartItem & { uniqueId: string }> = [];
    giftItems.forEach((it) => {
      const qty = it.quantity || 1;
      for (let i = 0; i < qty; i++) {
        out.push({ ...it, uniqueId: `${it.id}-${i}` });
      }
    });
    return out;
  }, [giftItems]);

  const [giftAssignment, setGiftAssignment] = useState({
    senderName: "",
    senderEmail: "",
    recipients: [
      { recipientName: "", recipientEmail: "", recipientPhone: "", personalNote: "", basketIds: [] as string[] }
    ]
  });

  const [personalDataOpen, setPersonalDataOpen] = useState(false);
  const [giftDataOpen, setGiftDataOpen] = useState(false);

  // Datos personales para cestas propias
  const [personalData, setPersonalData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const getGiftTotal = () => {
    return giftItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  };

  const getPersonalTotal = () => {
    return personalItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  };

  const getAssignedGiftTotal = () => {
    const assignedIds = new Set(giftAssignment.recipients.flatMap((r) => r.basketIds));
    return expandedGiftItems
      .filter((it) => assignedIds.has(it.uniqueId))
      .reduce((sum, item) => sum + item.precio, 0);
  };

  const handleContinueToPayment = () => {
    // Validar datos personales
    if (personalItems.length > 0) {
      if (!personalData.name || !personalData.email || !personalData.phone || !personalData.address || !personalData.city || !personalData.postalCode) {
        toast.error("Debes completar todos tus datos personales para las cestas propias.");
        return;
      }
    }

    // Validar asignación de regalos
    if (giftItems.length > 0) {
      const assigned = giftAssignment.recipients.flatMap((r) => r.basketIds);
      if (assigned.length === 0) {
        toast.error("Debes asignar al menos una cesta a un destinatario.");
        return;
      }
      for (const r of giftAssignment.recipients) {
        if (!r.recipientName || (!r.recipientEmail && !r.recipientPhone)) {
          toast.error("Cada destinatario debe tener nombre y email o móvil.");
          return;
        }
      }
      if (!giftAssignment.senderName || !giftAssignment.senderEmail) {
        toast.error("Debes completar tus datos como remitente.");
        return;
      }
    }

    // Navegar al checkout con todos los items
    const allItems = [...giftItems, ...personalItems];
    navigate('/checkout', {
      state: {
        items: allItems,
        isGiftMode: true,
        total,
        giftAssignment,
        personalData
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Botón volver al carrito */}
          <Button
            onClick={() => navigate('/cart')}
            variant="link"
            className="text-black hover:text-gold mb-6 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al carrito
          </Button>

          <h1 className="text-3xl font-poppins font-bold text-black mb-6">
            💳 Checkout Combinado
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de asignación de regalos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumen visual */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-lg font-poppins text-black">
                      Para completar el pago conjunto, completa los datos necesarios.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setGiftDataOpen(!giftDataOpen)}
                        className="p-4 bg-gold/10 rounded-lg hover:bg-gold/20 transition-colors text-left"
                      >
                        <p className="text-sm text-gray-600 mb-1">Cestas para regalar</p>
                        <p className="text-2xl font-poppins font-bold text-black">
                          {giftItems.reduce((sum, item) => sum + item.quantity, 0)} {giftItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'cesta' : 'cestas'}
                        </p>
                        <p className="text-lg font-poppins font-bold text-gold mt-1">
                          {getGiftTotal().toFixed(2)}€
                        </p>
                      </button>
                      <button
                        onClick={() => setPersonalDataOpen(!personalDataOpen)}
                        className="p-4 bg-gold/10 rounded-lg hover:bg-gold/20 transition-colors text-left"
                      >
                        <p className="text-sm text-gray-600 mb-1">Tus cestas</p>
                        <p className="text-2xl font-poppins font-bold text-black">
                          {personalItems.reduce((sum, item) => sum + item.quantity, 0)} {personalItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'cesta' : 'cestas'}
                        </p>
                        <p className="text-lg font-poppins font-bold text-gold mt-1">
                          {getPersonalTotal().toFixed(2)}€
                        </p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Datos personales para cestas propias */}
              {personalItems.length > 0 && (
                <Collapsible open={personalDataOpen} onOpenChange={setPersonalDataOpen}>
                  <CollapsibleContent>
                    <Card className="border-2 border-black">
                      <CardHeader>
                        <CardTitle className="text-xl font-poppins font-bold">Tus datos de envío</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="personalName">Nombre completo *</Label>
                            <Input
                              id="personalName"
                              value={personalData.name}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Tu nombre"
                              className="border-2 border-black"
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalEmail">Email *</Label>
                            <Input
                              id="personalEmail"
                              type="email"
                              value={personalData.email}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="tu@email.com"
                              className="border-2 border-black"
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalPhone">Teléfono *</Label>
                            <Input
                              id="personalPhone"
                              type="tel"
                              value={personalData.phone}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="+34 600 000 000"
                              className="border-2 border-black"
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalAddress">Dirección *</Label>
                            <Input
                              id="personalAddress"
                              value={personalData.address}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, address: e.target.value }))}
                              placeholder="Calle, número, piso..."
                              className="border-2 border-black"
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalCity">Ciudad *</Label>
                            <Input
                              id="personalCity"
                              value={personalData.city}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Tu ciudad"
                              className="border-2 border-black"
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalPostalCode">Código postal *</Label>
                            <Input
                              id="personalPostalCode"
                              value={personalData.postalCode}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, postalCode: e.target.value }))}
                              placeholder="28001"
                              className="border-2 border-black"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Asignación de destinatarios para regalos */}
              {giftItems.length > 0 && (
                <Collapsible open={giftDataOpen} onOpenChange={setGiftDataOpen}>
                  <CollapsibleContent>
                    <div className="space-y-4">
                      {/* Datos del remitente */}
                      <Card className="border-2 border-black">
                        <CardHeader>
                          <CardTitle className="text-xl font-poppins font-bold">Datos del remitente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="senderName">Tu nombre *</Label>
                              <Input
                                id="senderName"
                                value={giftAssignment.senderName}
                                onChange={(e) => setGiftAssignment((prev) => ({ ...prev, senderName: e.target.value }))}
                                placeholder="¿Quién regala?"
                                className="border-2 border-black"
                              />
                            </div>
                            <div>
                              <Label htmlFor="senderEmail">Tu email *</Label>
                              <Input
                                id="senderEmail"
                                type="email"
                                value={giftAssignment.senderEmail}
                                onChange={(e) => setGiftAssignment((prev) => ({ ...prev, senderEmail: e.target.value }))}
                                placeholder="tu@email.com"
                                className="border-2 border-black"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Asignación de destinatarios */}
                      <div className="space-y-4">
                {giftAssignment.recipients.map((recipient, index) => (
                  <Card key={index} className="border-2 border-black">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Regalo {index + 1}</CardTitle>
                        {giftAssignment.recipients.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRecipients = giftAssignment.recipients.filter((_, i) => i !== index);
                              setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`recipientName-${index}`}>Nombre destinatario *</Label>
                        <Input
                          id={`recipientName-${index}`}
                          value={recipient.recipientName}
                          onChange={(e) => {
                            const newRecipients = [...giftAssignment.recipients];
                            newRecipients[index].recipientName = e.target.value;
                            setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                          }}
                          placeholder="¿A quién se lo regalas?"
                          className="border-2 border-black"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <p className="text-center text-xs text-muted-foreground">(solo uno de los dos obligatorio)</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-black/10">
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                              const newRecipients = [...giftAssignment.recipients];
                              newRecipients[index].recipientEmail = e.target.value;
                              setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                            }}
                            placeholder="email@ejemplo.com"
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
                              const newRecipients = [...giftAssignment.recipients];
                              newRecipients[index].recipientPhone = e.target.value;
                              setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                            }}
                            placeholder="+34 600 000 000"
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
                            const newRecipients = [...giftAssignment.recipients];
                            newRecipients[index].personalNote = e.target.value;
                            setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
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
                          {expandedGiftItems
                            .filter((it) => {
                              const assignedElsewhere = giftAssignment.recipients
                                .filter((_, i) => i !== index)
                                .some((r) => r.basketIds.includes(it.uniqueId));
                              return !assignedElsewhere;
                            })
                            .map((it) => (
                              <div key={it.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`basket-${it.uniqueId}-recipient-${index}`}
                                    checked={recipient.basketIds.includes(it.uniqueId)}
                                    onChange={(e) => {
                                      const newRecipients = [...giftAssignment.recipients];
                                      if (e.target.checked) {
                                        newRecipients[index].basketIds = [...newRecipients[index].basketIds, it.uniqueId];
                                      } else {
                                        newRecipients[index].basketIds = newRecipients[index].basketIds.filter((id) => id !== it.uniqueId);
                                      }
                                      setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <label htmlFor={`basket-${it.uniqueId}-recipient-${index}`} className="text-sm cursor-pointer">
                                    {it.nombre}
                                  </label>
                                </div>
                                <span className="text-sm font-semibold">{it.precio.toFixed(2)}€</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(() => {
                  const assigned = new Set(giftAssignment.recipients.flatMap((r) => r.basketIds));
                  const remaining = expandedGiftItems.filter((it) => !assigned.has(it.uniqueId)).length;
                  return remaining > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setGiftAssignment((prev) => ({ 
                        ...prev, 
                        recipients: [...prev.recipients, { recipientName: "", recipientEmail: "", recipientPhone: "", personalNote: "", basketIds: [] }] 
                      }))}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Añadir otro destinatario ({remaining} restante{remaining !== 1 ? 's' : ''})
                    </Button>
                  );
                })()}

                        {/* Botón de total de regalos asignados */}
                        <Card className="border-2 border-gold bg-gold/5">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <span className="font-poppins font-bold text-black">Total cestas asignadas</span>
                              <span className="font-poppins font-bold text-gold text-2xl">
                                {getAssignedGiftTotal().toFixed(2)}€
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Resumen y botón de pago */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-24 border-2 border-black">
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
                      {total.toFixed(2)}€
                    </span>
                  </div>

                  <Separator />

                  <p className="text-xs text-gray-500 text-center">
                    Gastos de envío calculados en el checkout
                  </p>

                  <Button
                    onClick={handleContinueToPayment}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-base sm:text-lg py-5 sm:py-6"
                  >
                    Continuar al pago ({total.toFixed(2)}€)
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Pago seguro con Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutCombinedPage;
