import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Manejar callback OAuth globalmente para asegurar creación de sesión y mantener el carrito
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const hasTokenInHash = window.location.hash.includes('access_token=');

    if ((code || hasTokenInHash) && !session && !sessionStorage.getItem('oauthHandled')) {
      (async () => {
        try {
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          }
        } catch (e) {
          console.error('Global OAuth exchange error:', e);
        } finally {
          try { sessionStorage.setItem('oauthHandled', 'true'); } catch {}
          // Limpiar parámetros de la URL para evitar reintentos
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
        }
      })();
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
