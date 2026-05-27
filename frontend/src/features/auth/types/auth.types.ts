export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  initialized: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
  requiresEmailConfirmation?: boolean;
}
