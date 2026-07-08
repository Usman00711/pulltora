import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name needs at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values: RegisterForm) => {
    setErrorMessage('');
    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <section className="mx-auto flex max-w-lg items-center justify-center">
      <div className="panel hover-lift motion-fade-up w-full p-8">
        <p className="kpi-badge">Create Account</p>
        <h1 className="mt-2 text-3xl font-bold">Get started with Pulltora</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a secure account to access private repository insights.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              className="glass-input"
              placeholder="Your name"
              {...register('name')}
            />
            {errors.name && <span className="text-sm text-red-300">{errors.name.message}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input className="glass-input" placeholder="you@company.com" {...register('email')} />
            {errors.email && <span className="text-sm text-red-300">{errors.email.message}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              className="glass-input"
              type="password"
              placeholder="Set password"
              {...register('password')}
            />
            {errors.password && <span className="text-sm text-red-300">{errors.password.message}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Confirm password</span>
            <input
              className="glass-input"
              type="password"
              placeholder="Confirm password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-300">{errors.confirmPassword.message}</span>
            )}
          </label>
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        {errorMessage && <p className="mt-3 text-sm text-red-300">{errorMessage}</p>}
        <p className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="font-semibold text-brand">Login</Link>
        </p>
      </div>
    </section>
  );
}
