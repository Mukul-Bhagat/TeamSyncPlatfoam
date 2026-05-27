export const getAuthErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  const message = error?.message || error?.error_description || 'An unexpected error occurred';
  
  // Map common Supabase errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Unable to validate email address': 'Invalid email address',
    'Password reset requires email': 'Please provide your email address',
  };
  
  return errorMap[message] || message;
};

export const isAuthError = (error: any): boolean => {
  return error?.message?.includes('auth') || error?.status === 401;
};
