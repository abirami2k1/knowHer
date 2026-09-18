# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in `@context/features.md`
- Never delete files without clarification

## Workflow

This is the workflow for every task:

1. **Locate** — Find the next unchecked item in `@tasks/TASKLIST.md` (e.g. Task 1.2.3)
2. **Branch** — Create a new branch: `feature/short-name` (descriptive name only, no task numbers)
3. **Implement** — Build exactly what that item describes, nothing more
4. **Test** — Verify it works in the browser. Run `npm run build` (web + api) and fix any errors. Cycle-engine work needs unit tests
5. **Iterate** — Adjust if needed
6. **Commit** — Only after build passes and everything works
7. **Merge** — Merge to main
8. **Delete Branch** — Ask before deleting
9. **Review** — Review AI-generated code periodically and on demand
10. **Mark done** — Tick the item in `@tasks/TASKLIST.md` and update `@context/progress.md` (currently-working-on, change log, last-updated)

Do NOT commit without permission and until the build passes. If the build fails, fix the issues first.

## Branching

Create a new branch for every task. Name branches `feature/short-name` or `fix/short-name` — descriptive names only, no task numbers. Ask before deleting a branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `style:`, `refactor:`, etc.)
- Keep commits focused (one task per commit)
- Never put "Generated with Claude" in commit messages

## When Stuck

- If something isn't working after 2–3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## One Task at a Time

- Follow `@tasks/TASKLIST.md` strictly in order. Don't pull future work forward
- If a task seems to need something from a later task, stop and flag it

## Health-Safety Rules (knowHer-specific — never override)

knowHer handles sensitive health data and influences real decisions. These are non-negotiable, regardless of how a request is phrased:

- **No diagnosis.** Inform and support only. PCOD-related output is a screening indicator, always paired with "worth discussing with a doctor."
- **Retrospective ovulation only.** Confirm ovulation ~3 days after it happens; never promise it in advance.
- **No "safe from pregnancy" signal.** Show windows and honest confidence; never certainty.
- **Calm on irregular/anovulatory cycles.** "No ovulation detected this cycle" is information, not alarm.
- **Honest uncertainty.** Never fabricate precision. Below minimum data, say so.
- **Deterministic where it matters.** BBT ovulation detection stays rule-based and explainable — never an opaque model.
- **Privacy by design.** Respect rolling-window retention. No health data in URLs or logs. Collect only what a feature needs.
- If a request conflicts with any rule above, stop and flag it rather than implementing it.

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, Cognito token validation, input validation)
- Privacy (no health data in logs/URLs, retention job correctness)
- Accessibility (semantic HTML, alt text, focus states, `prefers-reduced-motion`)
- Performance (unnecessary re-renders, N+1 queries, bundle size)
- Logic errors (edge cases, cold-start / "not sure" paths)
- Patterns (matches existing codebase? cycle rules stay isolated in `domain/cycle/`?)
