import { createApp } from './app';
import { CONFIG } from './config';
import { retryPendingDeletions } from './services/account';
import { liveSweepDeps, sendDueNudges } from './services/push';

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

/**
 * The daily nudge (Task 13). A minute sweep rather than a job framework: the
 * work is a handful of rows, and each device records the local date it was
 * nudged on, so a restart mid-sweep repeats nothing.
 *
 * Logged as counts only — which woman, on which device, at what hour is
 * exactly the kind of thing that must not sit in a log file.
 */
if (CONFIG.pushConfigured) {
  const sweep = () => {
    sendDueNudges(new Date(), liveSweepDeps())
      .then(({ sent, dropped, failed }) => {
        if (sent || dropped || failed)
          console.log(`nudge sweep: ${sent} sent, ${failed} failed, ${dropped} dropped`);
      })
      .catch((error: unknown) => {
        console.error('nudge sweep failed:', error instanceof Error ? error.name : 'unknown');
      });
  };
  setInterval(sweep, CONFIG.nudgeSweepMs).unref();
} else {
  console.log('nudge: VAPID keys not configured — the daily nudge is off');
}
