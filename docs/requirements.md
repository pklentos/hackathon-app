# Hackathon Project Hub — Product Requirements Document

## 1. Product summary

Hackathon Project Hub is a responsive web app that helps hackathon participants discover coding projects, see team availability, join one project, and propose ideas of their own. It replaces fragmented coordination in chat threads and spreadsheets with a shared, real-time project catalog.

The first version uses name-only entry and a device-scoped browser token instead of account authentication. Data is shared through Supabase and membership changes appear in real time.

## 2. Problem

During hackathons, participants often struggle to:

- Find active project ideas in one place.
- Understand what each project is trying to build.
- See which teams have room for another participant.
- Join, leave, or switch teams without manual coordination.
- Share a new idea so others can discover and join it.

This friction slows team formation and can leave projects understaffed or participants unsure where to contribute.

## 3. Goals

- Make available projects easy to scan and compare.
- Let a participant join or leave a project in a few interactions.
- Enforce membership in no more than one project at a time.
- Keep participant counts and capacity status current across clients.
- Let participants propose and manage their own project ideas.
- Provide a usable experience on desktop and mobile browsers.

## 4. Non-goals

The first version will not include:

- Passwords, social login, or verified user accounts.
- Team chat, direct messaging, or notifications.
- Organizer dashboards or moderation workflows.
- Join approvals or invitations.
- Skill-based recommendations or matchmaking.
- Multiple simultaneous hackathons.
- Project submissions, judging, voting, or prizes.
- File uploads, images, repositories, or external project links.

## 5. Target users

### Primary user: hackathon participant

A participant wants to browse ideas, choose one project to work on, leave or switch projects, or publish an idea and attract teammates.

### Assumptions

- The app serves one hackathon event.
- Organizers seed the initial project catalog before participants arrive.
- Participants join openly until a creator-defined team capacity is reached.
- A participant's identity and ownership are scoped to one browser profile. Clearing browser storage or changing devices creates a new identity.

## 6. Product principles

- **Fast entry:** A name is all that is required to begin.
- **Visible availability:** Team size and open/full status are clear before joining.
- **Safe switching:** A failed switch must not remove a participant from their current project.
- **Simple scope:** Team formation is the focus; broader hackathon management is excluded.

## 7. User journeys

### 7.1 Enter the app

1. A first-time visitor sees a name-entry screen.
2. The visitor enters a non-empty display name and continues.
3. The app creates a random device-scoped participant token and stores it in the browser.
4. The participant reaches the project catalog.
5. A returning participant on the same browser resumes their identity and current selection.

### 7.2 Browse and inspect projects

1. The participant sees seeded and participant-created projects as cards.
2. Each card shows the title, a short description, participant count, capacity, and open/full status.
3. The participant can search project titles and descriptions or filter the catalog by **Open**, **Full**, or **My project**.
4. The participant opens a card to view full details and the participant names.

### 7.3 Join a project

1. A participant with no current project selects **Join project**.
2. The server verifies that the project has capacity and the participant has no other membership.
3. The participant is added and all connected clients receive an updated count.
4. The joined project is clearly identified as the participant's current project.

### 7.4 Switch projects

1. A participant with a current project selects **Switch to this project** on another project.
2. The app explains that switching will leave the current project and asks for confirmation.
3. The server atomically checks the destination's capacity, leaves the old project, and joins the new project.
4. If the destination is full or the operation fails, the participant remains in the original project.

### 7.5 Give up a selection

1. The participant opens their current project and selects **Leave project**.
2. The app asks for confirmation.
3. The membership is removed and capacity updates in real time.

### 7.6 Propose a project

1. The participant selects **Propose project**.
2. They enter a title, description, and maximum team size.
3. After validation, the project is published to the catalog as open.
4. Creating a project does not automatically join it; the creator may join it through the normal join flow.

### 7.7 Manage a proposed project

1. On a project created from the current browser identity, the creator sees edit and delete controls.
2. The creator may edit its title, description, and maximum team size.
3. Capacity cannot be reduced below the current participant count.
4. The creator may delete the project after confirming that all current memberships will also be removed.
5. Deleted-project participants return to having no current project.

## 8. Functional requirements

### FR-1: Participant entry and identity

- The app must require a display name before showing the catalog.
- Display names must be trimmed and contain 1–40 characters.
- Names do not need to be unique.
- On first entry, the app must generate a cryptographically random participant token and store it locally.
- The backend must store only a non-reversible hash of the token.
- Returning users on the same browser must retain their display name, ownership, and membership.
- The participant must be able to change their display name without changing identity or membership.
- The UI must explain that identity is tied to the current browser and is not recoverable after local data is cleared.

### FR-2: Project catalog

- The catalog must display all active projects as responsive cards.
- Each card must show:
  - Project title.
  - Truncated description.
  - Current participant count and maximum team size.
  - Open or full status.
  - An indicator when it is the participant's current project.
  - An indicator when it was created by the participant.
- Seeded and participant-created projects must appear in the same catalog.
- The catalog must provide case-insensitive text search across project titles and descriptions.
- The catalog must provide mutually exclusive status filters:
  - **Open:** Projects with available capacity.
  - **Full:** Projects at capacity.
  - **My project:** The project the current participant has joined; empty when they have no membership.
- Search and status filters must work together and update the visible cards without a page refresh.
- The UI must provide a clear way to reset search and filters.
- When search or filters produce no matches, the catalog must show a distinct no-results state rather than the global empty-catalog state.
- The initial default ordering must show open projects before full projects, then newest projects first.
- The catalog must include loading, empty, and error states.

### FR-3: Project details

- A participant must be able to open a project detail view from its card.
- The detail view must show the full description, current count, capacity, status, creator display name, creation time, and participant display names.
- Membership and creator controls must reflect the latest server state.

### FR-4: Join a project

- A participant may belong to at most one project.
- A participant with no membership may join any project with available capacity.
- Joining must be enforced by the backend, not only by the client.
- Joining a full or deleted project must fail with a clear message.
- Repeating a successful join request must not create duplicate membership.

### FR-5: Switch projects

- A participant who already belongs to a project must be offered a switch action instead of a second join action.
- Switching requires confirmation.
- The backend must perform the leave-and-join operation atomically.
- If the destination cannot be joined, the original membership must remain unchanged.

### FR-6: Leave a project

- A participant may leave their current project after confirmation.
- Leaving must be safe to repeat and must not affect other participants.
- Updated availability must be broadcast to connected clients.

### FR-7: Create a project

- Any entered participant may create a project.
- Required fields are:
  - Title: 3–80 characters.
  - Description: 20–2,000 characters.
  - Maximum team size: integer from 1–20.
- The app must validate fields inline and prevent invalid submission.
- A newly created project must appear in the shared catalog without requiring a page refresh.
- The creator is not automatically enrolled as a participant.

### FR-8: Edit and delete a project

- Only the browser identity that created a participant-proposed project may edit or delete it.
- Organizer-seeded projects cannot be edited or deleted through the participant app.
- Edits must use the same validation rules as creation.
- Maximum team size cannot be set below current membership.
- Deletion requires a confirmation that states how many participants will be removed from the project.
- Deleting a project must atomically delete the project and all of its memberships.
- Every participant removed by project deletion must return to having no current project.
- Connected affected participants must receive clear feedback that the project was deleted by its creator.
- Unauthorized requests must be rejected by the backend even if client controls are bypassed.

### FR-9: Real-time updates

- Project creation, edits, deletion, participant counts, capacity status, and participant lists must update across connected clients in real time.
- The app must reconcile real-time events with server state and avoid duplicate cards or participants.
- If the real-time connection is interrupted, the app must continue to show the last known state, indicate degraded freshness, and resynchronize after reconnection.

### FR-10: Seed data

- Organizers must be able to populate starter projects directly in Supabase before the event.
- Seeded projects must support title, description, capacity, and creation time.
- Seed records must be marked as organizer-owned so participant edit and delete controls are unavailable.

## 9. Business rules

1. One participant identity can have zero or one active project membership.
2. A project is **open** when participant count is less than maximum team size.
3. A project is **full** when participant count equals maximum team size.
4. Participant count is derived from membership records and is not independently editable.
5. Capacity checks, one-project membership, switching, and creator authorization are server-enforced.
6. Identical display names are allowed and represent distinct browser identities.
7. A project creator has no reserved seat and must join under the same capacity rules as everyone else.
8. Concurrent attempts for the final seat result in exactly one successful join.
9. Deleting a project releases all of its participants from their memberships.
10. Deleted projects must not remain visible or joinable.
11. One browser profile represents one participant; switching between multiple local participant identities is not supported.

## 10. UX requirements

- The interface must work at widths from 320 px through large desktop screens.
- Primary actions must have clear labels: **Join project**, **Switch to this project**, **Leave project**, and **Propose project**.
- Destructive or membership-changing actions must require confirmation.
- Full projects must remain discoverable but their join action must be disabled.
- The participant's current project must be visually prominent.
- Forms must preserve entered values after recoverable submission errors.
- Success and failure feedback must be visible and understandable without relying only on color.
- Keyboard navigation, visible focus states, semantic labels, and sufficient color contrast are required.

## 11. Data model

### Participant

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Server-generated primary key |
| `display_name` | String | 1–40 characters |
| `token_hash` | String | Hash of browser-held secret; never returned |
| `created_at` | Timestamp | Server-generated |
| `updated_at` | Timestamp | Server-generated |

### Project

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Server-generated primary key |
| `title` | String | 3–80 characters |
| `description` | String | 20–2,000 characters |
| `max_participants` | Integer | 1–20 |
| `creator_participant_id` | UUID or null | Null for organizer-seeded projects |
| `is_seeded` | Boolean | Protects organizer projects |
| `created_at` | Timestamp | Server-generated |
| `updated_at` | Timestamp | Server-generated |

### Membership

| Field | Type | Notes |
| --- | --- | --- |
| `participant_id` | UUID | Unique to enforce one project per participant |
| `project_id` | UUID | References the joined project |
| `joined_at` | Timestamp | Server-generated |

## 12. Technical requirements

- **Frontend:** React, TypeScript, and Vite.
- **Backend:** Supabase Postgres and Supabase Realtime.
- Database constraints must enforce referential integrity and one membership per participant.
- Join, switch, and project deletion operations must use transactional database functions or equivalent server-side logic to prevent race conditions, over-capacity teams, or partial deletion.
- Direct anonymous table writes must be denied. Identity-sensitive writes must go through protected Supabase functions or Edge Functions that verify the browser token against its stored hash.
- Row Level Security must restrict participant-proposed project edits and deletion to the creator identity.
- The browser token must not be logged, included in URLs, or stored in plaintext by the backend.
- Client environment variables may contain only public Supabase configuration; service-role keys must never be shipped to the browser.
- The frontend must use strict TypeScript settings.

## 13. Non-functional requirements

### Performance

- The catalog should become usable within 2 seconds on a typical broadband connection for up to 200 projects.
- Join, leave, switch, and create actions should acknowledge success or failure within 2 seconds under normal conditions.
- Real-time changes should appear on other connected clients within 2 seconds under normal conditions.

### Reliability and integrity

- Membership and capacity rules must remain correct under concurrent requests.
- Mutations must be idempotent where practical.
- The UI must recover from network errors without requiring a full reload.

### Accessibility

- Target WCAG 2.1 AA for core entry, browsing, project detail, and project form flows.
- All functionality must be keyboard accessible.

### Browser support

- Support the latest two stable versions of Chrome, Safari, Firefox, and Edge.

### Privacy

- Collect only display name and app activity required for team formation.
- Do not expose participant tokens or token hashes.
- Show a brief notice that display names and team membership are visible to other participants.
- Event data is retained after the hackathon until an organizer manually archives or deletes it in Supabase.
- The first version does not automatically expire or delete event data.

## 14. Acceptance criteria

The first version is ready when:

1. A new visitor can enter a valid name and reach the catalog.
2. Seeded projects are displayed as cards with accurate counts and capacity.
3. A participant can inspect full project details and participant names.
4. A participant can join one open project but cannot join a second simultaneously.
5. Two concurrent users competing for one remaining seat cannot overfill a project.
6. A participant can atomically switch projects; a failed switch preserves the original membership.
7. A participant can leave their current project.
8. A participant can create a valid project with a creator-defined capacity.
9. Only the creating browser identity can edit or delete that participant-created project.
10. Capacity cannot be reduced below current membership.
11. Deleting a project with participants removes all associated memberships atomically and informs affected connected participants.
12. Text search and the Open, Full, and My Project filters return the correct projects and can be reset.
13. Membership and project changes appear on a second connected client without refresh.
14. Reloading the same browser restores the participant's identity and current membership.
15. Core flows are usable at 320 px width and by keyboard.
16. Backend rules reject unauthorized or invalid mutations attempted outside the UI.

## 15. Success metrics

For a pilot hackathon, measure:

- Percentage of entered participants who join or create a project.
- Median time from name entry to first successful project join.
- Percentage of projects that reach at least two participants.
- Number and rate of failed joins caused by stale capacity.
- Number of support requests related to finding or switching teams.

Initial targets should be set after a baseline event or usability test.

## 16. Risks and mitigations

- **Identity loss:** Clearing storage or changing browsers loses ownership and membership access. Explain this limitation at entry and before project creation.
- **Name impersonation:** Names are not identity credentials. Use the browser token—not display-name matching—for all authorization.
- **Shared-device confusion:** A browser profile represents one participant. Provide a visible name and current-project indicator; multi-user sign-out is outside the first version.
- **Concurrent joins:** Client-only counts can become stale. Enforce capacity in a transactional server operation.
- **Disruptive project deletion:** A creator can release an entire team by deleting a project. Show the affected participant count, require explicit confirmation, perform deletion atomically, and immediately inform connected participants.
- **Inappropriate content:** The first version has no moderation tools. Organizers must manage records directly in Supabase and establish event conduct expectations.
- **Real-time interruption:** Indicate stale state and resynchronize from the source of truth after reconnection.

## 17. Open questions

- What starter projects and default capacities will organizers seed?
- What event-specific branding, name, and visual style should the app use?
- Should a later version add account authentication to support identity recovery across devices?
- Should organizers receive an in-app moderation and project-management interface?
