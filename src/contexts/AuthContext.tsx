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
            cart: JSON.parse(cartBackup)
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

  const navigateToCheckout = () => {
    console.log('🔄 Navegando a checkout...');
    
    if (window.location.pathname !== '/checkout') {
      // Usar href directo en lugar de pushState
      window.location.href = '/checkout';
    } else {
      // Si ya estamos en checkout, solo disparar evento
      console.log('📍 Ya en checkout, disparando actualización...');
      window.dispatchEvent(new CustomEvent('force-checkout-refresh', {
        detail: { timestamp: Date.now() }
      }));
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

      await new Promise(resolve => setTimeout(resolve, 100));
      const cartRestored = restoreCart();
      console.log('🛒 Carrito restaurado:', cartRestored);

      const isPendingCheckout = localStorage.getItem('pendingCheckout');
      const intendedRoute = localStorage.getItem('intendedRoute');
      
      console.log('📍 Estado:', { 
        isPendingCheckout, 
        intendedRoute,
        currentPath: window.location.pathname,
        cartRestored
      });

      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('oauthInProgress');
      sessionStorage.setItem('auth_completed', 'true');

      const userName = currentSession.user.user_metadata?.name 
        || currentSession.user.user_metadata?.full_name 
        || currentSession.user.email?.split('@')[0] 
        || 'Usuario';

      if (isPendingCheckout) {
        console.log('✅ Checkout pendiente detectado');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        toast.success(`¡Bienvenido, ${userName}!`, {
          description: cartRestored 
            ? 'Tu carrito se ha preservado correctamente.' 
            : 'Ya puedes completar tu compra.',
          duration: 3000,
        });

        if (window.location.pathname !== '/checkout') {
          await new Promise(resolve => setTimeout(resolve, 300));
          navigateToCheckout();
        } else {
          console.log('📍 Ya en checkout, disparando actualización...');
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { 
              user: currentSession.user,
              session: currentSession,
              cartRestored 
            }
          }));
        }
      } else if (intendedRoute) {
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
        
        if (window.location.pathname === '/checkout') {
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { 
              user: currentSession.user,
              session: currentSession
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
      }, 3000);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('📍 Sesión inicial:', session?.user?.email || 'No session');
        
        if (mounted) {
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
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) {
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
      mounted = false;
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
