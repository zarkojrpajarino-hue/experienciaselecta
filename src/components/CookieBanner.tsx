import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import headerBg from "@/assets/iberian-products-background.jpg";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Mostrar banner solo si NO se ha mostrado en esta sesión
    const shownThisSession = sessionStorage.getItem("cookieBannerShown");
    
    if (!shownThisSession) {
      setIsVisible(true);
      console.log('🍪 Cookie banner shown - new session detected');
    } else {
      console.log('🍪 Cookie banner hidden - already shown in this session');
    }
  }, [location.pathname]);

  const handleAcceptAll = async () => {
    // Marcar como mostrado en esta sesión
    sessionStorage.setItem("cookieBannerShown", "true");
    setIsVisible(false);
    setShowPreferences(false);
    setAnalytics(true);
    setMarketing(true);

    // Registrar consentimiento en BD si el usuario está autenticado
    if (user && user.email) {
      try {
        const { data, error } = await supabase
          .from('cookie_consents')
          .insert({
            user_id: user.id,
            email: user.email,
            consented_at: new Date().toISOString(),
            marketing_email_sent: false
          })
          .select();

        if (error) {
          console.error('❌ Error registering cookie consent:', error);
        } else {
          console.log('✅ Cookie consent registered successfully:', data);
          console.log('📧 Marketing email will be sent in 24 hours');
        }
      } catch (error) {
        console.error('❌ Error in cookie consent:', error);
      }
    } else {
      console.log('⚠️ User not authenticated, consent not saved to DB');
    }
  };

  const handleRejectAll = () => {
    // Marcar como mostrado en esta sesión
    sessionStorage.setItem("cookieBannerShown", "true");
    setIsVisible(false);
    setShowPreferences(false);
    setAnalytics(false);
    setMarketing(false);
    console.log('🍪 All cookies rejected - banner hidden for this session');
  };

  const handleSavePreferences = async () => {
    // Marcar como mostrado en esta sesión
    sessionStorage.setItem("cookieBannerShown", "true");
    setIsVisible(false);
    setShowPreferences(false);
    toast({ title: "Preferencias guardadas", description: "Tus ajustes de cookies han sido aplicados." });

    // Registrar consentimiento si acepta marketing o analíticas
    if ((analytics || marketing) && user && user.email) {
      try {
        const { data, error } = await supabase
          .from('cookie_consents')
          .insert({
            user_id: user.id,
            email: user.email,
            consented_at: new Date().toISOString(),
            marketing_email_sent: false
          })
          .select();

        if (error) {
          console.error('❌ Error registering cookie consent:', error);
        } else {
          console.log('✅ Cookie consent registered successfully:', data);
          console.log('📧 Marketing email will be sent in 24 hours');
        }
      } catch (error) {
        console.error('❌ Error in cookie consent:', error);
      }
    } else {
      console.log('⚠️ User not authenticated or no marketing/analytics accepted');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] rounded-xl shadow-2xl animate-slide-in-right"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.90)), url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '1px solid hsl(45 100% 65% / 0.3)'
      }}
    >
      <div className="px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <h2 className="sr-only">Preferencias de cookies</h2>
            <p className="text-xs sm:text-sm text-white leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el marketing.
              Puedes aceptar todas, rechazarlas o personalizarlas según la normativa de España (RGPD/LOPDGDD).
            </p>
            {showPreferences && (
              <div className="mt-4 p-3 sm:p-4 border border-[hsl(45,100%,65%)]/30 rounded-lg bg-black/50">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Esenciales</p>
                      <p className="text-xs text-white/70">Siempre activas.</p>
                    </div>
                    <input type="checkbox" checked readOnly className="h-4 w-4 opacity-60 flex-shrink-0" aria-label="Cookies esenciales (siempre activas)" />
                  </div>
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Analíticas</p>
                      <p className="text-xs text-white/70">Entender el uso del sitio.</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 flex-shrink-0"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      aria-label="Permitir cookies analíticas"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Marketing</p>
                      <p className="text-xs text-white/70">Personalizar ofertas.</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 flex-shrink-0"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      aria-label="Permitir cookies de marketing"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                  <Button size="sm" onClick={handleSavePreferences} className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs border-none">
                    Guardar
                  </Button>
                  <Button size="sm" onClick={handleAcceptAll} className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs border-none">
                    Aceptar todas
                  </Button>
                  <Button size="sm" onClick={handleRejectAll} className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs border-none">
                    Rechazar todas
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreferences((v) => !v)}
              className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs border-none"
            >
              {showPreferences ? 'Ocultar' : 'Personalizar'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRejectAll}
              className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs border-none"
            >
              Rechazar
            </Button>
            <Button 
              onClick={handleAcceptAll}
              size="sm"
              className="bg-[hsl(45,100%,65%)] text-[hsl(271,100%,20%)] hover:bg-[hsl(45,100%,70%)] font-semibold text-xs"
            >
              Aceptar
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