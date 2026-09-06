import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  CatalogState,
  currentParticipant,
  getParticipantName,
  isCurrentProject,
  isProjectFull,
  mockProjects,
  participants,
  Project,
  ProjectFilter,
} from './mockData'
import { fetchCatalogProjects } from './catalogData'
import { isSupabaseConfigured } from './supabase'

type DialogState =
  | { kind: 'details'; project: Project }
  | { kind: 'propose' }
  | { kind: 'name' }
  | { kind: 'confirm'; action: 'switch' | 'leave' | 'delete'; project: Project }
  | null

type ProjectDraft = {
  title: string
  description: string
  capacity: string
}

const initialDraft: ProjectDraft = { title: '', description: '', capacity: '4' }

function validateProject(draft: ProjectDraft) {
  const titleLength = draft.title.trim().length
  const descriptionLength = draft.description.trim().length
  const capacity = Number(draft.capacity)

  return {
    title:
      titleLength < 3 || titleLength > 80
        ? 'Use between 3 and 80 characters.'
        : '',
    description:
      descriptionLength < 20 || descriptionLength > 2000
        ? 'Use between 20 and 2,000 characters.'
        : '',
    capacity:
      !Number.isInteger(capacity) || capacity < 1 || capacity > 20
        ? 'Choose a whole number from 1 to 20.'
        : '',
  }
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (project: Project) => void
}) {
  const full = isProjectFull(project)
  const current = isCurrentProject(project)
  const created = project.creatorId === currentParticipant.id

  return (
    <article className={`project-card${current ? ' project-card--current' : ''}`}>
      <div className="card-topline">
        <span className={`status ${full ? 'status--full' : 'status--open'}`}>
          <span aria-hidden="true">{full ? '●' : '↗'}</span> {full ? 'Full' : 'Open'}
        </span>
        <span className="capacity">
          {project.memberships.length} / {project.capacity} people
        </span>
      </div>
      <div>
        <h3>{project.title}</h3>
        <p className="card-description">{project.description}</p>
      </div>
      <div className="card-badges" aria-label="Project indicators">
        {current && <span className="badge badge--accent">Your current project</span>}
        {created && <span className="badge">Created by you</span>}
        {project.isSeeded && <span className="badge">Organizer project</span>}
      </div>
      <button className="button button--secondary card-action" onClick={() => onOpen(project)}>
        View project
      </button>
    </article>
  )
}

export function App() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const [catalogState, setCatalogState] = useState<CatalogState>(() => {
    const requested = new URLSearchParams(window.location.search).get('state')
    return requested === 'loading' || requested === 'empty' || requested === 'error'
      ? requested
      : isSupabaseConfigured() ? 'loading' : 'ready'
  })
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [dialog, setDialog] = useState<DialogState>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const [displayName, setDisplayName] = useState(currentParticipant.displayName)
  const [nameDraft, setNameDraft] = useState(displayName)
  const [nameError, setNameError] = useState('')
  const [projectDraft, setProjectDraft] = useState(initialDraft)
  const [projectErrors, setProjectErrors] = useState(validateProject(initialDraft))
  const [projectAttempted, setProjectAttempted] = useState(false)
  const [projectSubmitError, setProjectSubmitError] = useState('')
  const [feedback, setFeedback] = useState('')

  // Fetch projects from Supabase on mount
  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        setCatalogState('loading')
        const fetchedProjects = await fetchCatalogProjects()
        
        if (!isMounted) return

        if (fetchedProjects.length === 0) {
          setCatalogState('empty')
          setProjects([])
        } else {
          setCatalogState('ready')
          setProjects(fetchedProjects)
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
        if (isMounted) {
          setCatalogState('error')
          // Fallback to mock data on error
          setProjects(mockProjects)
        }
      }
    }

    // Only fetch if Supabase is configured
    if (isSupabaseConfigured()) {
      loadProjects()
    }

    return () => {
      isMounted = false
    }
  }, [])

  const currentProject = projects.find(isCurrentProject)
  useEffect(() => {
    if (!dialog) return
    dialogRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDialog(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [dialog])

  const visibleProjects = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    return projects
      .filter((project) => {
        const matchesQuery =
          !search ||
          project.title.toLocaleLowerCase().includes(search) ||
          project.description.toLocaleLowerCase().includes(search)
        const matchesFilter =
          filter === 'all' ||
          (filter === 'open' && !isProjectFull(project)) ||
          (filter === 'full' && isProjectFull(project)) ||
          (filter === 'mine' && isCurrentProject(project))
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => {
        const availability = Number(isProjectFull(a)) - Number(isProjectFull(b))
        return availability || Date.parse(b.createdAt) - Date.parse(a.createdAt)
      })
  }, [filter, query, projects])

  function resetCatalog() {
    setQuery('')
    setFilter('all')
  }

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = nameDraft.trim()
    if (normalized.length < 1 || normalized.length > 40) {
      setNameError('Display name must be between 1 and 40 characters.')
      return
    }
    setDisplayName(normalized)
    setNameDraft(normalized)
    setNameError('')
    setFeedback(`Display name updated to ${normalized}.`)
    setDialog(null)
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateProject(projectDraft)
    setProjectAttempted(true)
    setProjectErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    setProjectSubmitError(
      'Mock server unavailable. Your project was not saved, and your entries have been preserved.',
    )
  }

  function updateProjectDraft(update: Partial<ProjectDraft>) {
    const nextDraft = { ...projectDraft, ...update }
    setProjectDraft(nextDraft)
    setProjectSubmitError('')
    if (projectAttempted) setProjectErrors(validateProject(nextDraft))
  }

  function confirmAction() {
    if (!dialog || dialog.kind !== 'confirm') return
    const actionLabel = {
      switch: `Switch to “${dialog.project.title}”`,
      leave: `Leave “${dialog.project.title}”`,
      delete: `Delete “${dialog.project.title}”`,
    }[dialog.action]
    setFeedback(`${actionLabel} is a UI-only demo; mocked data was not changed.`)
    setDialog(null)
  }

  function openDetails(project: Project) {
    setDialog({ kind: 'details', project })
  }

  return (
    <>
      <a className="skip-link" href="#catalog">
        Skip to project catalog
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Sparkboard home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Sparkboard</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#catalog">Browse projects</a>
          <button className="button button--primary button--small" onClick={() => setDialog({ kind: 'propose' })}>
            Propose project
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Hack for good · 2026</p>
            <h1 id="page-title">Find your people.<br />Build what matters.</h1>
            <p className="hero-copy">
              Explore ideas, meet teammates, and choose one project to move forward together.
            </p>
          </div>
          <aside className="participant-summary" aria-label="Your hackathon summary">
            <div className="avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="summary-label">Signed in for this browser as</p>
              <strong>{displayName}</strong>
              <button className="text-button" onClick={() => {
                setNameDraft(displayName)
                setDialog({ kind: 'name' })
              }}>
                Change name
              </button>
            </div>
            <div className="summary-project">
              <span>Current project</span>
              <strong>{currentProject?.title ?? 'Not joined yet'}</strong>
            </div>
          </aside>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Project catalog</p>
              <h2 id="catalog-title">Choose a challenge</h2>
            </div>
            <p>{mockProjects.length} ideas from participants and organizers</p>
          </div>

          <div className="catalog-controls">
            <label className="search-field">
              <span className="sr-only">Search projects</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search titles and descriptions"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <fieldset className="filter-group">
              <legend className="sr-only">Filter projects</legend>
              {(['all', 'open', 'full', 'mine'] as const).map((value) => (
                <button
                  className={filter === value ? 'filter is-active' : 'filter'}
                  type="button"
                  aria-pressed={filter === value}
                  key={value}
                  onClick={() => setFilter(value)}
                >
                  {{ all: 'All', open: 'Open', full: 'Full', mine: 'My project' }[value]}
                </button>
              ))}
            </fieldset>
            {(query || filter !== 'all') && (
              <button className="text-button reset-button" onClick={resetCatalog}>Reset</button>
            )}
          </div>

          {feedback && <div className="feedback" role="status"><span aria-hidden="true">✓</span> {feedback}</div>}

          {catalogState === 'loading' && <div className="state-panel" role="status"><span className="spinner" /> Loading projects…</div>}
          {catalogState === 'error' && <div className="state-panel state-panel--error" role="alert"><strong>Projects could not be loaded.</strong><span>Try refreshing the page.</span></div>}
          {catalogState === 'empty' && <div className="state-panel"><strong>No projects have been proposed yet.</strong><span>Be the first to share an idea.</span></div>}
          {catalogState === 'ready' && visibleProjects.length === 0 && (
            <div className="state-panel">
              <strong>No projects match your search.</strong>
              <span>Try a different phrase or reset the filters.</span>
              <button className="button button--secondary" onClick={resetCatalog}>Reset search and filters</button>
            </div>
          )}
          {catalogState === 'ready' && visibleProjects.length > 0 && (
            <div className="project-grid">
              {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onOpen={openDetails} />)}
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Sparkboard · Mock experience</span>
        <span>Your identity is tied to this browser and cannot be recovered if local data is cleared.</span>
      </footer>

      {dialog && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialog(null)
        }}>
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            ref={dialogRef}
            tabIndex={-1}
          >
            <button className="dialog-close" aria-label="Close dialog" onClick={() => setDialog(null)}>×</button>

            {dialog.kind === 'details' && (
              <ProjectDetails
                project={dialog.project}
                hasMembership={Boolean(currentProject)}
                onConfirm={(action) => setDialog({ kind: 'confirm', action, project: dialog.project })}
                onJoin={() => {
                  setFeedback(`Join “${dialog.project.title}” is a UI-only demo; mocked data was not changed.`)
                  setDialog(null)
                }}
                onEdit={() => {
                  setFeedback(`Edit “${dialog.project.title}” is a UI-only demo; mocked data was not changed.`)
                  setDialog(null)
                }}
              />
            )}

            {dialog.kind === 'name' && (
              <form onSubmit={submitName} noValidate>
                <p className="eyebrow">Browser identity</p>
                <h2 id="dialog-title">Change display name</h2>
                <p className="form-intro">This public name and your team membership are visible to other participants.</p>
                <label className="field">
                  <span>Display name</span>
                  <input value={nameDraft} maxLength={41} onChange={(event) => {
                    setNameDraft(event.target.value)
                    setNameError('')
                  }} aria-describedby={nameError ? 'name-error' : undefined} />
                  {nameError && <small className="field-error" id="name-error">{nameError}</small>}
                </label>
                <div className="dialog-actions">
                  <button className="button button--secondary" type="button" onClick={() => setDialog(null)}>Cancel</button>
                  <button className="button button--primary" type="submit">Save name</button>
                </div>
              </form>
            )}

            {dialog.kind === 'propose' && (
              <form onSubmit={submitProject} noValidate>
                <p className="eyebrow">Share an idea</p>
                <h2 id="dialog-title">Propose a project</h2>
                <p className="form-intro">Your values stay here if validation or a recoverable request fails.</p>
                {projectSubmitError && <div className="form-error" role="alert"><strong>Could not propose project.</strong> {projectSubmitError}</div>}
                <label className="field">
                  <span>Project title <small>3–80 characters</small></span>
                  <input value={projectDraft.title} onChange={(event) => updateProjectDraft({ title: event.target.value })} />
                  {projectAttempted && projectErrors.title && <small className="field-error">{projectErrors.title}</small>}
                </label>
                <label className="field">
                  <span>Description <small>20–2,000 characters</small></span>
                  <textarea rows={5} value={projectDraft.description} onChange={(event) => updateProjectDraft({ description: event.target.value })} />
                  {projectAttempted && projectErrors.description && <small className="field-error">{projectErrors.description}</small>}
                </label>
                <label className="field field--short">
                  <span>Maximum team size <small>1–20</small></span>
                  <input type="number" min="1" max="20" step="1" value={projectDraft.capacity} onChange={(event) => updateProjectDraft({ capacity: event.target.value })} />
                  {projectAttempted && projectErrors.capacity && <small className="field-error">{projectErrors.capacity}</small>}
                </label>
                <div className="dialog-actions">
                  <button className="button button--secondary" type="button" onClick={() => setDialog(null)}>Cancel</button>
                  <button className="button button--primary" type="submit">Propose project</button>
                </div>
              </form>
            )}

            {dialog.kind === 'confirm' && (
              <>
                <p className="eyebrow">Please confirm</p>
                <h2 id="dialog-title">
                  {dialog.action === 'switch' && 'Switch projects?'}
                  {dialog.action === 'leave' && 'Leave this project?'}
                  {dialog.action === 'delete' && 'Delete this project?'}
                </h2>
                <p>
                  {dialog.action === 'delete'
                    ? `${dialog.project.memberships.length} participant${dialog.project.memberships.length === 1 ? '' : 's'} will be removed from “${dialog.project.title}”.`
                    : `${dialog.action === 'switch' ? 'Your current membership will move to' : 'Your membership will be removed from'} “${dialog.project.title}”.`}
                </p>
                <div className="dialog-actions">
                  <button className="button button--secondary" onClick={() => setDialog(null)}>Cancel</button>
                  <button className={`button ${dialog.action === 'delete' ? 'button--danger' : 'button--primary'}`} onClick={confirmAction}>
                    {dialog.action === 'switch' ? 'Switch to this project' : dialog.action === 'leave' ? 'Leave project' : 'Delete project'}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}

function ProjectDetails({
  project,
  hasMembership,
  onConfirm,
  onJoin,
  onEdit,
}: {
  project: Project
  hasMembership: boolean
  onConfirm: (action: 'switch' | 'leave' | 'delete') => void
  onJoin: () => void
  onEdit: () => void
}) {
  const full = isProjectFull(project)
  const current = isCurrentProject(project)
  const created = project.creatorId === currentParticipant.id

  return (
    <>
      <p className="eyebrow">Project details</p>
      <div className="detail-heading">
        <h2 id="dialog-title">{project.title}</h2>
        <span className={`status ${full ? 'status--full' : 'status--open'}`}>{full ? 'Full' : 'Open'}</span>
      </div>
      <p className="detail-description">{project.description}</p>
      <dl className="detail-facts">
        <div><dt>Team</dt><dd>{project.memberships.length} of {project.capacity}</dd></div>
        <div><dt>Created by</dt><dd>{getParticipantName(project.creatorId)}</dd></div>
        <div><dt>Created</dt><dd>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(project.createdAt))}</dd></div>
      </dl>
      <div className="participants">
        <h3>Participants</h3>
        {project.memberships.length === 0 ? <p>No one has joined yet.</p> : (
          <ul>{project.memberships.map((membership) => (
            <li key={membership.participantId}>
              <span className="mini-avatar" aria-hidden="true">{getParticipantName(membership.participantId).charAt(0)}</span>
              {participants.find((participant) => participant.id === membership.participantId)?.displayName}
            </li>
          ))}</ul>
        )}
      </div>
      <p className="ui-only-note">These controls demonstrate UI states only. Server authorization is not connected.</p>
      <div className="dialog-actions dialog-actions--wrap">
        {current ? (
          <button className="button button--secondary" onClick={() => onConfirm('leave')}>Leave project</button>
        ) : hasMembership ? (
          <button className="button button--primary" disabled={full} onClick={() => onConfirm('switch')}>
            {full ? 'Project is full' : 'Switch to this project'}
          </button>
        ) : (
          <button className="button button--primary" disabled={full} onClick={onJoin}>
            {full ? 'Project is full' : 'Join project'}
          </button>
        )}
        {created && <>
          <button className="button button--secondary" onClick={onEdit}>Edit project</button>
          <button className="button button--danger" onClick={() => onConfirm('delete')}>Delete project</button>
        </>}
      </div>
    </>
  )
}
