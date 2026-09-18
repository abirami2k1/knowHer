import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { friendlyAuthError } from '@/lib/auth/cognito';
import { AuthLayout } from './AuthLayout';
import { Unconfigured } from './Unconfigured';

type Step = 'details' | 'confirm';
const MIN_PASSWORD = 8;

export default function SignUp() {
  const { status, signUp, confirmSignUp, resendCode, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state as { email?: string; step?: Step } | null;

  const [step, setStep] = useState<Step>(initial?.step ?? 'details');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();

  if (status === 'authed') return <Navigate to="/" replace />;

  async function onDetails(event: FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setPasswordError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setPasswordError(undefined);
    if (confirmPassword !== password) {
      setConfirmError("Those passwords don't match.");
      return;
    }
    setConfirmError(undefined);
    setBusy(true);
    try {
      await signUp(email.trim(), password);
      toast.success('Check your inbox — we sent you a confirmation code.');
      setStep('confirm');
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      // Sign straight in if we still have the password (fresh sign-up); otherwise go to login.
      if (password) {
        await signIn(email.trim(), password);
        toast.success('You’re in. Welcome to knowHer.');
        navigate('/', { replace: true });
      } else {
        toast.success('Email confirmed. Please sign in.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    try {
      await resendCode(email.trim());
      toast.success('A new code is on its way.');
    } catch (error) {
      toast.error(friendlyAuthError(error));
    }
  }

  if (status === 'unconfigured') {
    return (
      <AuthLayout title="Create your account" intro="A calm place to get to know your cycle.">
        <Unconfigured />
      </AuthLayout>
    );
  }

  if (step === 'confirm') {
    return (
      <AuthLayout title="Confirm your email" intro={`We sent a 6-digit code to ${email}.`}>
        <form onSubmit={onConfirm} className="space-y-5" noValidate>
          <Field
            label="Confirmation code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" loading={busy}>
            Confirm
          </Button>
          <Button type="button" variant="ghost" onClick={onResend} disabled={busy}>
            Resend code
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" intro="A calm place to get to know your cycle.">
      <form onSubmit={onDetails} className="space-y-5" noValidate>
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
          name="new-password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          hint={`At least ${MIN_PASSWORD} characters.`}
          error={passwordError}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          required
          error={confirmError}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" loading={busy || status === 'loading'}>
          Create account
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
