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
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔔 Auth event:', _event);
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Solo procesar SIGNED_IN si NO hemos redirigido ya
      if (_event === 'SIGNED_IN' && session?.user && !hasRedirectedRef.current) {
        const userName = session.user.user_metadata?.name 
          || session.user.user_metadata?.full_name 
          || session.user.email?.split('@')[0] 
          || 'Usuario';
        
        console.log('✅ Usuario logueado:', userName);
        
        // Marcar que ya procesamos este login
        hasRedirectedRef.current = true;
        sessionStorage.setItem('login_redirect_done', 'true');
        
        // Limpiar flags de OAuth
        localStorage.removeItem('pendingCheckout');
        localStorage.removeItem('oauthInProgress');
        localStorage.removeItem('temp-cart-before-oauth');
        sessionStorage.removeItem('oauthHandled');
        
        // Solo redirigir si NO estamos ya en checkout
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/checkout') {
          console.log('🔄 Redirigiendo de', currentPath, 'a /checkout');
          
          toast.success(`¡Bienvenido, ${userName}!`, {
            description: 'Redirigiendo a checkout...',
            duration: 2000,
          });
          
          setTimeout(() => {
            window.location.href = '/checkout';
          }, 800);
        } else {
          console.log('✅ Ya en checkout, no redirigir');
          toast.success(`¡Bienvenido, ${userName}!`);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      // Reset ref al desmontar
      hasRedirectedRef.current = false;
    };
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
