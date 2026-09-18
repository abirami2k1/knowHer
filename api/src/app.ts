import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { CONFIG } from './config';
import { fail } from './lib/respond';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health';
import { meRouter } from './routes/me';

/**
 * Builds the Express app without binding a port, so tests can mount it
 * and `index.ts` stays a thin bootstrap.
 *
 * Middleware order matters: security headers → CORS → rate limit → body parsing
 * → routes → 404 → error envelope.
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  // Array form: a request from any other origin gets NO CORS headers at all.
  app.use(cors({ origin: [CONFIG.webOrigin] }));
  app.use(
    rateLimit({
      windowMs: CONFIG.rateLimit.windowMs,
      limit: CONFIG.rateLimit.limit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, res) => {
        fail(res, 429, 'rate_limited', 'Too many requests — please slow down');
      },
    }),
  );
  app.use(express.json({ limit: CONFIG.jsonBodyLimit }));

  app.use(healthRouter);
  app.use(meRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
