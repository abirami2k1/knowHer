import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Placeholders so the Cognito verifier can be *constructed* in unit tests. Tests only
    // ever send tokens the verifier rejects during parsing (no network, no real pool). The
    // real sign-up → login → /me path is verified against the dev pool, not here.
    env: {
      AWS_REGION: 'us-east-1',
      COGNITO_USER_POOL_ID: 'us-east-1_TESTPOOL00',
      COGNITO_CLIENT_ID: 'testclientid00000000000000',
    },
  },
});
