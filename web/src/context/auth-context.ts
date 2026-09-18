import { createContext } from 'react';

export type AuthStatus = 'loading' | 'unconfigured' | 'anon' | 'authed';

export interface AuthContextValue {
  status: AuthStatus;
  /** Email of the signed-in user (from Cognito), for display only. */
  email: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

/** Context object lives apart from the provider so fast refresh works (react-refresh rule). */
export const AuthContext = createContext<AuthContextValue | null>(null);
