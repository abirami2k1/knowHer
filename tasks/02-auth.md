# Task 3 — Authentication (AWS Cognito)

**Goal:** users can sign up, log in, log out; protected API + protected routes.

## Task 3.1 Cognito wiring
- Configure a Cognito user pool (email + password). Env placeholders documented in `.env.example`.
- `/api`: middleware that verifies Cognito JWT on protected routes; derive userId from token (never trust client).

## Task 3.2 User provisioning
- On first authenticated request, upsert a `User` row keyed by `cognitoSub`.

## Task 3.3 Frontend auth
- Sign up, log in, log out UI (warm, on-brand, mobile-first).
- Auth state in a context/hook; attach token to the API client.
- Route guard: unauthenticated users → login; authenticated → app shell.

## Task 3.4 Endpoint
- `GET /me` → current user profile (creates row if missing).

## Acceptance
- Full sign up → log in → see guarded Home → log out flow works. `GET /me` returns the user. Protected routes reject missing/invalid tokens.
