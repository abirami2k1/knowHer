import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { CONFIG } from '../config';

/**
 * The three Cognito admin actions account deletion needs (D8). An interface so
 * the ordering in services/account.ts can be tested without AWS.
 */
export interface IdentityAdmin {
  disable(cognitoSub: string): Promise<void>;
  enable(cognitoSub: string): Promise<void>;
  remove(cognitoSub: string): Promise<void>;
}

let client: CognitoIdentityProviderClient | undefined;

/**
 * The real one. Credentials come from the standard AWS chain — env vars locally,
 * the EC2 instance role in production — and need `cognito-idp:AdminDisableUser`,
 * `AdminEnableUser` and `AdminDeleteUser` on the pool. Never hard-coded.
 *
 * The pool signs users in by email, so each user's Cognito username is their
 * `sub`, which is what we hold.
 */
export function cognitoAdmin(): IdentityAdmin {
  const { region, userPoolId } = CONFIG.cognito;
  const cognito = (client ??= new CognitoIdentityProviderClient({ region }));
  const target = (sub: string) => ({ UserPoolId: userPoolId, Username: sub });

  return {
    disable: async (sub) => {
      await cognito.send(new AdminDisableUserCommand(target(sub)));
    },
    enable: async (sub) => {
      await cognito.send(new AdminEnableUserCommand(target(sub)));
    },
    remove: async (sub) => {
      try {
        await cognito.send(new AdminDeleteUserCommand(target(sub)));
      } catch (error) {
        // Already gone is the outcome we wanted — a retry after a lost response lands here.
        if (!(error instanceof UserNotFoundException)) throw error;
      }
    },
  };
}
