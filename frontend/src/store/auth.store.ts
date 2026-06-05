import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthUser, AuthSession } from '@/features/auth/types/auth.types';
import { authService } from '@/services/auth.service';
import { projectService } from '@/services/project.service';
import { queryClient } from '@/providers/QueryProvider';

async function syncProjectInvitations() {
  try {
    const claimedInvitations = await projectService.claimPendingInvitations();

    if (claimedInvitations.length > 0) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['project'] }),
      ]);
    }
  } catch (error) {
    console.error('Failed to claim project invitations:', error);
  }
}

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<import('@/features/auth/types/auth.types').AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      initializeAuth: async () => {
        set({ loading: true });
        try {
          const sessionResponse = await authService.getSession();
          if (sessionResponse.success && sessionResponse.data) {
            set({
              user: sessionResponse.data.user as AuthUser,
              session: sessionResponse.data as AuthSession,
            });
            await syncProjectInvitations();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const response = await authService.signIn({ email, password });
          if (!response.success) {
            throw new Error(response.error);
          }
          // Get the current session after sign in to ensure we have the full session object
          const sessionResponse = await authService.getSession();
          if (sessionResponse.success && sessionResponse.data) {
            set({
              user: response.data as AuthUser,
              session: sessionResponse.data as AuthSession,
              loading: false,
            });
            await syncProjectInvitations();
          } else {
            set({ user: response.data as AuthUser, loading: false });
          }
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },

      signUp: async (email, password, fullName) => {
        set({ loading: true });
        try {
          const response = await authService.signUp({ email, password, fullName });
          if (!response.success) {
            throw new Error(response.error);
          }
          // Get the current session after sign up to ensure we have the full session object
          const sessionResponse = await authService.getSession();
          if (sessionResponse.success && sessionResponse.data) {
            set({
              user: response.data as AuthUser,
              session: sessionResponse.data as AuthSession,
              loading: false,
            });
            await syncProjectInvitations();
          } else {
            set({ user: response.data as AuthUser, loading: false });
          }
          return response;
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await authService.signOut();
          set({ user: null, session: null, loading: false });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ loading: true });
        try {
          const response = await authService.resetPassword({ email });
          if (!response.success) {
            throw new Error(response.error);
          }
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },

      updatePassword: async (password) => {
        set({ loading: true });
        try {
          const response = await authService.updatePassword({ password });
          if (!response.success) {
            throw new Error(response.error);
          }
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
