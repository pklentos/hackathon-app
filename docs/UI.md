# Mock UI guide

## Conventions

- `App.tsx` owns the mock experience and its temporary interaction state.
- Repeated catalog UI is split into small typed components; shared project
  types, fixtures, and derived-state helpers live in `mockData.ts`.
- CSS uses descriptive classes, a mobile-first minimum width of 320 px, and
  breakpoints only where the content requires them.
- Interactive controls use native buttons, links, fields, and form semantics.
  All user-facing values are rendered as React text and never as raw HTML.
- Purple identifies primary actions, while status messages include text or an
  icon so meaning does not depend on color.

## Mock data

`Participant` contains an ID and public display name. `Project` contains its
creator, organizer-seeded flag, timestamps, capacity, and a list of typed
`Membership` records. Counts and open/full status are derived from memberships.

The fixtures cover:

- a project joined and created by the current participant;
- an open organizer-seeded project;
- a full participant-created project; and
- an empty organizer-seeded project.

Fixture names are fictional and contain no credentials or realistic personal
data.

## Catalog states and ordering

The normal catalog is available at `/`. To preview non-ready states, use:

- `/?state=loading`
- `/?state=empty`
- `/?state=error`

Search is case-insensitive across title and description. Status filters are
mutually exclusive and compose with search. Open projects sort before full
projects; each group sorts newest first. A query with no matches has a separate
no-results state.

## Forms and confirmations

Display names are trimmed and validated at 1–40 characters. Project title,
description, and capacity use the PRD limits of 3–80 characters, 20–2,000
characters, and an integer from 1–20. A valid project submission intentionally
returns a mocked recoverable error to demonstrate that entered values remain.

Switch, leave, and delete actions require confirmation. Delete confirmation
states the affected participant count. These actions and edit controls are
explicitly UI-only; authorization and mutations must be enforced by the future
backend.
