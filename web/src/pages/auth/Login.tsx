import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { friendlyAuthError } from '@/lib/auth/cognito';
import { AuthLayout } from './AuthLayout';
import { Unconfigured } from './Unconfigured';

export default function Login() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authed') {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back.');
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'UserNotConfirmedException') {
        navigate('/signup', { state: { email: email.trim(), step: 'confirm' } });
      }
      toast.error(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" intro="Sign in to pick up where you left off.">
      {status === 'unconfigured' ? (
        <Unconfigured />
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" loading={busy || status === 'loading'}>
            Sign in
          </Button>
          <p className="text-center text-sm text-muted">
            New here?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
