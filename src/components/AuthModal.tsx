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

  // Guardar la ruta/intención actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const intended = window.location.pathname + window.location.search + window.location.hash;
      localStorage.setItem('intendedRoute', intended);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailClean = email.trim().toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean);
      if (!emailValid) {
        throw new Error("Introduce un email válido (ej. usuario@dominio.com)");
      }

      // Mantener la ruta actual para volver después del login
      const redirectUrl = window.location.href;
      const { error } = await supabase.auth.signInWithOtp({
        email: emailClean,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

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
      const redirectUrl = window.location.href;
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

      // Check if it's a new user and send welcome email
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('user_id', session.user.id)
            .single();

          // If profile was just created (within last 5 seconds), send welcome email
          if (profile?.created_at) {
            const createdAt = new Date(profile.created_at);
            const now = new Date();
            const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

            if (diffSeconds < 5) {
              // New user, send welcome email
              await supabase.functions.invoke('send-welcome-email', {
                body: {
                  userEmail: session.user.email,
                  userName: session.user.user_metadata?.name || session.user.user_metadata?.full_name || ''
                }
              });
            }
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't fail the login if welcome email fails
        }
      }

      toast({
        title: "¡Acceso correcto!",
        description: "Has iniciado sesión correctamente.",
      });

      setEmail("");
      setVerificationCode("");
      setShowCodeInput(false);
      onSuccess();

      // Redirigir a la ruta/intención original (por ejemplo, checkout)
      const intended = localStorage.getItem('intendedRoute');
      if (intended) {
        localStorage.removeItem('intendedRoute');
        try {
          const url = intended.startsWith('http')
            ? intended
            : `${window.location.origin}${intended.startsWith('/') ? '' : '/'}${intended}`;
          // Asegura misma origin y evita volver atrás
          if (new URL(url).origin === window.location.origin) {
            window.location.replace(url);
          } else {
            window.location.href = window.location.href; // fallback: permanecer en la página actual
          }
          return;
        } catch {
          // Si algo falla, no bloquea el cierre del modal
        }
      }

      onClose();
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

  const handleGoogleSignIn = async () => {
    try {
      const inIframe = window.self !== window.top;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href, // Mantener ruta actual tras login
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: inIframe,
        }
      });

      if (error) throw error;

      if (inIframe && data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión con Google",
        description: error.message,
      });
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
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto" hideClose={true}>
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
              <CardDescription>
                {showCodeInput ? "Introduce el código que te enviamos" : "Te enviaremos un código de verificación a tu email"}
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
                <Mail className="w-4 h-4 mr-2" />
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
