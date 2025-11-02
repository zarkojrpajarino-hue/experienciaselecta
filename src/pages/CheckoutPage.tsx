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
import { motion, AnimatePresence } from "framer-motion";

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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Validar que location.state existe, si no redirigir
  React.useEffect(() => {
    if (!location.state) {
      navigate('/carrito', { replace: true });
    }
  }, [location.state, navigate]);

  // Manejar el caso donde state es null con valores por defecto
  const { giftItems = [], personalItems = [], total = 0 } = location.state || {};

  // Si no hay state, mostrar loading mientras redirige
  if (!location.state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-black font-poppins">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // State para controlar qué sección está abierta (solo una a la vez)
  const [activeSection, setActiveSection] = useState<'personal' | 'gift' | null>('personal');
  
  // State para rastrear si se intentó enviar (para validación visual)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  // State para mostrar mensaje de error personalizado
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para items personales (puede eliminar cestas)
  const [currentPersonalItems, setCurrentPersonalItems] = useState(personalItems);

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

  // Preview de imagen anclada a la miniatura
  const [imagePreview, setImagePreview] = useState<{ src: string; top: number; left: number } | null>(null);

  // Preview de información anclada al botón
  const [infoPopover, setInfoPopover] = useState<{ top: number; left: number } | null>(null);

  // Datos personales para cestas propias
  const [personalData, setPersonalData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const getCurrentPersonalTotal = () => {
    return currentPersonalItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  };

  const getGiftTotal = () => {
    return giftItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  };

  const getAssignedGiftTotal = () => {
    const assignedIds = new Set(giftAssignment.recipients.flatMap((r) => r.basketIds));
    return expandedGiftItems
      .filter((it) => assignedIds.has(it.uniqueId))
      .reduce((sum, item) => sum + item.precio, 0);
  };

  const getTotalAmount = () => {
    return getCurrentPersonalTotal() + getAssignedGiftTotal();
  };

  const handleRemovePersonalItem = (itemId: string) => {
    setCurrentPersonalItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Cesta eliminada");
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\d\s\+\-\(\)]{9,}$/.test(phone);
  };

  const handleContinueToPayment = () => {
    setAttemptedSubmit(true);
    setShowErrorMessage(false);
    
    // Validar datos personales si hay cestas propias
    if (currentPersonalItems.length > 0) {
      if (!personalData.name.trim()) {
        setErrorMessage("Completa tu nombre en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!personalData.email.trim() || !validateEmail(personalData.email)) {
        setErrorMessage("Introduce un email válido en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!personalData.phone.trim() || !validatePhone(personalData.phone)) {
        setErrorMessage("Introduce un teléfono válido en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!personalData.address.trim()) {
        setErrorMessage("Completa tu dirección en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!personalData.city.trim()) {
        setErrorMessage("Completa tu ciudad en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!personalData.postalCode.trim()) {
        setErrorMessage("Completa tu código postal en 'Tus datos de envío'");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
    }

    // Validar asignación de regalos solo si hay cestas asignadas
    const assignedGiftBaskets = giftAssignment.recipients.flatMap((r) => r.basketIds);
    if (assignedGiftBaskets.length > 0) {
      // Validar solo los destinatarios que tienen cestas asignadas
      for (const r of giftAssignment.recipients) {
        if (r.basketIds.length > 0) {
          if (!r.recipientName.trim() || (!r.recipientEmail.trim() && !r.recipientPhone.trim())) {
            setErrorMessage("Completa los datos obligatorios de los destinatarios con cestas asignadas");
            setShowErrorMessage(true);
            setTimeout(() => setShowErrorMessage(false), 5000);
            return;
          }
          if (r.recipientEmail.trim() && !validateEmail(r.recipientEmail)) {
            setErrorMessage("El email del destinatario no es válido");
            setShowErrorMessage(true);
            setTimeout(() => setShowErrorMessage(false), 5000);
            return;
          }
          if (r.recipientPhone.trim() && !validatePhone(r.recipientPhone)) {
            setErrorMessage("El teléfono del destinatario no es válido");
            setShowErrorMessage(true);
            setTimeout(() => setShowErrorMessage(false), 5000);
            return;
          }
        }
      }
      if (!giftAssignment.senderName.trim() || !giftAssignment.senderEmail.trim()) {
        setErrorMessage("Completa tus datos como remitente para los regalos");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
      if (!validateEmail(giftAssignment.senderEmail)) {
        setErrorMessage("Tu email como remitente no es válido");
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
        return;
      }
    }

    toast.success("Preparando pago...");
    // Aquí iría la lógica de pago (Stripe)
  };

  // Función para verificar si un destinatario puede marcar cestas
  const canSelectBasketsForRecipient = (index: number) => {
    const recipient = giftAssignment.recipients[index];
    return recipient.recipientName && (recipient.recipientEmail || recipient.recipientPhone);
  };

  const toggleSection = (section: 'personal' | 'gift') => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-6 px-2 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Botón volver a la página principal */}
          <Button
            onClick={() => navigate('/')}
            variant="link"
            className="text-black hover:text-gold mb-2 p-0 text-[10px]"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Volver a la página principal
          </Button>

          <h1 className="text-base md:text-xl font-poppins font-bold text-black mb-2">
            💳 Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
            {/* Formulario de asignación */}
            <div className="lg:col-span-2 space-y-2 md:space-y-3">
              {/* Resumen visual - Tus cestas PRIMERO */}
              <Card>
                <CardContent className="p-2 md:p-3">
                  <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                    {/* TUS CESTAS (primero) */}
                    {currentPersonalItems.length > 0 && (
                      <button
                        onClick={() => toggleSection('personal')}
                        className="p-1.5 md:p-2 bg-gold/10 rounded-lg hover:bg-gold/20 transition-colors text-left border-2 border-black"
                      >
                        <p className="text-[9px] md:text-[10px] text-gray-600 mb-0.5">Tus cestas</p>
                        <p className="text-[8px] text-gray-500 mb-0.5 line-clamp-1">
                          {currentPersonalItems.map(item => `${item.nombre} (x${item.quantity})`).join(', ')}
                        </p>
                        <p className="text-sm md:text-base font-poppins font-bold text-black">
                          {currentPersonalItems.reduce((sum, item) => sum + item.quantity, 0)} {currentPersonalItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'cesta' : 'cestas'}
                        </p>
                        <p className="text-lg font-poppins font-bold text-gold mt-1">
                          {getCurrentPersonalTotal().toFixed(2)}€
                        </p>
                      </button>
                    )}
                    {/* CESTAS PARA REGALAR (segundo) */}
                    {giftItems.length > 0 && (
                      <button
                        onClick={() => toggleSection('gift')}
                        className="p-4 bg-gold/10 rounded-lg hover:bg-gold/20 transition-colors text-left border-2 border-black"
                      >
                        <p className="text-sm text-gray-600 mb-1">Regalos</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {giftAssignment.recipients
                            .flatMap(r => r.basketIds.map(id => expandedGiftItems.find(it => it.uniqueId === id)?.nombre).filter(Boolean))
                            .join(', ') || 'Sin asignar'}
                        </p>
                        <p className="text-2xl font-poppins font-bold text-black">
                          {giftItems.reduce((sum, item) => sum + item.quantity, 0)} {giftItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'cesta' : 'cestas'}
                        </p>
                        <p className="text-lg font-poppins font-bold text-gold mt-1">
                          {getAssignedGiftTotal().toFixed(2)}€
                        </p>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Datos personales para cestas propias (ABIERTO POR DEFECTO) */}
              {currentPersonalItems.length > 0 && (
                <Collapsible open={activeSection === 'personal'} onOpenChange={() => toggleSection('personal')}>
                  <CollapsibleContent>
                    <Card className="border-2 border-black">
                      <CardHeader>
                        <CardTitle className="text-xl font-poppins font-bold">Tus datos de envío</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Formulario de datos personales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="personalName">Nombre completo *</Label>
                            <Input
                              id="personalName"
                              value={personalData.name}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Tu nombre"
                              className={`border-2 ${attemptedSubmit && !personalData.name.trim() ? 'border-red-600 animate-shake' : 'border-black'}`}
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
                              className={`border-2 ${attemptedSubmit && (!personalData.email.trim() || !validateEmail(personalData.email)) ? 'border-red-600 animate-shake' : 'border-black'}`}
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
                              className={`border-2 ${attemptedSubmit && (!personalData.phone.trim() || !validatePhone(personalData.phone)) ? 'border-red-600 animate-shake' : 'border-black'}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalAddress">Dirección *</Label>
                            <Input
                              id="personalAddress"
                              value={personalData.address}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, address: e.target.value }))}
                              placeholder="Calle, número, piso..."
                              className={`border-2 ${attemptedSubmit && !personalData.address.trim() ? 'border-red-600 animate-shake' : 'border-black'}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalCity">Ciudad *</Label>
                            <Input
                              id="personalCity"
                              value={personalData.city}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Tu ciudad"
                              className={`border-2 ${attemptedSubmit && !personalData.city.trim() ? 'border-red-600 animate-shake' : 'border-black'}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="personalPostalCode">Código postal *</Label>
                            <Input
                              id="personalPostalCode"
                              value={personalData.postalCode}
                              onChange={(e) => setPersonalData((prev) => ({ ...prev, postalCode: e.target.value }))}
                              placeholder="28001"
                              className={`border-2 ${attemptedSubmit && !personalData.postalCode.trim() ? 'border-red-600 animate-shake' : 'border-black'}`}
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Desglose de cestas con opción de añadir/quitar */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Cestas seleccionadas:</h4>
                          <div className="space-y-2">
                            {currentPersonalItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center gap-2">
                                   <img 
                                    src={item.imagen} 
                                    alt={item.nombre} 
                                    className="w-8 h-8 md:w-10 md:h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 hover:ring-gold" 
                                    onClick={(e) => {
                                      const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
                                      setImagePreview({ src: item.imagen, top: rect.top + rect.height / 2, left: rect.right + 10 });
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium text-[10px] md:text-xs">{item.nombre}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentPersonalItems(prev => 
                                          prev.map(it => 
                                            it.id === item.id && it.quantity > 1 
                                              ? { ...it, quantity: it.quantity - 1 } 
                                              : it
                                          )
                                        );
                                      }}
                                      disabled={item.quantity <= 1}
                                      className="h-8 w-8 p-0"
                                    >
                                      -
                                    </Button>
                                    <span className="text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentPersonalItems(prev => 
                                          prev.map(it => 
                                            it.id === item.id 
                                              ? { ...it, quantity: it.quantity + 1 } 
                                              : it
                                          )
                                        );
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <span className="font-bold text-gold min-w-[4rem] text-right">{(item.precio * item.quantity).toFixed(2)}€</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePersonalItem(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Asignación de destinatarios para regalos */}
              {giftItems.length > 0 && (
                <Collapsible open={activeSection === 'gift'} onOpenChange={() => toggleSection('gift')}>
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
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 rounded-full hover:bg-black/10"
                                  onClick={(e) => {
                                    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                    setInfoPopover({ top: rect.top + rect.height / 2, left: rect.right + 10 });
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
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
                                {!canSelectBasketsForRecipient(index) ? (
                                  <p className="text-xs text-amber-600 mb-2">⚠️ Completa los datos obligatorios (nombre y email/móvil) para poder asignar cestas</p>
                                ) : (
                                  <p className="text-xs text-muted-foreground mb-2">Selecciona qué cestas van para {recipient.recipientName || 'este destinatario'}</p>
                                )}
                                <div className="space-y-2">
                                  {expandedGiftItems
                                    .filter((it) => {
                                      // Mostrar solo cestas no asignadas a otros destinatarios
                                      const assignedElsewhere = giftAssignment.recipients
                                        .filter((_, i) => i !== index)
                                        .some((r) => r.basketIds.includes(it.uniqueId));
                                      return !assignedElsewhere;
                                    })
                                    .map((it) => {
                                      const canSelect = canSelectBasketsForRecipient(index);
                                      return (
                                         <div 
                                          key={it.uniqueId} 
                                          className={`flex items-center justify-between p-2 rounded ${
                                            canSelect ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-100'
                                          }`}
                                          onClick={() => {
                                            if (!canSelect) return;
                                            const newRecipients = [...giftAssignment.recipients];
                                            const isChecked = recipient.basketIds.includes(it.uniqueId);
                                            if (!isChecked) {
                                              newRecipients[index].basketIds = [...newRecipients[index].basketIds, it.uniqueId];
                                            } else {
                                              newRecipients[index].basketIds = newRecipients[index].basketIds.filter((id: string) => id !== it.uniqueId);
                                            }
                                            setGiftAssignment((prev) => ({ ...prev, recipients: newRecipients }));
                                          }}
                                        >
                                         <div className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`basket-${it.uniqueId}-recipient-${index}`}
                                              checked={recipient.basketIds.includes(it.uniqueId)}
                                              disabled={!canSelect}
                                              onChange={() => {}} // Handled by parent div onClick
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <img 
                                              src={it.imagen} 
                                              alt={it.nombre} 
                                              className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 hover:ring-gold" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
                                                setImagePreview({ src: it.imagen, top: rect.top + rect.height / 2, left: rect.right + 10 });
                                              }}
                                            />
                                            <label htmlFor={`basket-${it.uniqueId}-recipient-${index}`} className={`text-sm ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                              {it.nombre}
                                            </label>
                                          </div>
                                          <span className="text-sm font-semibold">{it.precio.toFixed(2)}€</span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Botón para añadir otro destinatario */}
                      {expandedGiftItems.some((it) => 
                        !giftAssignment.recipients.some((r) => r.basketIds.includes(it.uniqueId))
                      ) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setGiftAssignment((prev) => ({
                              ...prev,
                              recipients: [
                                ...prev.recipients,
                                { recipientName: "", recipientEmail: "", recipientPhone: "", personalNote: "", basketIds: [] }
                              ]
                            }));
                          }}
                          className="w-full border-2 border-black hover:bg-gold/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir otro destinatario
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-black sticky top-16 md:top-20">
                <CardHeader className="pb-2 md:pb-3 px-2 md:px-4">
                  <CardTitle className="text-sm md:text-base font-poppins font-bold">Resumen Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3 text-[10px] md:text-xs px-2 md:px-4">
                  {currentPersonalItems.length > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[10px] md:text-xs">Tus cestas</span>
                      <span className="font-semibold text-[10px] md:text-xs">{getCurrentPersonalTotal().toFixed(2)}€</span>
                    </div>
                  )}
                  {giftItems.length > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[10px] md:text-xs">Cestas para regalar (asignadas)</span>
                      <span className="font-semibold text-[10px] md:text-xs">{getAssignedGiftTotal().toFixed(2)}€</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base font-poppins font-bold">Total</span>
                    <span className="text-base md:text-lg font-poppins font-bold text-gold">{getTotalAmount().toFixed(2)}€</span>
                  </div>
                  <Button
                    onClick={handleContinueToPayment}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-poppins font-bold text-[10px] md:text-xs py-2 md:py-3"
                  >
                    Continuar al pago ({getTotalAmount().toFixed(2)}€)
                  </Button>
                  
                  {/* Error message toast */}
                  <AnimatePresence>
                    {showErrorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 p-3 bg-red-50 border-2 border-red-600 rounded-lg text-center"
                      >
                        <p className="text-sm font-medium text-red-600">{errorMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Pago seguro con Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {infoPopover && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            style={{ 
              position: 'fixed', 
              top: `${infoPopover.top}px`, 
              left: `${infoPopover.left}px`, 
              transform: 'translateY(-50%)' 
            }}
            className="z-[110] max-w-md hidden md:block"
          >
            <div className="relative bg-white border-2 border-black shadow-2xl rounded-lg p-4 max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setInfoPopover(null)}
                className="absolute -top-2 -right-2 z-50 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-300 border-2 border-white flex items-center justify-center"
                aria-label="Cerrar información"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="text-base font-semibold">¿Cómo funciona el proceso de regalo?</h3>
                <p className="font-semibold">Proceso paso a paso:</p>
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
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {imagePreview && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            style={{ 
              position: 'fixed', 
              top: `${imagePreview.top}px`, 
              left: `${imagePreview.left}px`, 
              transform: 'translateY(-50%)' 
            }}
            className="z-[110] hidden md:block"
          >
            <div className="relative bg-white border-2 border-black shadow-2xl rounded-lg p-1">
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 z-50 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-300 border-2 border-white flex items-center justify-center"
                aria-label="Cerrar imagen"
              >
                <X className="h-4 w-4" />
              </button>
              <img src={imagePreview.src} alt="Vista ampliada" className="w-80 h-80 object-cover rounded-md" />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

    </>
  );
};

export default CheckoutPage;
