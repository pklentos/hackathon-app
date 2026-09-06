# Hackathon Project Hub

A responsive React app for discovering hackathon projects and forming teams.
The current milestone is an accessible, responsive UI backed by local mock data.

UI component conventions, mock-data shapes, and preview states are documented
in [`docs/UI.md`](docs/UI.md).

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Docker Desktop or Podman (for local Supabase development)

## Installation

```sh
npm ci
```

Copy `.env.example` to `.env.local` only when local configuration is needed.
Never commit `.env` files. Variables prefixed with `VITE_` are included in the
browser bundle, so they must not contain credentials or service-role keys.

## Supabase setup

The app integrates with Supabase for project data storage. If Supabase is not
configured, the app gracefully falls back to local mock data.

### Local Supabase development

1. Ensure Docker Desktop or Podman is installed and running.
2. Start the local Supabase instance:

```sh
npx supabase start
```

This command downloads required Docker images and starts PostgreSQL, Kong,
GoTrue, PostgREST, Realtime, Storage, and other Supabase services. The output
includes the local API URL and anonymous key.

3. Copy the printed `API URL` and `anon key` to `.env.local`:

```sh
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Security note**: Only use the anonymous (anon) key in client code. Never use
the service-role key, as it bypasses Row Level Security and grants full
database access.

4. The database schema is defined in `supabase/migrations/`. Migrations are
   automatically applied when you start Supabase locally.

### Supabase commands

```sh
# Start local Supabase (applies migrations automatically)
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset database and reapply all migrations
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name

# Check Supabase status
npx supabase status
```

### Database schema

The database includes three main tables:

- **participants**: Browser-scoped participant identities with hashed tokens
- **projects**: Hackathon projects with title, description, capacity, and creator
- **memberships**: One-to-one relationship between participants and projects

All tables have Row Level Security (RLS) enabled. Direct writes are prevented;
mutations must go through authenticated server functions (to be implemented in
later milestones).

The `project_catalog` view provides computed fields (member_count, status) for
efficient catalog queries.

### Production Supabase

For production deployment:

1. Create a Supabase project at https://supabase.com
2. Apply migrations to production:
   ```sh
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
3. Add the production URL and anon key to Vercel environment variables
4. Never expose the service-role key in any client-accessible location

## Local development

```sh
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

If Supabase is not running or configured, the app uses mock data automatically.

Other checks:

```sh
npm run lint
npm run type-check
```

## Production build

```sh
npm run build
npm run preview
```

The production assets are written to `dist/`.

## Deployment

This project is deployed to Netlify using CLI-driven deployments via GitHub Actions.

### Automated Deployments

- **Preview deployments**: Automatically created for every pull request (after CI checks pass)
- **Production deployments**: Automatically deployed when changes are merged to `main`

### Manual Local Deployment

1. Authenticate with Netlify:
   ```sh
   npx netlify login
   ```

2. Deploy a preview:
   ```sh
   npm run build
   npx netlify deploy
   ```

3. Deploy to production:
   ```sh
   npm run build
   npx netlify deploy --prod
   ```

For complete deployment documentation, environment variables, troubleshooting, and CI/CD flow, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## CI/CD configuration

GitHub Actions runs four required checks on pull requests and pushes to
`main`: lint, type-check, production build, and a high-severity dependency
audit. Every job uses `npm ci`, so `package-lock.json` must be committed and
kept current.

After all checks pass:
- **Pull requests**: A preview deployment is created on Netlify
- **Main branch**: A production deployment is triggered on Netlify

### Required GitHub Configuration

1. **Repository secrets**:
   - `NETLIFY_AUTH_TOKEN`: Netlify personal access token

2. **Repository variables**:
   - `NETLIFY_SITE_ID`: Netlify site identifier

3. **Branch protection for `main`**:
   - Require pull requests before merging
   - Require status checks to pass: `Lint`, `Type check`, `Production build`, `Dependency audit`
   - Require branches to be up to date before merging

4. **Security settings**:
   - Enable dependency graph
   - Enable Dependabot alerts
   - Enable Dependabot security updates
   - `.github/dependabot.yml` schedules weekly npm and GitHub Actions version-update PRs

### Security Notes

- The `NETLIFY_AUTH_TOKEN` secret provides deployment access and must be protected
- Use least-privilege credentials (site-specific tokens when available)
- Never put token values in documentation, workflow files, or `VITE_` variables
- All `VITE_` prefixed environment variables are included in the browser bundle
