import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values: LoginForm) => {
    setErrorMessage('');
    try {
      await login(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <section className="mx-auto flex max-w-md items-center justify-center">
      <div className="panel hover-lift motion-fade-up w-full p-8">
        <p className="kpi-badge">Sign In</p>
        <h1 className="mt-2 text-3xl font-bold">Login to Pulltora</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your dashboard with your account.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              className="glass-input"
              placeholder="you@company.com"
              {...register('email')}
            />
            {errors.email && <span className="text-sm text-red-300">{errors.email.message}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              className="glass-input"
              type="password"
              placeholder="Enter password"
              {...register('password')}
            />
            {errors.password && (
              <span className="text-sm text-red-300">{errors.password.message}</span>
            )}
          </label>
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {errorMessage && <p className="mt-3 text-sm text-red-300">{errorMessage}</p>}
        <p className="mt-4 text-sm">
          New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
