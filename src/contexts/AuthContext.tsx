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
  
  // Prevenir bucle infinito
  const hasRedirectedRef = useRef(false);

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
          console.log('✅ Usuario autenticado:', session.user.email);
          
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

          // 2. Restaurar carrito si existe backup
          const cartBackup = localStorage.getItem('cart_backup');
          if (cartBackup) {
            try {
              localStorage.setItem('shopping-cart', cartBackup);
              localStorage.removeItem('cart_backup');
              console.log('✅ Carrito restaurado después de login');
            } catch (error) {
              console.error('❌ Error restaurando carrito:', error);
            }
          }

          // 3. Limpiar flags de OAuth
          const isPendingCheckout = localStorage.getItem('pendingCheckout');
          if (isPendingCheckout) {
            console.log('✅ Limpiando flags de OAuth checkout');
            localStorage.removeItem('pendingCheckout');
            localStorage.removeItem('oauthInProgress');
            
            // Mostrar toast de bienvenida
            const userName = session.user.user_metadata?.name 
              || session.user.user_metadata?.full_name 
              || session.user.email?.split('@')[0] 
              || 'Usuario';
            
            toast.success(`¡Bienvenido, ${userName}!`, {
              description: 'Has iniciado sesión correctamente.',
              duration: 3000,
            });
          }
          
          // NO hacer nada más - dejar que React actualice naturalmente
          console.log('✅ Login completado - React actualizará la UI automáticamente');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Limpiar flag de redirección al desmontar
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('login_redirect_done');
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
