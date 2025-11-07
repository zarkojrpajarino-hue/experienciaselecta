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
        console.log('✅ Carrito restaurado');
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

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
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
            restoreCart();
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
        if (!mounted) return;

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

        if (event === 'SIGNED_IN' && currentSession?.user) {
          if (isProcessingRef.current) {
            console.log('⚠️ Ya procesando SIGNED_IN, ignorando');
            return;
          }

          isProcessingRef.current = true;
          console.log('✅ Usuario autenticado:', currentSession.user.email);

          try {
            identifyUser(currentSession.user);
            restoreCart();

            const isPendingCheckout = localStorage.getItem('pendingCheckout');
            
            if (isPendingCheckout) {
              console.log('🔄 Redirigiendo a checkout...');
              
              localStorage.removeItem('pendingCheckout');
              localStorage.removeItem('oauthInProgress');
              
              const userName = currentSession.user.user_metadata?.name 
                || currentSession.user.user_metadata?.full_name 
                || currentSession.user.email?.split('@')[0] 
                || 'Usuario';
              
              toast.success(`¡Bienvenido, ${userName}!`, {
                description: 'Tu carrito se ha preservado correctamente.',
                duration: 3000,
              });

              sessionStorage.setItem('auth_completed', 'true');
            }
          } catch (error) {
            console.error('❌ Error en post-autenticación:', error);
          } finally {
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 2000);
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 Usuario cerró sesión');
          localStorage.removeItem('pendingCheckout');
          localStorage.removeItem('oauthInProgress');
          localStorage.removeItem('cart_backup');
          sessionStorage.removeItem('auth_completed');
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refrescado');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
