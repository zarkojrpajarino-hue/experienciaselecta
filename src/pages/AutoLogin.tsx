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
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        // Timeout de 30 segundos
        timeoutId = setTimeout(() => {
          setStatus('error');
          toast.error('Tiempo de espera agotado');
          setTimeout(() => navigate('/'), 3000);
        }, 30000);

        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect') || '';

        if (!token) {
          if (timeoutId) clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Enlace inválido');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Validar token
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          'validate-login-token',
          { body: { token } }
        );

        if (tokenError || !tokenData?.valid) {
          if (timeoutId) clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Enlace expirado o inválido');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (timeoutId) clearTimeout(timeoutId);

        // Autenticar usuario
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenData.hashed_token,
          type: 'magiclink',
        });

        if (verifyError) {
          setStatus('error');
          toast.error('Error de verificación');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus('error');
          toast.error('Error de autenticación');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setStatus('success');
        
        // Activar badge si viene redirect=feedback
        if (redirect === 'feedback') {
          sessionStorage.setItem('emailReminderPending', 'true');
          window.dispatchEvent(new CustomEvent('pendingFeedbackChanged'));
        }
        
        const userName = session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name || 
                        session.user.email?.split('@')[0] || 
                        'usuario';
        
        toast.success(`¡Bienvenido de nuevo, ${userName}!`);

        // Redirigir
        setTimeout(() => {
          const decodedRedirect = redirect ? decodeURIComponent(redirect) : '';
          const targetPath = decodedRedirect ? `/${decodedRedirect}` : '/';
          navigate(targetPath);
        }, 1000);

      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);
        setStatus('error');
        toast.error('Error inesperado');
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
