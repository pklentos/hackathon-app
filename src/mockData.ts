export type Participant = {
  id: string
  displayName: string
}

export type Membership = {
  participantId: Participant['id']
  joinedAt: string
}

export type Project = {
  id: string
  title: string
  description: string
  capacity: number
  creatorId: Participant['id'] | null
  isSeeded: boolean
  createdAt: string
  memberships: Membership[]
}

export type CatalogState = 'ready' | 'loading' | 'empty' | 'error'
export type ProjectFilter = 'all' | 'open' | 'full' | 'mine'

export const currentParticipant: Participant = {
  id: 'participant-riley',
  displayName: 'Riley Chen',
}

export const participants: Participant[] = [
  currentParticipant,
  { id: 'participant-avery', displayName: 'Avery Singh' },
  { id: 'participant-jordan', displayName: 'Jordan Lee' },
  { id: 'participant-morgan', displayName: 'Morgan Diaz' },
  { id: 'participant-sam', displayName: 'Sam Okafor' },
]

export const mockProjects: Project[] = [
  {
    id: 'project-accessible-maps',
    title: 'Accessible City Maps',
    description:
      'Turn city accessibility reports into practical, community-verified routes for wheelchair users and anyone who benefits from step-free navigation.',
    capacity: 4,
    creatorId: 'participant-riley',
    isSeeded: false,
    createdAt: '2026-09-05T19:30:00.000Z',
    memberships: [
      { participantId: 'participant-riley', joinedAt: '2026-09-05T19:34:00.000Z' },
      { participantId: 'participant-avery', joinedAt: '2026-09-05T19:42:00.000Z' },
    ],
  },
  {
    id: 'project-food-loop',
    title: 'Food Loop',
    description:
      'Match event kitchens with nearby community fridges so safe surplus meals can be claimed before they become waste.',
    capacity: 3,
    creatorId: null,
    isSeeded: true,
    createdAt: '2026-09-05T18:15:00.000Z',
    memberships: [
      { participantId: 'participant-jordan', joinedAt: '2026-09-05T18:30:00.000Z' },
    ],
  },
  {
    id: 'project-calm-queue',
    title: 'Calm Queue',
    description:
      'A low-stimulation virtual queue that replaces crowded waiting areas with clear timing and optional quiet-space alerts.',
    capacity: 2,
    creatorId: 'participant-morgan',
    isSeeded: false,
    createdAt: '2026-09-05T17:45:00.000Z',
    memberships: [
      { participantId: 'participant-morgan', joinedAt: '2026-09-05T17:50:00.000Z' },
      { participantId: 'participant-sam', joinedAt: '2026-09-05T17:55:00.000Z' },
    ],
  },
  {
    id: 'project-water-watch',
    title: 'Water Watch',
    description:
      'Make public water-quality readings understandable through neighborhood alerts, plain-language summaries, and historical trends.',
    capacity: 5,
    creatorId: null,
    isSeeded: true,
    createdAt: '2026-09-04T21:10:00.000Z',
    memberships: [],
  },
]

export function getParticipantName(id: string | null) {
  if (id === null) return 'Hackathon organizers'
  return participants.find((participant) => participant.id === id)?.displayName ?? 'Unknown participant'
}

export function isProjectFull(project: Project) {
  return project.memberships.length >= project.capacity
}

export function isCurrentProject(project: Project) {
  return project.memberships.some(
    (membership) => membership.participantId === currentParticipant.id,
  )
}
