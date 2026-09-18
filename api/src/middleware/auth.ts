import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { RequestHandler } from 'express';
import { CONFIG } from '../config';
import { AppError } from '../lib/errors';
import { findOrCreateUserByCognitoSub } from '../services/users';

type AccessTokenVerifier = ReturnType<typeof createVerifier>;

function createVerifier() {
  const { userPoolId, clientId } = CONFIG.cognito;
  // Verifies signature (JWKS, cached), issuer, expiry, token_use and client_id.
  return CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: 'access' });
}

let verifier: AccessTokenVerifier | undefined;

/** Built on first use so the app boots (and /health works) without Cognito env. */
function getVerifier(): AccessTokenVerifier {
  verifier ??= createVerifier();
  return verifier;
}

function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token, ...rest] = header.split(' ');
  if (scheme !== 'Bearer' || !token || rest.length > 0) return null;
  return token;
}

const UNAUTHORIZED = () => new AppError(401, 'unauthorized', 'Please sign in to continue');

/**
 * Guard for protected routes. Verifies the Cognito access token, then attaches
 * the DB user (created on first sight, keyed by the token's `sub`) as req.user.
 * The client never supplies a user id — identity comes only from the verified token.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = bearerToken(req.header('authorization'));
  if (!token) {
    next(UNAUTHORIZED());
    return;
  }

  let sub: string;
  try {
    ({ sub } = await getVerifier().verify(token));
  } catch {
    // Any verification failure (malformed, expired, wrong pool/client, bad signature) → 401.
    // Deliberately not logged with the token.
    next(UNAUTHORIZED());
    return;
  }

  try {
    req.user = await findOrCreateUserByCognitoSub(sub);
    next();
  } catch (error) {
    next(error);
  }
};
