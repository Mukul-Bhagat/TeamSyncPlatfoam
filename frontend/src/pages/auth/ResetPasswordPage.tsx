import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas/auth.schemas';
import { FormInput } from '@/features/auth/components/FormInput';
import { FormButton } from '@/features/auth/components/FormButton';

export function ResetPasswordPage() {
  const { updatePassword, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // Supabase automatically recovers the session from URL params
      // AuthProvider handles this via onAuthStateChange
      // We just need to call updatePassword with the new password
      await updatePassword(data.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  // If user is not authenticated, Supabase session recovery may not have worked
  // This could happen if the reset link is expired or invalid
  if (!isAuthenticated) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired"
      >
        <div className="space-y-6">
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
            Please request a new password reset link.
          </div>
          <Link
            to="/forgot-password"
            className="block w-full text-center bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-fast shadow-lg shadow-primary/25"
          >
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <FormInput
            name="password"
            label="New password"
            type="password"
            placeholder="••••••••"
            form={form}
            error={form.formState.errors.password?.message}
          />
          <FormInput
            name="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            form={form}
            error={form.formState.errors.confirmPassword?.message}
          />
        </div>
        <FormButton
          type="submit"
          loading={loading}
          loadingText="Resetting..."
        >
          Reset password
        </FormButton>
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity duration-fast"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
