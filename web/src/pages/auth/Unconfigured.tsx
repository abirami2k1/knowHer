/** Shown instead of the auth forms when the Cognito env vars are missing. Never fakes a login. */
export function Unconfigured() {
  return (
    <div role="alert" className="rounded-card bg-white p-4 ring-1 ring-primary/10">
      <h2 className="font-medium">Sign-in isn’t set up yet</h2>
      <p className="mt-1 text-sm text-muted">
        This build has no Cognito user pool configured. Set the <code>VITE_COGNITO_*</code> values
        in <code>web/.env.local</code> (see the README) and restart the dev server.
      </p>
    </div>
  );
}
