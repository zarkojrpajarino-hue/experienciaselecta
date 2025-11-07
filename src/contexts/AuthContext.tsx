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
    let mounted = true;
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🔍 Sesión inicial:', session?.user?.email || 'NO SESSION');
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Si hay sesión al cargar Y NO estamos ya en checkout/pago → redirigir
      if (session?.user) {
        const currentPath = window.location.pathname;
        console.log('📍 Ruta actual:', currentPath);
        
        if (currentPath !== '/checkout' && currentPath !== '/pago' && currentPath !== '/pago-exitoso') {
          console.log('🔄 Usuario con sesión detectado, redirigiendo a checkout');
          
          const userName = session.user.user_metadata?.name 
            || session.user.user_metadata?.full_name 
            || session.user.email?.split('@')[0] 
            || 'Usuario';
          
          toast.success(`¡Bienvenido de nuevo, ${userName}!`);
          
          // Limpiar flags
          localStorage.removeItem('pendingCheckout');
          localStorage.removeItem('oauthInProgress');
          
          setTimeout(() => {
            window.location.href = '/checkout';
          }, 500);
        } else {
          console.log('✅ Ya en checkout/pago, no redirigir');
          localStorage.removeItem('pendingCheckout');
          localStorage.removeItem('oauthInProgress');
        }
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      console.log('🔔 Auth event:', _event, session?.user?.email || 'NO USER');
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Solo procesar SIGNED_IN (nuevo login)
      if (_event === 'SIGNED_IN' && session?.user && !hasRedirectedRef.current) {
        const userName = session.user.user_metadata?.name 
          || session.user.user_metadata?.full_name 
          || session.user.email?.split('@')[0] 
          || 'Usuario';
        
        console.log('✅ Usuario logueado:', userName);
        
        hasRedirectedRef.current = true;
        localStorage.removeItem('pendingCheckout');
        localStorage.removeItem('oauthInProgress');
        
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/checkout' && currentPath !== '/pago' && currentPath !== '/pago-exitoso') {
          console.log('🔄 Redirigiendo de', currentPath, 'a /checkout');
          toast.success(`¡Bienvenido, ${userName}!`);
          
          setTimeout(() => {
            window.location.href = '/checkout';
          }, 500);
        } else {
          console.log('✅ Ya en checkout/pago, no redirigir');
          toast.success(`¡Bienvenido, ${userName}!`);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
