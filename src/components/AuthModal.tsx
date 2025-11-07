import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBack?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();
  const [resendSeconds, setResendSeconds] = useState(0);
  const [lastEmailSent, setLastEmailSent] = useState<string>("");

  // Guardar la ruta/intención actual al abrir el modal y limpiar flags obsoletos
  useEffect(() => {
    if (isOpen) {
      const intended = window.location.pathname + window.location.search + window.location.hash;
      localStorage.setItem('intendedRoute', intended);
      
      // Limpiar flag de OAuth al abrir el modal para permitir nuevos intentos
      try { localStorage.removeItem('oauthInProgress'); } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      console.log('🚀 Iniciando login con Google...');
      
      // 1. Guardar el carrito actual
      const currentCart = localStorage.getItem('shopping-cart');
      if (currentCart) {
        localStorage.setItem('cart_backup', currentCart);
        console.log('💾 Carrito guardado');
      }
      
      // 2. Marcar que estamos en proceso de OAuth para checkout
      localStorage.setItem('pendingCheckout', 'true');
      localStorage.setItem('oauthInProgress', 'true');
      
      // 3. Iniciar OAuth con Google
      const redirectUrl = window.location.origin;
      console.log('🔗 OAuth redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ Error en OAuth:', error);
        
        // Limpiar flags si falla
        localStorage.removeItem('pendingCheckout');
        localStorage.removeItem('oauthInProgress');
        localStorage.removeItem('cart_backup');
        
        toast({
          variant: "destructive",
          title: "No se pudo iniciar sesión",
          description: error.message || 'Inténtalo de nuevo',
        });
        
        setIsLoading(false);
      }
      
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      
      // Limpiar flags si falla
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('oauthInProgress');
      localStorage.removeItem('cart_backup');
      
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: 'Por favor, inténtalo de nuevo',
      });
      
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailClean = email.trim().toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean);
      if (!emailValid) {
        throw new Error("Introduce un email válido (ej. usuario@dominio.com)");
      }

      // CRÍTICO: Establecer flag ANTES de OTP para preservar carrito
      localStorage.setItem('pendingCheckout', 'true');
      
      // CRÍTICO: Redirigir SIEMPRE al checkout tras login por email OTP
      const baseOrigin = (() => {
        try {
          const topOrigin = (window.top && window.top.location && window.top.location.origin) as string | undefined;
          if (topOrigin && topOrigin !== window.location.origin) {
            console.log('Using top window origin for OTP redirect:', topOrigin);
            return topOrigin;
          }
        } catch (e) {
          console.warn('Could not read top origin (OTP), using current origin:', e);
        }
        return window.location.origin;
      })();
      const redirectUrl = `${baseOrigin}/checkout`;
      console.log('Email OTP redirectTo:', redirectUrl);
      const { error } = await supabase.auth.signInWithOtp({
        email: emailClean,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        localStorage.removeItem('pendingCheckout'); // Limpiar si falla
        throw error;
      }

      setShowCodeInput(true);
      setLastEmailSent(emailClean);
      setResendSeconds(30);
      toast({
        title: "¡Código enviado!",
        description: "Revisa tu correo e introduce el código de verificación.",
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      const msg = (error?.message || '').toString();
      const friendly = msg.includes('email')
        ? 'El email no es válido. Revísalo e inténtalo de nuevo.'
        : 'No se pudo enviar el código de verificación. Inténtalo de nuevo en unos segundos.';
      toast({
        variant: "destructive",
        title: "Error al enviar el código",
        description: friendly,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0) return;
    setIsLoading(true);
    try {
      const targetEmail = (lastEmailSent || email).trim().toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail);
      if (!emailValid) {
        throw new Error("Introduce un email válido (ej. usuario@dominio.com)");
      }
      const baseOrigin = (() => {
        try {
          const topOrigin = (window.top && window.top.location && window.top.location.origin) as string | undefined;
          if (topOrigin && topOrigin !== window.location.origin) {
            console.log('Using top window origin for OTP resend redirect:', topOrigin);
            return topOrigin;
          }
        } catch (e) {
          console.warn('Could not read top origin (OTP resend), using current origin:', e);
        }
        return window.location.origin;
      })();
      const redirectUrl = `${baseOrigin}/checkout`;
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { shouldCreateUser: true, emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      setLastEmailSent(targetEmail);
      setResendSeconds(30);
      toast({ title: "Código reenviado", description: `Hemos reenviado el código a ${targetEmail}.` });
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast({
        variant: "destructive",
        title: "No se pudo reenviar",
        description: error.message || 'Inténtalo de nuevo en unos segundos.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailClean = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: emailClean,
        token: verificationCode.trim(),
        type: 'email',
      });

      if (error) throw error;

      // Send welcome email for new users
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          // Check if this is a new user by checking if profile was just created
          const { data: profiles } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('user_id', session.user.id);

          if (profiles && profiles.length > 0) {
            const createdAt = new Date(profiles[0].created_at);
            const now = new Date();
            const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

            // Send welcome email if profile was created in the last 30 seconds (to account for network delays)
            if (diffSeconds < 30) {
              console.log('Attempting to send welcome email to new user:', session.user.email);
              const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                },
                body: {
                  userEmail: session.user.email,
                  userName: session.user.user_metadata?.name || session.user.user_metadata?.full_name || ''
                }
              });
              
              if (emailError) {
                console.error('Error sending welcome email:', emailError);
              } else {
                console.log('Welcome email sent successfully to:', session.user.email);
              }
            } else {
              console.log('User profile is older than 30 seconds, skipping welcome email');
            }
          }
        } catch (emailError) {
          console.error('Error in welcome email flow:', emailError);
          // Don't fail the login if welcome email fails
        }
      }

      toast({
        title: "¡Acceso correcto!",
        description: "Has iniciado sesión correctamente.",
      });

      // Limpiar flags de progreso
      try { localStorage.removeItem('oauthInProgress'); } catch {}

      // Marcar que el auth se completó
      sessionStorage.setItem('auth_completed', 'true');

      setEmail("");
      setVerificationCode("");
      setShowCodeInput(false);
      onSuccess();
      onClose();

      // El componente Checkout detectará el flag y se actualizará automáticamente
      console.log('OTP verification successful, checkout will refresh automatically');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Código incorrecto",
        description: error.message || "El código de verificación no es válido.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setVerificationCode("");
    setShowCodeInput(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white" 
        hideClose={true}
        overlayStyle={{ backgroundColor: 'transparent' }}
      >
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="absolute right-4 top-4 text-black hover:text-black/70 hover:bg-transparent p-2"
            >
              ← Volver
            </Button>
          )}
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold">
              Accede a tu cuenta
            </DialogTitle>
          </DialogHeader>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Inicia sesión</CardTitle>
              <CardDescription className="font-normal text-black text-[15px]">
                {showCodeInput 
                  ? "Introduce el código que te enviamos." 
                  : "Es necesario que inicies sesión y te registres como usuario con un correo, para que podamos vincular la compra a tu perfil y así darte acceso a la web privada de compradores, donde está la experiencia por cada cesta adquirida. En modo regalo, los destinatarios recibirán el acceso a la web, pero aún así, necesitamos un usuario para poder realizar la compra."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="ghost"
                className="w-full !bg-transparent border-none text-black hover:text-[hsl(45,100%,50%)] hover:!bg-transparent transition-colors"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                type="button"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continuar con email
                  </span>
                </div>
              </div>

              {!showCodeInput ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full !bg-transparent text-black hover:text-[hsl(45,100%,50%)] hover:!bg-transparent transition-colors" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Enviar código
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de verificación</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Te hemos enviado un código a <span className="font-medium">{lastEmailSent || email}</span>. Revisa la carpeta de spam si no lo encuentras.
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">¿No te llega?</div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={isLoading || resendSeconds > 0}
                      className="h-7 px-2"
                    >
                      {resendSeconds > 0 ? `Reenviar en ${resendSeconds}s` : 'Reenviar código'}
                    </Button>
                  </div>

                  <Button type="submit" className="w-full !bg-transparent text-black hover:text-[hsl(45,100%,50%)] hover:!bg-transparent transition-colors" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Verificar código
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => {
                      setShowCodeInput(false);
                      setVerificationCode("");
                    }}
                    className="w-full text-sm"
                  >
                    Volver a introducir email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
