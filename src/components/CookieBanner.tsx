import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import headerBg from "@/assets/iberian-products-background.jpg";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Mostrar si no hay consentimiento guardado (en toda la web)
    const stored = localStorage.getItem("cookieConsent");

    if (!stored) {
      setIsVisible(true);
    }

    // Cargar preferencias guardadas si existen
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalytics(!!parsed.analytics);
        setMarketing(!!parsed.marketing);
      } catch {}
    }
  }, [location.pathname]);

  const persistConsent = (prefs: { analytics: boolean; marketing: boolean }) => {
    const payload = {
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: Date.now(),
      version: "1.0",
    };
    // Guardar de forma persistente hasta decisión del usuario
    localStorage.setItem("cookieConsent", JSON.stringify(payload));
  };

  const handleAcceptAll = async () => {
    persistConsent({ analytics: true, marketing: true });
    setIsVisible(false);
    setShowPreferences(false);
    setAnalytics(true);
    setMarketing(true);

    // Guardar (opcional) en BD si el usuario está autenticado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.from('cookie_consents').insert({
          user_id: user.id,
          email: user.email,
        });
      }
    } catch (e) {
      console.warn('No se pudo registrar el consentimiento en BD:', e);
    }
  };

  const handleRejectAll = () => {
    persistConsent({ analytics: false, marketing: false });
    setIsVisible(false);
    setShowPreferences(false);
    setAnalytics(false);
    setMarketing(false);
  };

  const handleSavePreferences = async () => {
    persistConsent({ analytics, marketing });
    setIsVisible(false);
    setShowPreferences(false);
    toast({ title: "Preferencias guardadas", description: "Tus ajustes de cookies han sido aplicados." });

    // Opcional: registrar si hay alguna categoría de marketing/analítica aceptada
    try {
      if (analytics || marketing) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await supabase.from('cookie_consents').insert({ user_id: user.id, email: user.email });
        }
      }
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 z-[100] rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-500"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.90)), url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '1px solid hsl(45 100% 65% / 0.3)'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="sr-only">Preferencias de cookies</h2>
            <p className="text-sm text-white leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el marketing.
              Puedes aceptar todas, rechazarlas o personalizarlas según la normativa de España (RGPD/LOPDGDD).
            </p>
            {showPreferences && (
              <div className="mt-4 p-4 border border-[hsl(45,100%,65%)]/30 rounded-lg bg-black/50">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">Esenciales</p>
                      <p className="text-sm text-white/70">Siempre activas para el funcionamiento básico del sitio.</p>
                    </div>
                    <input type="checkbox" checked readOnly className="h-4 w-4 opacity-60" aria-label="Cookies esenciales (siempre activas)" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">Analíticas</p>
                      <p className="text-sm text-white/70">Nos ayudan a entender el uso del sitio. Opcionales.</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      aria-label="Permitir cookies analíticas"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">Marketing</p>
                      <p className="text-sm text-white/70">Personalizan anuncios y ofertas. Opcionales.</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      aria-label="Permitir cookies de marketing"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button size="sm" onClick={handleSavePreferences} className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold">
                    Guardar preferencias
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAcceptAll} className="text-white border-white/30 hover:text-[hsl(45,100%,65%)] hover:border-[hsl(45,100%,65%)]">
                    Aceptar todas
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRejectAll} className="text-white border-white/30 hover:text-[hsl(45,100%,65%)] hover:border-[hsl(45,100%,65%)]">
                    Rechazar todas
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreferences((v) => !v)}
              className="text-white border-white/30 hover:text-[hsl(45,100%,65%)] hover:border-[hsl(45,100%,65%)]"
            >
              {showPreferences ? 'Ocultar opciones' : 'Personalizar cookies'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRejectAll}
              className="text-white border-white/30 hover:text-[hsl(45,100%,65%)] hover:border-[hsl(45,100%,65%)]"
            >
              Rechazar
            </Button>
            <Button 
              onClick={handleAcceptAll}
              size="sm"
              className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold"
            >
              Aceptar todas
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRejectAll}
              className="h-8 w-8 text-white hover:text-[hsl(45,100%,65%)]"
              aria-label="Cerrar banner de cookies"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;