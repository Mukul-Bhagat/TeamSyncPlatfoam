import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schemas';
import { FormInput } from '@/features/auth/components/FormInput';
import { FormButton } from '@/features/auth/components/FormButton';

export function LoginPage() {
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/workspace');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email and password to access your account"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <FormInput
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            form={form}
            error={form.formState.errors.email?.message}
          />
          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            form={form}
            error={form.formState.errors.password?.message}
          />
        </div>
        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity duration-fast"
          >
            Forgot your password?
          </Link>
        </div>
        <FormButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign in
        </FormButton>
        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary hover:opacity-80 transition-opacity duration-fast"
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
