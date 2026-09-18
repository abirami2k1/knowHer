import type { User } from '../generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** The DB user for the verified Cognito token. Set by requireAuth; absent on public routes. */
      user?: User;
    }
  }
}
