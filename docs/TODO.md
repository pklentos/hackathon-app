# Hackathon Project Hub — Implementation TODO

Work through these items in order. Keep each pull request small, independently testable, documented, and deployable.

## 1. Project initialization and “Hello World”

- [x] Initialize a React + TypeScript + Vite project with strict TypeScript settings.
- [x] Add a single responsive page that renders “Hello World”.
- [x] Add standard scripts for development, build, preview, lint, and type-check.
- [x] Add `.gitignore` and `.env.example`; ensure `.env` files and secrets are ignored.
- [x] Add a minimal README with prerequisites, installation, local development, and build commands.
- [x] Run the app locally and verify the production build succeeds.
- [ ] Configure a hosting project and deploy the Hello World build.
- [x] Record the deployment URL and deployment procedure in the README.
- [x] Security check: confirm the browser bundle and repository contain no credentials or service-role keys.

## 2. CI/CD foundation

- [x] Add a CI workflow that installs dependencies from the lockfile.
- [x] Add lint, type-check, and production-build jobs to CI.
- [x] Make CI run on pull requests and the default branch.
- [ ] Configure automatic preview deployments for pull requests.
- [ ] Configure production deployment from the default branch.
- [x] Document required CI and hosting configuration without recording secret values.
- [ ] Security check: use least-privilege deployment credentials and protect the production environment.
- [ ] Security check: enable dependency update alerts.
- [x] Security check: add a dependency audit to CI.

## 3. Basic UI with mocked data

### 3.1 App shell

- [x] Add a semantic page shell with header, main content, and app title.
- [x] Add a mocked current-participant name and current-project summary.
- [x] Add navigation actions for browsing projects and proposing a project.
- [x] Add responsive base styles for widths down to 320 px.
- [x] Add visible keyboard focus styles and a skip-to-content link.
- [x] Document the component and styling conventions.
- [x] Security check: render all mocked/user-facing strings as text, never raw HTML.

### 3.2 Mock project model and catalog

- [x] Define strict TypeScript types for participant, project, and membership view data.
- [x] Create local mock data containing open, full, joined, created, and organizer-seeded projects.
- [x] Build one project card showing title, truncated description, count, capacity, and status.
- [x] Add current-project and creator indicators to the card.
- [x] Render the full mocked catalog in a responsive card grid.
- [x] Sort mocked projects with open projects first, then newest first.
- [x] Add mocked loading, empty-catalog, and error states.
- [x] Document the mock-data shape and how to select each UI state.
- [x] Security check: avoid placing realistic personal data or tokens in fixtures.

### 3.3 Search and filters

- [x] Add case-insensitive search across mocked project titles and descriptions.
- [x] Add mutually exclusive Open, Full, and My project filters.
- [x] Make search and status filters compose correctly.
- [x] Add a reset control for search and filters.
- [x] Add a distinct no-results state.
- [x] Verify filtering updates without a page refresh.
- [x] Document catalog query behavior and default ordering.
- [x] Security check: treat search text as data and never interpolate it into HTML or executable expressions.

### 3.4 Mock project details

- [x] Add a project detail view opened from a card.
- [x] Show the full description, count, capacity, status, creator, creation time, and participant names.
- [x] Add mocked Join, Switch, Leave, Edit, and Delete controls in the appropriate states.
- [x] Ensure the detail view is keyboard accessible and works at 320 px.
- [x] Document the detail-view states.
- [x] Security check: do not infer authorization from hidden controls; mark them as UI-only until backend enforcement exists.

### 3.5 Mock forms and confirmations

- [x] Add a display-name entry form with trim and 1–40 character validation.
- [x] Add a project form with title, description, and team-capacity fields.
- [x] Add inline validation for all PRD limits.
- [x] Preserve entered values after a mocked recoverable error.
- [x] Add confirmation dialogs for switch, leave, and delete actions.
- [x] Include the affected participant count in delete confirmation.
- [x] Add success and error feedback that does not rely only on color.
- [x] Add the browser-scoped identity and public-display-name privacy notices.
- [x] Document every form rule and confirmation flow.
- [x] Security check: validate mocked inputs with the same constraints planned for the server.

## 4. Supabase foundation

### 4.1 Project configuration

- [ ] Create separate Supabase projects or environments for local/development and production.
- [ ] Add only the public Supabase URL and anonymous key to `.env.example`.
- [ ] Add a typed Supabase client module.
- [ ] Add a safe missing-configuration error state.
- [ ] Verify no service-role key is imported into client code.
- [ ] Document local Supabase setup, environment variables, and migration commands.
- [ ] Security check: confirm logs, errors, analytics, and URLs cannot expose participant tokens.

### 4.2 Database schema

- [ ] Add a migration for the `participants` table.
- [ ] Add a migration for the `projects` table.
- [ ] Add a migration for the `memberships` table.
- [ ] Add primary keys, foreign keys, timestamps, and cascade behavior.
- [ ] Add a unique constraint on `memberships.participant_id`.
- [ ] Add database checks for display-name, title, description, and capacity limits.
- [ ] Add indexes needed for project ordering, memberships, and creator lookups.
- [ ] Derive participant counts from membership rows rather than storing editable counts.
- [ ] Add a small organizer-seeded project migration or seed script.
- [ ] Document the schema, constraints, seed process, and rollback procedure.
- [ ] Security check: enable Row Level Security on every exposed table before connecting the UI.

### 4.3 Read-only catalog

- [ ] Add a safe read policy or read-only database view for active project catalog data.
- [ ] Include derived participant count and open/full status in the query result.
- [ ] Replace mocked catalog data with Supabase project data.
- [ ] Wire loading, empty, error, and retry states to the real query.
- [ ] Preserve the required default ordering.
- [ ] Keep search and filters client-side initially and verify them with real data.
- [ ] Document the read query and data mapping.
- [ ] Security check: ensure reads never return token hashes or other identity secrets.

## 5. Browser-scoped participant identity

- [ ] Generate a cryptographically random participant token with the Web Crypto API.
- [ ] Add a server-side participant-registration function that stores only a non-reversible token hash.
- [ ] Validate and normalize display names on the server.
- [ ] Persist the plaintext token only in browser storage.
- [ ] Restore the participant identity and display name after reload.
- [ ] Add a protected function for changing the display name without changing identity or membership.
- [ ] Show the identity-loss and public-profile notices during entry.
- [ ] Handle corrupt, missing, and rejected local identity data safely.
- [ ] Document the identity lifecycle, storage limitation, and recovery limitation.
- [ ] Security check: use constant-time-safe token verification where supported and never authorize by display name.
- [ ] Security check: redact the token from client/server logs and error reports.

## 6. Real project details

- [ ] Query a selected project's complete current details.
- [ ] Query and display participant names for that project.
- [ ] Replace mocked detail content with server data.
- [ ] Refresh details after relevant mutations.
- [ ] Handle deleted, missing, loading, and failed project states.
- [ ] Document the detail queries and user-visible failure states.
- [ ] Security check: expose only display names and membership data intended to be public to event participants.

## 7. Join one project

- [ ] Add a transactional server function for joining a project.
- [ ] Verify the participant token hash inside the function.
- [ ] Lock or otherwise serialize capacity-sensitive membership changes.
- [ ] Reject joins to full or deleted projects.
- [ ] Enforce one membership per participant in both constraints and server logic.
- [ ] Make repeated successful join requests idempotent.
- [ ] Connect the Join project button to the function.
- [ ] Show pending, success, full-project, and generic failure states.
- [ ] Refresh catalog, project details, and current membership after completion.
- [ ] Document the join contract, transaction behavior, and error codes.
- [ ] Security check: deny direct anonymous membership writes and ignore client-supplied participant IDs.

## 8. Leave the current project

- [ ] Add a token-authenticated server function for leaving the current project.
- [ ] Make the operation safe to repeat.
- [ ] Connect the Leave project confirmation to the function.
- [ ] Disable duplicate submissions while the request is pending.
- [ ] Refresh affected catalog and detail state after completion.
- [ ] Document leave behavior and failure recovery.
- [ ] Security check: ensure one participant cannot remove another participant's membership.

## 9. Atomically switch projects

- [ ] Add a transactional server function that switches membership.
- [ ] Check destination existence and capacity before removing the old membership.
- [ ] Preserve the original membership when any destination check or insert fails.
- [ ] Handle concurrent attempts for the destination's final seat.
- [ ] Connect the Switch to this project confirmation to the function.
- [ ] Show clear success and failure feedback.
- [ ] Document transaction boundaries, rollback behavior, and error codes.
- [ ] Security check: authenticate entirely from the token and reject client-selected source memberships.

## 10. Create a participant project

- [ ] Add a token-authenticated server function for project creation.
- [ ] Enforce all title, description, and capacity limits on the server.
- [ ] Mark participant-created projects as non-seeded and assign the verified creator.
- [ ] Do not automatically create a membership for the creator.
- [ ] Connect the real project form to the function.
- [ ] Preserve values and show field-level server errors after recoverable failures.
- [ ] Refresh the catalog and open the new project after success.
- [ ] Document creation behavior and organizer-seeded ownership differences.
- [ ] Security check: reject direct anonymous inserts and sanitize stored/displayed text by context.

## 11. Edit a participant project

- [ ] Add a token-authenticated server function for project edits.
- [ ] Verify creator ownership and reject seeded-project edits.
- [ ] Reuse server-side creation validation.
- [ ] Reject capacity reductions below current membership count.
- [ ] Connect creator-only Edit controls and prefill the form.
- [ ] Handle stale membership counts and authorization failures clearly.
- [ ] Document edit authorization and capacity rules.
- [ ] Security check: enforce ownership on the backend regardless of UI visibility.

## 12. Delete a participant project

- [ ] Add a transactional server function for project deletion.
- [ ] Verify creator ownership and reject seeded-project deletion.
- [ ] Atomically delete the project and all memberships.
- [ ] Connect the delete confirmation and display the latest affected-participant count.
- [ ] Return deleted-project participants to no current membership.
- [ ] Handle stale counts, repeated requests, and authorization failures.
- [ ] Document cascade behavior and the disruptive-deletion warning.
- [ ] Security check: require explicit confirmation in the UI and backend creator authorization.

## 13. Real-time synchronization

- [ ] Enable Supabase Realtime only for the required project and membership changes.
- [ ] Subscribe to project creation, edits, and deletion.
- [ ] Subscribe to membership changes that affect counts and participant lists.
- [ ] Reconcile events by stable IDs to prevent duplicate cards or participants.
- [ ] Re-fetch source-of-truth data after reconnecting.
- [ ] Keep last-known data visible and show a degraded-freshness indicator while disconnected.
- [ ] Notify an affected participant when their joined project is deleted.
- [ ] Clean up subscriptions when views unmount or identity changes.
- [ ] Document subscription scope, reconciliation, and reconnect behavior.
- [ ] Security check: verify Realtime publication and RLS expose only intended columns and rows.

## 14. Core automated testing

### 14.1 Unit and component tests

- [ ] Add the test runner, DOM testing utilities, and coverage reporting.
- [ ] Test all validation boundary values.
- [ ] Test project sorting, search, combined filters, reset, and no-results behavior.
- [ ] Test card and detail states for open, full, current, created, and seeded projects.
- [ ] Test confirmation dialogs, keyboard operation, and duplicate-submit prevention.
- [ ] Test identity restoration and corrupt local-storage handling.
- [ ] Document how to run focused and full unit test suites.
- [ ] Security test: verify token values never render in UI errors or snapshots.

### 14.2 Database and integration tests

- [ ] Add a repeatable local test database setup with migrations and seed data.
- [ ] Test all database constraints and server-side validation boundaries.
- [ ] Test unauthorized direct table mutations are rejected.
- [ ] Test join idempotency and the one-membership rule.
- [ ] Test concurrent joins for one remaining seat produce exactly one success.
- [ ] Test failed switching preserves the original membership.
- [ ] Test repeated leave requests are safe.
- [ ] Test creator-only edit/delete and seeded-project protection.
- [ ] Test capacity cannot be reduced below membership.
- [ ] Test deletion removes memberships atomically.
- [ ] Document integration-test isolation and cleanup.
- [ ] Security test: verify invalid, guessed, and another participant's tokens cannot mutate data.

### 14.3 End-to-end tests

- [ ] Add browser tests for first entry through catalog display.
- [ ] Test join, reload restoration, leave, and switch flows.
- [ ] Test create, edit, and delete flows.
- [ ] Test two browser contexts receive real-time updates.
- [ ] Test failed network requests preserve form values and recover without reload.
- [ ] Test core flows at 320 px and desktop widths.
- [ ] Test keyboard-only operation for entry, browsing, details, and forms.
- [ ] Add the stable end-to-end suite to CI.
- [ ] Document local and CI end-to-end test setup.
- [ ] Security test: ensure test artifacts, screenshots, traces, and logs redact participant tokens.

## 15. Accessibility, resilience, and performance

- [ ] Audit core flows against WCAG 2.1 AA.
- [ ] Fix semantic labels, dialog focus management, focus return, and error announcements.
- [ ] Verify sufficient contrast and non-color status cues.
- [ ] Test the latest two stable versions of Chrome, Safari, Firefox, and Edge.
- [ ] Add retry behavior for recoverable reads and clear recovery actions for mutations.
- [ ] Measure catalog usability with up to 200 projects and optimize if it exceeds 2 seconds.
- [ ] Measure mutation and real-time update latency against the 2-second targets.
- [ ] Document accessibility support, browser support, and known limitations.
- [ ] Security check: audit dependencies, browser headers, error leakage, and production source-map policy.

## 16. Production readiness

- [ ] Review every acceptance criterion in the PRD and link it to a passing test or manual check.
- [ ] Run lint, type-check, unit, integration, end-to-end, accessibility, and production-build checks.
- [ ] Verify migrations and organizer seed instructions in a clean production-like environment.
- [ ] Add production monitoring for failed reads, mutations, and real-time disconnects without sensitive payloads.
- [ ] Add a rollback procedure for frontend releases and database migrations.
- [ ] Add an organizer runbook for seeding, correcting, archiving, and deleting event data.
- [ ] Add a privacy notice covering visible names, memberships, browser identity, and retention.
- [ ] Resolve or explicitly defer the PRD's starter-data and branding questions.
- [ ] Perform a final least-privilege review of RLS, functions, Realtime, and deployment credentials.
- [ ] Perform a final secret scan of the repository, build output, logs, and deployment configuration.
- [ ] Update the README with the final architecture, setup, test, deploy, security, and operational instructions.
- [ ] Deploy to production and complete a two-browser smoke test.
