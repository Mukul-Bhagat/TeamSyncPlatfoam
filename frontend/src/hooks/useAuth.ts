import { useAuthStore } from '@/store/auth.store';
import type { AuthUser, AuthSession, AuthResponse } from '@/features/auth/types/auth.types';

export function useAuth() {
  const {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    initializeAuth,
  } = useAuthStore();

  return {
    user: user as AuthUser | null,
    session: session as AuthSession | null,
    loading,
    initialized,
    isAuthenticated: !!user,
    signIn,
    signUp: signUp as (email: string, password: string, fullName?: string) => Promise<AuthResponse>,
    signOut,
    resetPassword,
    updatePassword,
    initializeAuth,
  };
}
