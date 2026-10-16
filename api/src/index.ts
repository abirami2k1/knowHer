import { createApp } from './app';
import { CONFIG } from './config';
import { retryPendingDeletions } from './services/account';

const DAY_MS = 24 * 60 * 60 * 1000;

createApp().listen(CONFIG.port, () => {
  console.log(`knowHer API listening on http://localhost:${CONFIG.port}`);
});

/**
 * D8: finish Cognito deletions that failed after an account's data was already
 * removed. On boot and daily — no job framework needed. A failure here is logged
 * (no identifiers) and never takes the API down.
 */
function retryDeletions() {
  retryPendingDeletions().catch((error: unknown) => {
    console.error(
      'cognito deletion retry failed:',
      error instanceof Error ? error.name : 'unknown',
    );
  });
}
retryDeletions();
setInterval(retryDeletions, DAY_MS).unref();
