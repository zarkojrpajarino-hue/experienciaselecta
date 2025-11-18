import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isProcessing = false;
    
    console.log('🔍 AuthProvider initializing...');
    
    // Debug: Verificar qué hay en localStorage de Supabase
    const checkSupabaseStorage = () => {
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(k => k.includes('supabase'));
      console.log('🔑 Supabase keys in localStorage:', supabaseKeys);
      supabaseKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            console.log(`📦 ${key}:`, {
              hasAccessToken: !!parsed.access_token,
              hasRefreshToken: !!parsed.refresh_token,
              expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A'
            });
          }
        } catch (e) {
          console.log(`📦 ${key}: [no JSON]`);
        }
      });
    };
    
    checkSupabaseStorage();
    
    // Primero verificar si hay una sesión existente
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📍 Initial session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email || 'No session',
        error: error?.message
      });
      
      if (error) {
        console.error('❌ Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Si ya hay sesión al cargar, restaurar carrito inmediatamente
      if (session?.user) {
        const cartBackup = localStorage.getItem('cart_backup');
        if (cartBackup) {
          try {
            localStorage.setItem('shopping-cart', cartBackup);
            localStorage.removeItem('cart_backup');
            console.log('✅ Carrito restaurado en carga inicial');
          } catch (error) {
            console.error('❌ Error restaurando carrito:', error);
          }
        }
      }
    });

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email || 'No user');
        
        // Prevenir procesamiento múltiple del mismo evento
        if (isProcessing) {
          console.log('⚠️ Ya procesando evento, ignorando duplicado');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // SOLO manejar el evento SIGNED_IN aquí
        if (event === 'SIGNED_IN' && session?.user) {
          isProcessing = true;
          console.log('✅ Usuario autenticado:', session.user.email);
          
          // Verificar que la sesión se haya guardado en localStorage
          setTimeout(() => {
            const keys = Object.keys(localStorage);
            const supabaseKeys = keys.filter(k => k.includes('supabase'));
            console.log('🔍 Post-login localStorage check:', {
              supabaseKeys: supabaseKeys.length,
              hasAuthToken: supabaseKeys.some(k => k.includes('auth'))
            });
            
            if (supabaseKeys.length === 0) {
              console.error('⚠️ WARNING: No Supabase keys found in localStorage after login!');
            }
          }, 500);
          
          // 1. Identificar en RudderStack
          try {
            const ra = (window as any).rudderanalytics;
            if (ra && typeof ra.identify === 'function') {
              ra.identify(session.user.id, {
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                avatar_url: session.user.user_metadata?.avatar_url,
                provider: session.user.app_metadata?.provider || 'google'
              });
              console.log('✅ Usuario identificado en RudderStack');
            }
          } catch (error) {
            console.error('❌ Error identificando en RudderStack:', error);
          }

          // 2. Obtener nombre del usuario para mensajes
          const userName = session.user.user_metadata?.name 
            || session.user.user_metadata?.full_name 
            || session.user.email?.split('@')[0] 
            || 'Usuario';

          // 3. Enviar email de bienvenida tras login
          try {
            console.log('🎉 Enviando email de bienvenida tras login:', session.user.email);
            
            // Obtener sesión actualizada
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (!currentSession?.access_token) {
              console.error('❌ No hay access_token disponible');
            } else {
              const { data, error } = await supabase.functions.invoke('send-welcome-email', {
                headers: {
                  Authorization: `Bearer ${currentSession.access_token}`
                },
                body: {
                  userEmail: session.user.email,
                  userName: userName
                }
              });
              
              if (error) {
                console.error('❌ Error enviando email:', error);
              } else {
                console.log('✅ Email de bienvenida enviado:', data);
              }
            }
          } catch (emailError) {
            console.error('❌ Error enviando email de bienvenida:', emailError);
          }

          // 4. Restaurar carrito si existe backup
          const cartBackup = localStorage.getItem('cart_backup');
          if (cartBackup) {
            try {
              localStorage.setItem('shopping-cart', cartBackup);
              localStorage.removeItem('cart_backup');
              console.log('✅ Carrito restaurado');
            } catch (error) {
              console.error('❌ Error restaurando carrito:', error);
            }
          }

          // 5. Verificar el contexto del login
          const isPendingCheckout = localStorage.getItem('pendingCheckout');
          const loginSource = localStorage.getItem('loginSource');
          
          if (isPendingCheckout) {
            console.log('🔄 Usuario debe volver a checkout...');
            localStorage.removeItem('pendingCheckout');
            localStorage.removeItem('oauthInProgress');
            localStorage.removeItem('loginSource');
            
            toast.success(`¡Bienvenido, ${userName}!`, {
              description: 'Ya puedes completar tu compra.',
              duration: 3000,
            });

            // Marcar que necesitamos navegar (lo manejará el componente Checkout)
            sessionStorage.setItem('auth_completed', 'true');
          } else if (loginSource === 'navbar') {
            // Login desde Navbar → NO redirigir
            console.log('✅ Login desde Navbar - Usuario permanece en página actual');
            localStorage.removeItem('loginSource');
            
            toast.success(`¡Bienvenido, ${userName}!`, {
              description: 'Has iniciado sesión correctamente.',
              duration: 3000,
            });
          } else {
            // Login normal
            localStorage.removeItem('loginSource');
            
            toast.success(`¡Bienvenido, ${userName}!`, {
              description: 'Has iniciado sesión correctamente.',
              duration: 3000,
            });
          }
          
          // Resetear flag después de 2 segundos
          setTimeout(() => {
            isProcessing = false;
          }, 2000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};