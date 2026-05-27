import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/features/auth/schemas/auth.schemas';
import { FormInput } from '@/features/auth/components/FormInput';
import { FormButton } from '@/features/auth/components/FormButton';

export function SignupPage() {
  const { signUp, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signUp(data.email, data.password, data.fullName);
      
      if (response.requiresEmailConfirmation) {
        toast.success('Account created! Please check your email to confirm.');
        navigate('/login');
      } else {
        toast.success('Account created successfully!');
        navigate('/workspace');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join TeamSync to collaborate with your team"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <FormInput
            name="fullName"
            label="Full name"
            type="text"
            placeholder="John Doe"
            form={form}
            error={form.formState.errors.fullName?.message}
          />
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
        <FormButton
          type="submit"
          loading={loading}
          loadingText="Creating account..."
        >
          Create account
        </FormButton>
        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:opacity-80 transition-opacity duration-fast"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
