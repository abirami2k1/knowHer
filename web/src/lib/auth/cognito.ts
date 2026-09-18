import { CognitoUserPool } from 'amazon-cognito-identity-js';

/**
 * The Cognito user pool the app signs into. null when the env vars are missing,
 * so the app can render an honest "auth not configured" state instead of crashing.
 * See README "Auth: AWS Cognito user pool".
 */
export function createUserPool(): CognitoUserPool | null {
  const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (!UserPoolId || !ClientId) return null;
  return new CognitoUserPool({ UserPoolId, ClientId });
}

/**
 * Turns Cognito's error objects into one short, friendly sentence. Pool
 * misconfigurations are surfaced plainly — they're developer errors, not user errors.
 */
export function friendlyAuthError(error: unknown): string {
  const {
    code,
    name,
    message = '',
  } = (error as { code?: string; name?: string; message?: string }) ?? {};
  switch (code ?? name) {
    case 'NotAuthorizedException':
      if (message.includes('SECRET_HASH')) {
        return 'The Cognito app client has a client secret. Create a public (SPA) app client without one and update VITE_COGNITO_CLIENT_ID.';
      }
      if (message.includes('SignUp is not permitted')) {
        return 'Self sign-up is turned off for this Cognito user pool. Enable self-registration in the pool settings.';
      }
      return "That email and password don't match.";
    case 'UserNotFoundException':
      return "That email and password don't match.";
    case 'ResourceNotFoundException':
      return 'The Cognito user pool or app client in the env config does not exist. Check VITE_COGNITO_* values.';
    case 'UserNotConfirmedException':
      return 'Please confirm your email first — check your inbox for the code.';
    case 'UsernameExistsException':
      return 'An account with that email already exists. Try signing in.';
    case 'InvalidPasswordException':
      return 'Please choose a longer password with a mix of letters, numbers and symbols.';
    case 'CodeMismatchException':
      return "That code doesn't look right. Please check and try again.";
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one.';
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return 'Too many attempts — please wait a moment and try again.';
    case 'NetworkError':
      return "We couldn't reach the sign-in service. Check your connection.";
    default:
      return 'Something went wrong. Please try again.';
  }
}
