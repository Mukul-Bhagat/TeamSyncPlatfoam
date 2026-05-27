import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setSession, setLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Initialize auth on mount
    const initAuth = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
          setSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading, initializeAuth]);

  return <>{children}</>;
}
