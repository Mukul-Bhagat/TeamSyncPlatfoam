import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/auth.schemas';
import { FormInput } from '@/features/auth/components/FormInput';
import { FormButton } from '@/features/auth/components/FormButton';

export function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      toast.success('Password reset email sent!');
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {success ? (
        <div className="space-y-6">
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
            Password reset email sent! Please check your inbox.
          </div>
          <Link
            to="/login"
            className="block w-full text-center bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-fast shadow-lg shadow-primary/25"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            form={form}
            error={form.formState.errors.email?.message}
          />
          <FormButton
            type="submit"
            loading={loading}
            loadingText="Sending..."
          >
            Send reset link
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
      )}
    </AuthLayout>
  );
}
