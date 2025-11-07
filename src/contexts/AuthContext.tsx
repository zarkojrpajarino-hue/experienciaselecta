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

  const identifyUser = (user: User) => {
    try {
      const ra = (window as any).rudderanalytics;
      if (ra && typeof ra.identify === 'function') {
        ra.identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider || 'google'
        });
        console.log('✅ Usuario identificado en RudderStack');
      }
    } catch (error) {
      console.error('❌ Error identificando en RudderStack:', error);
    }
  };

  const restoreCart = (): boolean => {
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

  const handlePostAuthentication = async (currentSession: Session) => {
    if (isProcessingRef.current) {
      console.log('⚠️ Ya procesando autenticación, ignorando');
      return;
    }

    isProcessingRef.current = true;
    console.log('🔐 Procesando post-autenticación para:', currentSession.user.email);

    try {
      // 1. Identificar usuario en analytics
      identifyUser(currentSession.user);

      // 2. Restaurar carrito
      const cartRestored = restoreCart();
      console.log('🛒 Carrito restaurado:', cartRestored);

      // 3. Limpiar flags
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('oauthInProgress');

      // 4. Mensaje de bienvenida
      const userName = currentSession.user.user_metadata?.name 
        || currentSession.user.user_metadata?.full_name 
        || currentSession.user.email?.split('@')[0] 
        || 'Usuario';
      
      toast.success(`¡Bienvenido, ${userName}!`, {
        description: 'Tu carrito se ha preservado correctamente.',
        duration: 3000,
      });

      // 5. SIEMPRE navegar a checkout (porque el login solo se abre desde ahí)
      console.log('🔄 Redirigiendo a checkout...');
      
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 500);

    } catch (error) {
      console.error('❌ Error en post-autenticación:', error);
      toast.error('Hubo un problema. Por favor, recarga la página.');
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    }
  };

  useEffect(() => {
    
    // Primero verificar si hay una sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📍 Initial session check:', session?.user?.email || 'No session');
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
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

      // SOLO manejar el evento SIGNED_IN aquí
      if (event === 'SIGNED_IN' && session?.user) {
        handlePostAuthentication(session);
      }
      
      // Limpiar el flag cuando se cierra sesión
      if (event === 'SIGNED_OUT') {
        isProcessingRef.current = false;
        console.log('🔓 Sesión cerrada');
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
