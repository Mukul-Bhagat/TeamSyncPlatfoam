/**
 * Authentication Configuration
 * 
 * This config provides environment-driven behavior for authentication.
 * 
 * Modes:
 * - LENIENT: Allows temp emails, no strict email verification blocking (default for development)
 * - STRICT: Enforces email verification, corporate restrictions (for production)
 */

export type AuthMode = 'LENIENT' | 'STRICT';

export interface AuthConfig {
  mode: AuthMode;
  requireEmailVerification: boolean;
  allowTempEmails: boolean;
  blockUnverifiedUsers: boolean;
}

const getAuthMode = (): AuthMode => {
  const envMode = import.meta.env.VITE_AUTH_MODE?.toUpperCase();
  if (envMode === 'LENIENT' || envMode === 'STRICT') {
    return envMode;
  }
  // Default to LENIENT for development
  return 'LENIENT';
};

export const authConfig: AuthConfig = {
  mode: getAuthMode(),
  requireEmailVerification: getAuthMode() === 'STRICT',
  allowTempEmails: getAuthMode() === 'LENIENT',
  blockUnverifiedUsers: getAuthMode() === 'STRICT',
};

/**
 * Check if the current auth mode is strict
 */
export const isStrictMode = (): boolean => authConfig.mode === 'STRICT';

/**
 * Check if the current auth mode is lenient
 */
export const isLenientMode = (): boolean => authConfig.mode === 'LENIENT';
