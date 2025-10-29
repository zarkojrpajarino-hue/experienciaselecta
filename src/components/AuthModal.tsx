import React, { useState } from "react";
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
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      setShowCodeInput(true);
      toast({
        title: "¡Código enviado!",
        description: "Revisa tu correo e introduce el código de verificación.",
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      toast({
        variant: "destructive",
        title: "Error al enviar el código",
        description: error.message || "No se pudo enviar el código de verificación.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });

      if (error) throw error;

      toast({
        title: "¡Acceso correcto!",
        description: "Has iniciado sesión correctamente.",
      });

      setEmail("");
      setVerificationCode("");
      setShowCodeInput(false);
      onSuccess();
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
          redirectTo: `${window.location.origin}/`,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Accede a tu cuenta
          </DialogTitle>
        </DialogHeader>

        <Card>
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
