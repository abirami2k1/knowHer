/**
 * The browser half of the daily nudge: asking permission, minting a push
 * subscription and handing its keys over. Everything here is about this one
 * browser — a yes on her phone says nothing about her laptop.
 */

export type NudgeBlocker =
  /** iOS only offers web push to an app installed on the home screen. */
  | 'install_first'
  /** She said no at the browser prompt; only she can undo that, in site settings. */
  | 'denied'
  /** This browser has no push at all (older iOS, some desktop setups). */
  | 'unsupported';

/** True when this browser can do web push at all. */
export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** True when the app is running as an installed app rather than a browser tab. */
export function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's own flag, which predates display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isApple(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Why the nudge cannot be offered here, or null when it can. The iOS case is
 * worth naming: on iPhone the toggle is not broken, the app just has to be on
 * the home screen first, and saying so saves her wondering.
 */
export function nudgeBlocker(): NudgeBlocker | null {
  if (pushSupported()) return Notification.permission === 'denied' ? 'denied' : null;
  return isApple() && !isInstalled() ? 'install_first' : 'unsupported';
}

/** The VAPID key arrives base64url; PushManager wants raw bytes. */
function toApplicationServerKey(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeKey(buffer: ArrayBuffer | null): string {
  if (!buffer) throw new Error('the browser minted a subscription with no keys');
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * The running service worker, or null when there is none. `navigator.serviceWorker.ready`
 * never settles if nothing is registered, which would hang the toggle rather than
 * disable it — so the registration is checked first.
 */
async function serviceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  if (!(await navigator.serviceWorker.getRegistration())) return null;
  return navigator.serviceWorker.ready;
}

export interface BrowserSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function describe(subscription: PushSubscription): BrowserSubscription {
  return {
    endpoint: subscription.endpoint,
    p256dh: encodeKey(subscription.getKey('p256dh')),
    auth: encodeKey(subscription.getKey('auth')),
  };
}

/** The subscription this browser already holds, if any. */
export async function currentSubscription(): Promise<BrowserSubscription | null> {
  const registration = await serviceWorker();
  const existing = await registration?.pushManager.getSubscription();
  return existing ? describe(existing) : null;
}

/**
 * Asks permission and mints a subscription. Returns null if she declines —
 * a decline is an answer, not an error, and nothing is sent to the API.
 */
export async function subscribeBrowser(publicKey: string): Promise<BrowserSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await serviceWorker();
  if (!registration) throw new Error('knowHer is not installed in this browser yet');
  const existing = await registration.pushManager.getSubscription();
  // A subscription minted against a rotated key cannot receive anything; start over.
  if (existing) await existing.unsubscribe();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toApplicationServerKey(publicKey),
  });
  return describe(subscription);
}

/** Tears down this browser's subscription. Safe to call when there is none. */
export async function unsubscribeBrowser(): Promise<void> {
  const registration = await serviceWorker();
  const existing = await registration?.pushManager.getSubscription();
  await existing?.unsubscribe();
}

/** The zone this device is in, so "20:00" keeps meaning 20:00 where she is. */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
