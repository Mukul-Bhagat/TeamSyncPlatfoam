import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/features/auth/utils/auth.utils';
import { authConfig } from '@/features/auth/config/auth.config';
import type { 
  SignUpCredentials, 
  LoginCredentials, 
  ResetPasswordCredentials,
  UpdatePasswordCredentials,
  AuthResponse 
} from '@/features/auth/types/auth.types';

export const authService = {
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
          emailRedirectTo: `${window.location.origin}/workspace`,
        },
      });

      if (error) throw error;

      // In LENIENT mode, we allow signup even if email confirmation is pending
      // The actual email confirmation requirement is controlled by Supabase project settings
      // This config allows us to handle the response appropriately based on mode
      return {
        success: true,
        data: data.user,
        requiresEmailConfirmation: !data.session && authConfig.requireEmailVerification,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return {
        success: true,
        data: data.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async updatePassword(credentials: UpdatePasswordCredentials): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: credentials.password,
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      return {
        success: true,
        data: session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
