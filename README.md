# Hackathon Project Hub

A responsive React app for discovering hackathon projects and forming teams.
The current milestone is an accessible, responsive UI backed by local mock data.

UI component conventions, mock-data shapes, and preview states are documented
in [`docs/UI.md`](docs/UI.md).

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+

## Installation

```sh
npm ci
```

Copy `.env.example` to `.env.local` only when local configuration is needed.
Never commit `.env` files. Variables prefixed with `VITE_` are included in the
browser bundle, so they must not contain credentials or service-role keys.

## Local development

```sh
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

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

The repository includes `vercel.json` for Vercel hosting.

1. Import this repository into Vercel.
2. Keep the detected Vite framework settings. The configured build command is
   `npm run build`, and the output directory is `dist`.
3. Add only non-secret public configuration if the app later requires it.
4. Deploy, then update the URL below.

Temporary deployment:
https://temporary-sonic-sequoia-8p923zf.vercel.app

The temporary deployment expires one hour after creation. Claim it in Vercel
and run an authenticated production deployment to obtain a persistent URL.

For an anonymous preview or an authenticated production deployment:

```sh
npx vercel deploy --temporary --yes
npx vercel
npx vercel --prod
```

## CI/CD configuration

GitHub Actions runs four required checks on pull requests and pushes to
`main`: lint, type-check, production build, and a high-severity dependency
audit. Every job uses `npm ci`, so `package-lock.json` must be committed and
kept current.

Configure the repository and hosting project as follows:

1. In Vercel, import the GitHub repository and keep the production branch set
   to `main`. Vercel's Git integration creates a preview deployment for each
   pull request and a production deployment after changes reach `main`.
2. Leave deployment credentials out of GitHub Actions. The Vercel GitHub App
   should be granted access only to this repository, and project members
   should receive only the Vercel roles they need.
3. In Vercel, enable deployment protection for the production environment and
   restrict production deployments to the production branch. Require CI to
   pass before merging so failed commits cannot reach that branch.
4. In GitHub branch protection for `main`, require the `Lint`, `Type check`,
   `Production build`, and `Dependency audit` checks and require pull requests
   before merging.
5. In GitHub's security settings, enable the dependency graph, Dependabot
   alerts, and Dependabot security updates. `.github/dependabot.yml` also
   schedules weekly npm and GitHub Actions version-update pull requests.

No repository secrets are required by the current workflows. If deployment is
later moved from the Vercel Git integration into GitHub Actions, store the
token as an environment secret, scope it to this Vercel project where
supported, and require approval on a protected `production` environment.
Never put token values in documentation, workflow files, or `VITE_` variables.
