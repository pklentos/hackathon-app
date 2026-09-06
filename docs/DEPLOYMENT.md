# Deployment Guide

## Netlify Deployment

This project is deployed to Netlify using CLI-driven deployments via GitHub Actions.

### Architecture

- **Preview deployments**: Automatically created for every pull request
- **Production deployments**: Automatically deployed when changes are merged to `main`
- **CLI-driven**: All deployments use `netlify-cli` (the Netlify UI is NOT connected to the repo)

### Prerequisites

The following must be configured in GitHub:

1. **GitHub Secret**: `NETLIFY_AUTH_TOKEN`
   - Your Netlify personal access token
   - Created at: Netlify Dashboard → User Settings → Applications → Personal access tokens

2. **GitHub Variable**: `NETLIFY_SITE_ID`
   - Your site's unique identifier
   - Found in: Netlify Dashboard → Site settings → General → Site details

### Configuration Files

- **`netlify.toml`**: Netlify build configuration
  - Build command: `npm run build`
  - Publish directory: `dist`
  - SPA redirect: All routes redirect to `index.html`
  - Node version: 22

- **`.github/workflows/ci.yml`**: GitHub Actions workflow
  - Runs tests and builds on all PRs and pushes to `main`
  - Deploys preview builds for PRs (after tests pass)
  - Deploys production builds for `main` branch (after tests pass)

### Local Deployment

To manually deploy from your local machine:

1. **Install dependencies** (if not already done):
   ```sh
   npm install
   ```

2. **Authenticate with Netlify**:
   ```sh
   npx netlify login
   ```
   This opens your browser to authorize the CLI.

3. **Deploy a preview**:
   ```sh
   npm run build
   npx netlify deploy
   ```
   This creates a draft deploy with a unique preview URL.

4. **Deploy to production**:
   ```sh
   npm run build
   npx netlify deploy --prod
   ```
   This deploys to your production domain.

### Useful Commands

```sh
# Check current site status
npx netlify status

# View site information
npx netlify sites:list

# Open site in browser
npx netlify open:site

# View deploy logs
npx netlify logs

# Link local repo to a different site (if needed)
npx netlify link
```

### Environment Variables

For Supabase integration:

1. Go to: Netlify Dashboard → Site settings → Environment variables
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your production Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your production Supabase anonymous key

**Security note**: Only use the anonymous (anon) key in client code. Never use the service-role key, as it bypasses Row Level Security.

### CI/CD Flow

#### Pull Request Flow
1. Developer creates a PR
2. GitHub Actions runs: lint, type-check, build, dependency-audit
3. If all checks pass, a preview deployment is created
4. Preview URL is available in the Actions logs
5. Reviewers can test the preview before merging

#### Production Flow
1. PR is merged to `main`
2. GitHub Actions runs all checks again
3. If checks pass, production deployment is triggered
4. Site is live at your production domain

### Deployment Status

You can check deployment status in:
- GitHub Actions tab (workflow runs)
- Netlify Dashboard → Deploys
- Netlify CLI: `npx netlify status`

### Troubleshooting

**Build fails on Netlify**:
- Check that `netlify.toml` build command matches `package.json` scripts
- Verify Node version in `netlify.toml` matches `.nvmrc` or your local version
- Review build logs in GitHub Actions or Netlify Dashboard

**Environment variables not working**:
- Ensure variables are prefixed with `VITE_` to be included in the build
- Re-deploy after adding new environment variables
- Clear build cache: `npx netlify build --clear-cache`

**Preview deploys not appearing**:
- Check GitHub Actions logs for deployment errors
- Verify `NETLIFY_AUTH_TOKEN` secret and `NETLIFY_SITE_ID` variable are set
- Ensure the PR has passed all required checks

**Authentication issues**:
- Re-run: `npx netlify login`
- Generate a new personal access token in Netlify
- Update the `NETLIFY_AUTH_TOKEN` secret in GitHub

### Migration from Vercel

This project previously used Vercel. The Netlify deployment:
- Uses the same build command (`npm run build`)
- Uses the same output directory (`dist`)
- Includes SPA routing (all routes serve `index.html`)
- Maintains the same CI/CD quality checks
