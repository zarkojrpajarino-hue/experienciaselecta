import * as React from 'react';
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
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Si el usuario acaba de hacer login
      if (_event === 'SIGNED_IN' && session?.user) {
        const userName = session.user.user_metadata?.name 
          || session.user.user_metadata?.full_name 
          || session.user.email?.split('@')[0] 
          || 'Usuario';
        
        console.log('✅ Usuario logueado:', userName);
        
        // Limpiar todos los flags de OAuth
        localStorage.removeItem('pendingCheckout');
        localStorage.removeItem('oauthInProgress');
        localStorage.removeItem('temp-cart-before-oauth');
        sessionStorage.removeItem('oauthHandled');
        
        // SIEMPRE redirigir a checkout después del login
        console.log('🔄 Redirigiendo a checkout...');
        
        toast.success(`¡Bienvenido, ${userName}!`, {
          description: 'Redirigiendo a checkout...',
          duration: 2000,
        });
        
        // Pequeño delay para que se vea el toast
        setTimeout(() => {
          console.log('✅ Ejecutando redirección a /checkout');
          window.location.href = '/checkout';
        }, 800);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
