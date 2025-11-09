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
      // Timeout de 30 segundos para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Timeout: La validación del token tardó más de 30 segundos');
        setStatus('error');
        toast.error('Tiempo de espera agotado', {
          description: 'La validación del token tardó demasiado. Por favor, intenta de nuevo.'
        });
        setTimeout(() => navigate('/'), 3000);
      }, 30000);

      try {
        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect') || '';

        console.log('Token from URL:', token);
        console.log('Redirect param:', redirect);
        console.log('Final redirect path:', redirect || '/');

        if (!token) {
          console.error('❌ No token provided');
          clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Enlace inválido', {
            description: 'No se proporcionó un token de acceso'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('🚀 Llamando validate-login-token con token:', token);

        // Verificar el token llamando a la edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          'validate-login-token',
          {
            body: { token }
          }
        );

        console.log('📥 Respuesta recibida de validate-login-token:');
        console.log('  - Data:', tokenData);
        console.log('  - Error:', tokenError);

        if (tokenError) {
          console.error('❌ Error en la llamada a la función:', tokenError);
          clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Error de validación', {
            description: `Error al validar el token: ${tokenError.message || 'Error desconocido'}`
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!tokenData?.valid) {
          console.error('❌ Token no válido o expirado:', tokenData);
          clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Enlace expirado', {
            description: tokenData?.error || 'Este enlace ha expirado o ya fue utilizado.'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('✅ Token validated successfully:', tokenData);
        clearTimeout(timeoutId);

        console.log('🔐 Usando hashed_token para autenticar...');

        // Usar el hashed_token para autenticar al usuario
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenData.hashed_token,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('❌ Error verifying OTP:', verifyError);
          clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Error de verificación', {
            description: `No se pudo verificar el token: ${verifyError.message}`
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('✅ OTP verified, checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('❌ No session after token validation:', sessionError);
          clearTimeout(timeoutId);
          setStatus('error');
          toast.error('Error de autenticación', {
            description: 'No se pudo iniciar sesión automáticamente. Por favor, inicia sesión normalmente.'
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('✅ Session found, user authenticated:', session.user.email);
        clearTimeout(timeoutId);
        setStatus('success');
        
        // Si viene con redirect=feedback, activar badge de feedback pendiente
        if (redirect === 'feedback') {
          console.log('🎯 AutoLogin con redirect=feedback - activando badge de feedback');
          sessionStorage.setItem('emailReminderPending', 'true');
          window.dispatchEvent(new CustomEvent('pendingFeedbackChanged'));
        }
        
        // Obtener el nombre del usuario de los metadatos o usar el email como fallback
        const userName = session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name || 
                        session.user.email?.split('@')[0] || 
                        'usuario';
        
        toast.success(`🎉 ¡Bienvenido de nuevo, ${userName}!`, {
          description: 'Has iniciado sesión correctamente',
          duration: 3000
        });

        // Redirigir a la página especificada
        setTimeout(() => {
          const decodedRedirect = redirect ? decodeURIComponent(redirect) : '';
          const targetPath = decodedRedirect ? `/${decodedRedirect}` : '/';
          console.log('Redirecting to:', targetPath);
          navigate(targetPath);
        }, 1000);

      } catch (error: any) {
        console.error('💥 Error during auto-login:', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        clearTimeout(timeoutId);
        setStatus('error');
        toast.error('Error inesperado', {
          description: error.message || 'Ocurrió un error al procesar tu solicitud.'
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
