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
            console.log('Processing OAuth code...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('OAuth exchange error:', error);
            } else if (data.session) {
              console.log('✅ OAuth exchange success, session created for:', data.session.user.email);
              
              // Enviar email de bienvenida para nuevos usuarios
              try {
                const { data: profiles } = await supabase
                  .from('profiles')
                  .select('created_at')
                  .eq('user_id', data.session.user.id);

                if (profiles && profiles.length > 0) {
                  const createdAt = new Date(profiles[0].created_at);
                  const now = new Date();
                  const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

                  // Enviar email de bienvenida si el perfil se creó recientemente (últimos 30 segundos)
                  if (diffSeconds < 30) {
                    console.log('Sending welcome email to new OAuth user:', data.session.user.email);
                    const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
                      headers: {
                        Authorization: `Bearer ${data.session.access_token}`
                      },
                      body: {
                        userEmail: data.session.user.email,
                        userName: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name || ''
                      }
                    });
                    
                    if (emailError) {
                      console.error('Error sending welcome email:', emailError);
                    } else {
                      console.log('Welcome email sent successfully');
                    }
                  }
                }
              } catch (emailError) {
                console.error('Error in welcome email flow:', emailError);
                // No fallar el login si falla el email
              }
              
              // Limpiar la URL sin recargar la página
              const currentPath = window.location.pathname;
              console.log('Cleaning URL on path:', currentPath);
              window.history.replaceState({}, '', currentPath);
              
              // Limpiar localStorage
              localStorage.removeItem('pendingCheckout');
              console.log('✅ OAuth flow completed, staying on', currentPath);
            }
          }
        } catch (e) {
          console.error('Global OAuth exchange error:', e);
        } finally {
          try { sessionStorage.setItem('oauthHandled', 'true'); } catch {}
          try { localStorage.removeItem('oauthInProgress'); } catch {}
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
