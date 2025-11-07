import * as React from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  const isProcessingRef = useRef(false);
  const lastEventRef = useRef<{ event: string; timestamp: number } | null>(null);
  const mountedRef = useRef(true);

  const restoreCart = () => {
    const cartBackup = localStorage.getItem('cart_backup');
    if (cartBackup) {
      try {
        localStorage.setItem('shopping-cart', cartBackup);
        localStorage.removeItem('cart_backup');
        console.log('✅ Carrito restaurado desde backup');
        
        window.dispatchEvent(new CustomEvent('cart-restored', { 
          detail: { 
            restored: true,
            cart: JSON.parse(cartBackup),
            timestamp: Date.now()
          } 
        }));
        
        return true;
      } catch (error) {
        console.error('❌ Error restaurando carrito:', error);
        return false;
      }
    }
    return false;
  };

  const identifyUser = (user: User) => {
    try {
      const ra = (window as any).rudderanalytics;
      if (ra && typeof ra.identify === 'function') {
        ra.identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider || 'email'
        });
        console.log('✅ Usuario identificado en RudderStack:', user.email);
      }
    } catch (error) {
      console.error('❌ Error identificando en RudderStack:', error);
    }
  };

  const handlePostAuthentication = async (currentSession: Session) => {
    if (isProcessingRef.current) {
      console.log('⚠️ Ya procesando autenticación, ignorando');
      return;
    }

    isProcessingRef.current = true;
    console.log('🔐 Procesando post-autenticación para:', currentSession.user.email);

    try {
      identifyUser(currentSession.user);
      await new Promise(resolve => setTimeout(resolve, 150));

      const cartRestored = restoreCart();
      console.log('🛒 Carrito restaurado:', cartRestored);

      const isPendingCheckout = localStorage.getItem('pendingCheckout');
      const intendedRoute = localStorage.getItem('intendedRoute');
      const currentPath = window.location.pathname;
      
      console.log('📍 Estado post-auth:', { 
        isPendingCheckout, 
        intendedRoute,
        currentPath,
        cartRestored,
        hasCart: !!localStorage.getItem('shopping-cart')
      });

      localStorage.removeItem('oauthInProgress');
      sessionStorage.setItem('auth_completed', 'true');
      sessionStorage.setItem('auth_timestamp', Date.now().toString());

      const userName = currentSession.user.user_metadata?.name 
        || currentSession.user.user_metadata?.full_name 
        || currentSession.user.email?.split('@')[0] 
        || 'Usuario';

      if (isPendingCheckout === 'true') {
        console.log('✅ Checkout pendiente detectado');
        localStorage.removeItem('pendingCheckout');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        toast.success(`¡Bienvenido, ${userName}!`, {
          description: cartRestored 
            ? 'Tu carrito se ha preservado. Completando checkout...' 
            : 'Redirigiendo a checkout...',
          duration: 2500,
        });

        if (currentPath !== '/checkout') {
          await new Promise(resolve => setTimeout(resolve, 400));
          console.log('🔄 Navegando a checkout...');
          window.location.href = '/checkout';
        } else {
          console.log('📍 Ya en checkout, notificando actualización...');
          window.dispatchEvent(new CustomEvent('auth-checkout-ready', {
            detail: { 
              user: currentSession.user,
              session: currentSession,
              cartRestored,
              timestamp: Date.now()
            }
          }));
        }
      } else if (intendedRoute && intendedRoute !== '/checkout') {
        console.log('🔄 Redirigiendo a ruta intencional:', intendedRoute);
        
        toast.success(`¡Bienvenido de nuevo, ${userName}!`, {
          duration: 2000,
        });
        
        localStorage.removeItem('intendedRoute');
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = intendedRoute;
      } else {
        toast.success(`¡Hola, ${userName}!`, {
          duration: 2000,
        });
        
        if (currentPath === '/checkout') {
          window.dispatchEvent(new CustomEvent('auth-checkout-ready', {
            detail: { 
              user: currentSession.user,
              session: currentSession,
              cartRestored,
              timestamp: Date.now()
            }
          }));
        }
      }

    } catch (error) {
      console.error('❌ Error en post-autenticación:', error);
      toast.error('Hubo un problema al iniciar sesión. Por favor, recarga la página.');
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        console.log('🔓 Flag de procesamiento reseteado');
      }, 2000);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
          if (mountedRef.current) {
            setIsLoading(false);
          }
          return;
        }

        console.log('📍 Sesión inicial:', session?.user?.email || 'No session');
        
        if (mountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const cartBackup = localStorage.getItem('cart_backup');
            if (cartBackup) {
              console.log('🛒 Carrito backup encontrado en carga inicial');
              restoreCart();
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error en initAuth:', error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mountedRef.current) {
          console.log('⚠️ Componente desmontado, ignorando evento:', event);
          return;
        }

        const now = Date.now();
        if (lastEventRef.current && 
            lastEventRef.current.event === event && 
            now - lastEventRef.current.timestamp < 1000) {
          console.log('⚠️ Evento duplicado ignorado:', event);
          return;
        }
        
        lastEventRef.current = { event, timestamp: now };
        console.log('🔔 Auth event:', event, currentSession?.user?.email || 'No user');

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        switch (event) {
          case 'SIGNED_IN':
            if (currentSession?.user) {
              await handlePostAuthentication(currentSession);
            }
            break;

          case 'SIGNED_OUT':
            console.log('👋 Usuario cerró sesión');
            [
              'pendingCheckout',
              'oauthInProgress',
              'cart_backup',
              'intendedRoute'
            ].forEach(key => localStorage.removeItem(key));
            
            sessionStorage.removeItem('auth_completed');
            sessionStorage.removeItem('auth_timestamp');
            
            if (window.location.pathname === '/checkout') {
              window.location.href = '/';
            }
            break;

          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refrescado');
            break;

          case 'USER_UPDATED':
            console.log('👤 Usuario actualizado');
            break;

          case 'PASSWORD_RECOVERY':
            console.log('🔑 Recuperación de contraseña');
            break;

          default:
            console.log('ℹ️ Evento de auth no manejado:', event);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      console.log('🧹 AuthProvider desmontado');
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
