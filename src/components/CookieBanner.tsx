import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = sessionStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    sessionStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elegant animate-slide-in-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-foreground leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia de navegación y analizar el tráfico del sitio web. 
              Al hacer clic en "Aceptar", consientes el uso de cookies de acuerdo con nuestra política de privacidad.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReject}
              className="text-muted-foreground hover:text-foreground"
            >
              Rechazar
            </Button>
            <Button 
              onClick={handleAccept}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Aceptar cookies
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReject}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
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