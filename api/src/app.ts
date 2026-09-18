import express from 'express';

/**
 * Builds the Express app without binding a port, so tests can mount it
 * and `index.ts` stays a thin bootstrap.
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  return app;
}
