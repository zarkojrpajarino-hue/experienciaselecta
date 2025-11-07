import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) {
      const intended = window.location.pathname + window.location.search + window.location.hash;
      localStorage.setItem('intendedRoute', intended);
      
      // Limpiar flag de login procesado para permitir nuevo login
      sessionStorage.removeItem('login_processed');
      
      const flags = ['oauthInProgress', 'auth_error'];
      flags.forEach(flag => {
        try {
          localStorage.removeItem(flag);
        } catch (error) {
          console.warn(`No se pudo limpiar ${flag}:`, error);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const getRedirectUrl = () => {
    try {
      const topOrigin = window.top?.location?.origin;
      if (topOrigin && topOrigin !== window.location.origin) {
        console.log('✅ Usando origen de ventana superior:', topOrigin);
        return topOrigin;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo acceder al origen superior:', error);
    }
    return window.location.origin;
  };

  const saveCartBackup = () => {
    const currentCart = localStorage.getItem('shopping-cart');
    if (currentCart) {
      try {
        localStorage.setItem('cart_backup', currentCart);
        console.log('💾 Carrito guardado');
        return true;
      } catch (error) {
        console.error('❌ Error guardando carrito:', error);
        return false;
      }
    }
    return false;
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando OAuth con Google...');
      
      saveCartBackup();
      
      localStorage.setItem('pendingCheckout', 'true');
      localStorage.setItem('oauthInProgress', 'true');
      
      const redirectUrl = window.location.origin;
      console.log('🔗 OAuth redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        }
      });

      if (error) {
        throw error;
      }
      
      console.warn('⚠️ OAuth no redirigió, limpiando flags...');
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('oauthInProgress');
      
    } catch (error: any) {
      console.error('❌ Error en OAuth:', error);
      
      ['pendingCheckout', 'oauthInProgress', 'cart_backup'].forEach(flag => {
        localStorage.removeItem(flag);
      });
      
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión con Google",
        description: error.message || 'Por favor, inténtalo de nuevo',
      });
      
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.trim().toLowerCase());
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const emailClean = email.trim().toLowerCase();
    
    if (!validateEmail(emailClean)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, introduce un email válido (ej. usuario@dominio.com)",
      });
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem('pendingCheckout', 'true');
      
      const redirectUrl = `${getRedirectUrl()}/checkout`;
      console.log('📧 Enviando OTP, redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: emailClean,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        localStorage.removeItem('pendingCheckout');
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
      console.error('❌ Error enviando código:', error);
      
      const errorMessage = error.message?.toLowerCase() || '';
      const friendlyMessage = errorMessage.includes('email') || errorMessage.includes('valid')
        ? 'El email no es válido. Revísalo e inténtalo de nuevo.'
        : 'No se pudo enviar el código. Inténtalo de nuevo en unos segundos.';
      
      toast({
        variant: "destructive",
        title: "Error al enviar el código",
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0 || isLoading) return;
    
    const targetEmail = (lastEmailSent || email).trim().toLowerCase();
    
    if (!validateEmail(targetEmail)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, introduce un email válido",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const redirectUrl = `${getRedirectUrl()}/checkout`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { 
          shouldCreateUser: true, 
          emailRedirectTo: redirectUrl 
        },
      });
      
      if (error) throw error;
      
      setLastEmailSent(targetEmail);
      setResendSeconds(30);
      
      toast({ 
        title: "Código reenviado", 
        description: `Hemos reenviado el código a ${targetEmail}` 
      });
    } catch (error: any) {
      console.error('❌ Error reenviando código:', error);
      toast({
        variant: "destructive",
        title: "No se pudo reenviar",
        description: error.message || 'Inténtalo de nuevo en unos segundos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const code = verificationCode.trim();
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "El código debe tener 6 dígitos",
      });
      return;
    }

    setIsLoading(true);

    try {
      const emailClean = email.trim().toLowerCase();
      
      console.log('🔐 Verificando código OTP...');
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailClean,
        token: code,
        type: 'email',
      });

      if (error) {
        throw error;
      }

      console.log('✅ Código verificado correctamente');

      if (data.session?.user) {
        try {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('user_id', data.session.user.id)
            .single();

          if (!profileError && profiles) {
            const createdAt = new Date(profiles.created_at);
            const ageInSeconds = (Date.now() - createdAt.getTime()) / 1000;

            if (ageInSeconds < 60) {
              console.log('📧 Enviando email de bienvenida a usuario nuevo');
              
              const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`
                },
                body: {
                  userEmail: data.session.user.email,
                  userName: data.session.user.user_metadata?.name 
                    || data.session.user.user_metadata?.full_name 
                    || ''
                }
              });
              
              if (emailError) {
                console.error('⚠️ Error enviando email de bienvenida:', emailError);
              } else {
                console.log('✅ Email de bienvenida enviado');
              }
            }
          }
        } catch (emailError) {
          console.error('⚠️ Error en flujo de email de bienvenida:', emailError);
        }
      }

      toast({
        title: "¡Acceso correcto!",
        description: "Has iniciado sesión correctamente.",
      });

      // Limpiar y cerrar
      localStorage.removeItem('oauthInProgress');
      
      setEmail("");
      setVerificationCode("");
      setShowCodeInput(false);
      onSuccess();
      onClose();

      // El AuthContext se encargará de la navegación
      console.log('✅ OTP verificado, AuthContext manejará la navegación');

    } catch (error: any) {
      console.error('❌ Error verificando código:', error);
      
      const errorMessage = error.message?.toLowerCase() || '';
      const friendlyMessage = errorMessage.includes('invalid') || errorMessage.includes('expired')
        ? 'El código no es válido o ha expirado. Solicita uno nuevo.'
        : 'No se pudo verificar el código. Inténtalo de nuevo.';
      
      toast({
        variant: "destructive",
        title: "Código incorrecto",
        description: friendlyMessage,
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
                : "Inicia sesión para vincular tu compra y acceder a tu contenido exclusivo."}
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
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
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
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full !bg-transparent text-black hover:text-[hsl(45,100%,50%)] hover:!bg-transparent transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Código enviado a <span className="font-medium">{lastEmailSent || email}</span>
                  {resendSeconds === 0 && (
                    <span className="block mt-1">¿No lo ves? Revisa spam/promociones</span>
                  )}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">¿No te llega?</div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={isLoading || resendSeconds > 0}
                    className="h-7 px-2 text-xs"
                  >
                    {resendSeconds > 0 ? `Reenviar en ${resendSeconds}s` : 'Reenviar código'}
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full !bg-transparent text-black hover:text-[hsl(45,100%,50%)] hover:!bg-transparent transition-colors" 
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                  disabled={isLoading}
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
