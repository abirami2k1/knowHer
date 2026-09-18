import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  type CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { createUserPool } from '@/lib/auth/cognito';
import { setAccessTokenProvider } from '@/lib/api/client';

/**
 * Email from the ID token. Pools that sign in by email assign a UUID username,
 * so user.getUsername() is not the address — the `email` claim is.
 */
function emailFromSession(session: CognitoUserSession): string | null {
  const claim = session.getIdToken().payload['email'];
  return typeof claim === 'string' ? claim : null;
}

/** Promise wrapper over the callback-style session API; resolves null when not signed in. */
function getSession(user: CognitoUser | null): Promise<CognitoUserSession | null> {
  if (!user) return Promise.resolve(null);
  return new Promise((resolve) => {
    user.getSession((error: Error | null, session: CognitoUserSession | null) => {
      resolve(error || !session?.isValid() ? null : session);
    });
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pool = useMemo<CognitoUserPool | null>(() => createUserPool(), []);
  const [status, setStatus] = useState<AuthStatus>(pool ? 'loading' : 'unconfigured');
  const [email, setEmail] = useState<string | null>(null);

  // The API client asks here for a token on every request. getSession() refreshes an
  // expired access token with the refresh token, so the client never sends a stale JWT.
  useEffect(() => {
    setAccessTokenProvider(async () => {
      const session = await getSession(pool?.getCurrentUser() ?? null);
      return session?.getAccessToken().getJwtToken() ?? null;
    });
    return () => setAccessTokenProvider(null);
  }, [pool]);

  // Restore the session on load (refresh token lives in the SDK's storage).
  useEffect(() => {
    if (!pool) return;
    let cancelled = false;
    const user = pool.getCurrentUser();
    void getSession(user).then((session) => {
      if (cancelled) return;
      if (session && user) {
        setEmail(emailFromSession(session) ?? user.getUsername());
        setStatus('authed');
      } else {
        setStatus('anon');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pool]);

  const requirePool = useCallback((): CognitoUserPool => {
    if (!pool) throw new Error('Auth is not configured');
    return pool;
  }, [pool]);

  const signUp = useCallback(
    (address: string, password: string) =>
      new Promise<void>((resolve, reject) => {
        const attributes = [new CognitoUserAttribute({ Name: 'email', Value: address })];
        requirePool().signUp(address, password, attributes, [], (error) =>
          error ? reject(error) : resolve(),
        );
      }),
    [requirePool],
  );

  const confirmSignUp = useCallback(
    (address: string, code: string) =>
      new Promise<void>((resolve, reject) => {
        const user = new CognitoUser({ Username: address, Pool: requirePool() });
        user.confirmRegistration(code, true, (error) => (error ? reject(error) : resolve()));
      }),
    [requirePool],
  );

  const resendCode = useCallback(
    (address: string) =>
      new Promise<void>((resolve, reject) => {
        const user = new CognitoUser({ Username: address, Pool: requirePool() });
        user.resendConfirmationCode((error) => (error ? reject(error) : resolve()));
      }),
    [requirePool],
  );

  const signIn = useCallback(
    (address: string, password: string) =>
      new Promise<void>((resolve, reject) => {
        const user = new CognitoUser({ Username: address, Pool: requirePool() });
        user.authenticateUser(new AuthenticationDetails({ Username: address, Password: password }), {
          onSuccess: (session) => {
            setEmail(emailFromSession(session) ?? address);
            setStatus('authed');
            resolve();
          },
          onFailure: reject,
          // SRP only; no MFA or forced password change in the MVP pool.
          newPasswordRequired: () =>
            reject(Object.assign(new Error('Password change required'), { code: 'NewPasswordRequired' })),
        });
      }),
    [requirePool],
  );

  const signOut = useCallback(() => {
    pool?.getCurrentUser()?.signOut();
    setEmail(null);
    setStatus(pool ? 'anon' : 'unconfigured');
  }, [pool]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, email, signUp, confirmSignUp, resendCode, signIn, signOut }),
    [status, email, signUp, confirmSignUp, resendCode, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
