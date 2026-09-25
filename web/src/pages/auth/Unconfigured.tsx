import { Card } from '@/components/ui/Card';

/** Shown instead of the auth forms when the Cognito env vars are missing. Never fakes a login. */
export function Unconfigured() {
  return (
    <Card as="div" className="p-5">
      <div role="alert">
        <h2 className="font-display text-title text-ink">Sign-in isn’t set up yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This build has no Cognito user pool configured. Set the <code>VITE_COGNITO_*</code> values
          in <code>web/.env.local</code> (see the README) and restart the dev server.
        </p>
      </div>
    </Card>
  );
}
