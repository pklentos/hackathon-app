# Netlify Deployment Notes

## Site Configuration

**Site ID**: Retrieved from `NETLIFY_SITE_ID` repository variable
**Auth Token**: Stored in `NETLIFY_AUTH_TOKEN` repository secret

## Manual Setup Completed

- ✅ Netlify account created
- ✅ Personal access token generated
- ✅ Netlify CLI installed globally
- ✅ Site created via CLI
- ✅ GitHub secrets and variables configured

## Automated Setup Completed

- ✅ `netlify-cli` added to devDependencies
- ✅ `netlify.toml` configuration created
- ✅ CI workflow updated with preview and production deploy jobs
- ✅ Deployment documentation created

## Deployment URLs

Preview deployments are created for each PR and available in GitHub Actions logs.
Production deployment URL will be available after the first merge to `main`.

## Important Notes

- **DO NOT** connect the repository in the Netlify UI
- All deployments are CLI-driven via GitHub Actions
- Preview builds deploy on PR creation/update
- Production builds deploy on merge to `main`

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for complete deployment documentation.