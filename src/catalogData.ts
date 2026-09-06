import { getSupabaseClient, isSupabaseConfigured, SupabaseConfigurationError } from './supabase'
import { mockProjects, Project } from './mockData'

/**
 * Catalog project with computed fields from the database view
 */
export type CatalogProject = {
  id: string
  title: string
  description: string
  capacity: number
  creator_id: string | null
  is_seeded: boolean
  created_at: string
  updated_at: string
  member_count: number
  status: 'open' | 'full'
  participants: Array<{
    id: string
    display_name: string
    joined_at: string
  }>
}

/**
 * Transform a catalog project from Supabase to the app's Project type
 */
function transformCatalogProject(catalogProject: CatalogProject): Project {
  return {
    id: catalogProject.id,
    title: catalogProject.title,
    description: catalogProject.description,
    capacity: catalogProject.capacity,
    creatorId: catalogProject.creator_id,
    isSeeded: catalogProject.is_seeded,
    createdAt: catalogProject.created_at,
    memberships: catalogProject.participants.map((p) => ({
      participantId: p.id,
      joinedAt: p.joined_at,
    })),
  }
}

/**
 * Fetch all projects from the catalog with their participants
 */
export async function fetchCatalogProjects(): Promise<Project[]> {
  // If Supabase is not configured, return mock data
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using mock data.')
    return mockProjects
  }

  try {
    const supabase = getSupabaseClient()

    // Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }) as {
        data: Array<{
          id: string
          title: string
          description: string
          capacity: number
          creator_id: string | null
          is_seeded: boolean
          created_at: string
          updated_at: string
        }> | null
        error: Error | null
      }

    if (projectsError) {
      console.error('Failed to fetch projects:', projectsError)
      throw new Error(`Failed to fetch projects: ${projectsError.message}`)
    }

    if (!projects || projects.length === 0) {
      return []
    }

    // Fetch all memberships with participant details
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select(`
        participant_id,
        project_id,
        joined_at,
        participants:participant_id (
          id,
          display_name
        )
      `) as { 
        data: Array<{
          participant_id: string
          project_id: string
          joined_at: string
          participants: { id: string; display_name: string } | null
        }> | null
        error: Error | null
      }

    if (membershipsError) {
      console.error('Failed to fetch memberships:', membershipsError)
      throw new Error(`Failed to fetch memberships: ${membershipsError.message}`)
    }

    // Build a map of project_id -> participants
    const projectParticipants = new Map<string, Array<{
      id: string
      display_name: string
      joined_at: string
    }>>()

    if (memberships) {
      for (const membership of memberships) {
        const projectId = membership.project_id
        if (!projectParticipants.has(projectId)) {
          projectParticipants.set(projectId, [])
        }
        
        const participant = membership.participants
        if (participant) {
          projectParticipants.get(projectId)!.push({
            id: participant.id,
            display_name: participant.display_name,
            joined_at: membership.joined_at,
          })
        }
      }
    }

    // Transform projects with their participants
    const catalogProjects: CatalogProject[] = projects.map((project) => {
      const participants = projectParticipants.get(project.id) || []
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        capacity: project.capacity,
        creator_id: project.creator_id,
        is_seeded: project.is_seeded,
        created_at: project.created_at,
        updated_at: project.updated_at,
        member_count: participants.length,
        status: participants.length >= project.capacity ? 'full' : 'open',
        participants,
      }
    })

    return catalogProjects.map(transformCatalogProject)
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      console.warn('Supabase configuration error. Using mock data.', error)
      return mockProjects
    }
    throw error
  }
}

/**
 * Fetch a participant's display name by ID
 */
export async function fetchParticipantName(participantId: string | null): Promise<string> {
  if (participantId === null) {
    return 'Hackathon organizers'
  }

  // If Supabase is not configured, try mock data
  if (!isSupabaseConfigured()) {
    const mockParticipant = mockProjects
      .flatMap(p => p.memberships)
      .find(m => m.participantId === participantId)
    return mockParticipant ? `Participant ${participantId.slice(0, 8)}` : 'Unknown participant'
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('participants')
      .select('display_name')
      .eq('id', participantId)
      .single() as { data: { display_name: string } | null; error: Error | null }

    if (error || !data) {
      console.warn(`Failed to fetch participant ${participantId}:`, error)
      return 'Unknown participant'
    }

    return data.display_name
  } catch (error) {
    console.error('Error fetching participant name:', error)
    return 'Unknown participant'
  }
}

/**
 * Build a map of participant IDs to display names for efficient lookups
 */
export async function buildParticipantMap(projects: Project[]): Promise<Map<string, string>> {
  const participantIds = new Set<string>()
  
  // Collect all unique participant IDs
  for (const project of projects) {
    if (project.creatorId) {
      participantIds.add(project.creatorId)
    }
    for (const membership of project.memberships) {
      participantIds.add(membership.participantId)
    }
  }

  // If Supabase is not configured, return empty map (will use mock data lookups)
  if (!isSupabaseConfigured() || participantIds.size === 0) {
    return new Map()
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('participants')
      .select('id, display_name')
      .in('id', Array.from(participantIds)) as { 
        data: Array<{ id: string; display_name: string }> | null
        error: Error | null
      }

    if (error || !data) {
      console.warn('Failed to fetch participants:', error)
      return new Map()
    }

    return new Map(data.map(p => [p.id, p.display_name]))
  } catch (error) {
    console.error('Error building participant map:', error)
    return new Map()
  }
}
