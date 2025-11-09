import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/PageLoader';
import { toast } from 'sonner';

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  useEffect(() => {
    const processAutoLogin = async () => {
      try {
        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect') || 'perfil';

        if (!token) {
          console.error('No token provided');
          setStatus('error');
          toast.error('Enlace inválido', {
            description: 'No se proporcionó un token de acceso'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('Processing auto-login with token:', token);

        // Verificar el token llamando a la edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          'validate-login-token',
          {
            body: { token }
          }
        );

        if (tokenError || !tokenData?.valid) {
          console.error('Invalid or expired token:', tokenError);
          setStatus('error');
          toast.error('Enlace expirado', {
            description: 'Este enlace ha expirado o ya fue utilizado. Por favor, inicia sesión normalmente.'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('Token validated successfully:', tokenData);

        // Verificar que el token sea válido
        if (!tokenData.valid) {
          throw new Error('Invalid token');
        }

        // Usar el hashed_token para autenticar al usuario
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenData.hashed_token,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('Error verifying OTP:', verifyError);
          throw verifyError;
        }

        console.log('OTP verified, checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('No session after token validation:', sessionError);
          setStatus('error');
          toast.error('Error de autenticación', {
            description: 'No se pudo iniciar sesión automáticamente. Por favor, inicia sesión normalmente.'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('Session found, user authenticated:', session.user.email);
        setStatus('success');
        toast.success('¡Bienvenido de vuelta!', {
          description: 'Has iniciado sesión correctamente'
        });

        // Redirigir a la página especificada
        setTimeout(() => {
          const decodedRedirect = decodeURIComponent(redirect);
          navigate(`/${decodedRedirect}`);
        }, 1000);

      } catch (error: any) {
        console.error('Error during auto-login:', error);
        setStatus('error');
        toast.error('Error inesperado', {
          description: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.'
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processAutoLogin();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <PageLoader />
        <p className="mt-4 text-muted-foreground">Verificando tu acceso...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Enlace inválido o expirado</h1>
          <p className="text-muted-foreground mb-4">
            Este enlace de acceso rápido ha expirado o ya fue utilizado.
          </p>
          <p className="text-sm text-muted-foreground">
            Serás redirigido a la página principal en unos momentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">¡Acceso verificado!</h1>
        <p className="text-muted-foreground">
          Redirigiendo a tu perfil...
        </p>
      </div>
    </div>
  );
};

export default AutoLogin;
