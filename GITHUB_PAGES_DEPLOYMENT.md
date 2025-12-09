# GitHub Pages Deployment Guide

This document provides comprehensive instructions for deploying the 3D Packaging Configurator to GitHub Pages while maintaining compatibility with Manus hosting.

## Overview

The application uses **environment-based configuration** to support dual deployment:

- **Manus Hosting**: Uses base path `/` (default)
- **GitHub Pages**: Uses base path `/packaging-configurator-3d/` (or your repository name)

This approach allows you to:
1. Continue development and hosting on Manus
2. Deploy standalone versions to GitHub Pages for integration testing
3. Prepare the codebase for integration with external backend systems

## Prerequisites

- GitHub account
- Git installed locally
- Node.js and pnpm installed
- Repository created on GitHub (e.g., `username/packaging-configurator-3d`)

## Configuration Details

### Vite Configuration (`vite.config.ts`)

The application uses an environment variable `VITE_BASE_PATH` to determine the base path:

```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ... rest of config
})
```

- **Default (`/`)**: Used for Manus hosting
- **Custom path**: Set via `VITE_BASE_PATH` environment variable for GitHub Pages

### Package Scripts (`package.json`)

Two new scripts have been added:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts ...",  // Manus build (base: /)
    "build:github": "VITE_BASE_PATH=/packaging-configurator-3d/ vite build",  // GitHub Pages build
    "deploy:github": "pnpm run build:github && gh-pages -d dist/public"  // Build + deploy to GitHub Pages
  }
}
```

## Deployment Steps

### Option A: Automated Deployment (Recommended)

**1. Initialize Git Repository (if not already done)**

```bash
cd /home/ubuntu/packaging-configurator-3d
git init
git add .
git commit -m "Initial commit with dual deployment support"
```

**2. Connect to GitHub Remote**

```bash
git remote add origin https://github.com/username/packaging-configurator-3d.git
git branch -M main
git push -u origin main
```

**3. Deploy to GitHub Pages**

```bash
pnpm run deploy:github
```

This command will:
- Build the application with GitHub Pages base path
- Create/update the `gh-pages` branch
- Push built files to GitHub

**4. Configure GitHub Pages Settings**

- Go to your repository on GitHub
- Navigate to **Settings** → **Pages**
- Under "Source", select:
  - Branch: `gh-pages`
  - Folder: `/ (root)`
- Click **Save**

**5. Access Your Deployed Site**

Your site will be available at:
```
https://username.github.io/packaging-configurator-3d/
```

Initial deployment may take 1-2 minutes to become available.

### Option B: Manual Deployment

**1. Build for GitHub Pages**

```bash
pnpm run build:github
```

**2. Deploy Built Files**

```bash
npx gh-pages -d dist/public
```

**3. Configure GitHub Pages** (same as Option A, step 4)

## Customizing Repository Name

If your repository has a different name, update the base path in two places:

**1. Update `package.json`:**

```json
"build:github": "VITE_BASE_PATH=/your-repo-name/ vite build"
```

**2. Update `deploy:github` script** (if using custom configuration):

The `gh-pages` package automatically uses your repository name, so no changes needed for the deploy script.

## Verifying Deployment

### Check Build Output

After running `build:github`, verify the output:

```bash
ls -lh dist/public/
```

You should see:
- `index.html` (~360KB)
- `assets/` directory (CSS and JS bundles)
- `models/` directory (3D model files)

### Test Locally Before Deploying

You can preview the GitHub Pages build locally:

```bash
pnpm run build:github
cd dist/public
python3 -m http.server 8000
```

Then visit: `http://localhost:8000/packaging-configurator-3d/`

### Verify Asset Paths

After deployment, check that:
- 3D models load correctly
- Package icons display properly
- Templates apply correctly
- Pop-out viewer works with correct base path

## Maintaining Dual Deployment

### For Manus Deployment

Use the standard build command (no environment variable):

```bash
pnpm run build
```

This builds with base path `/` for Manus hosting.

### For GitHub Pages Deployment

Use the GitHub-specific build command:

```bash
pnpm run deploy:github
```

This builds with base path `/packaging-configurator-3d/` and deploys to GitHub Pages.

### Important Notes

1. **Never commit `dist/` directory** - It's generated during build
2. **The `gh-pages` branch is auto-managed** - Don't edit it manually
3. **Asset paths are automatically handled** - Vite resolves paths based on `base` config
4. **Both deployments use the same codebase** - No code duplication needed

## Troubleshooting

### Issue: Assets Not Loading on GitHub Pages

**Symptom**: 3D models or images return 404 errors

**Solution**: Verify the base path matches your repository name:
```bash
# Check package.json
grep "build:github" package.json

# Should show: VITE_BASE_PATH=/your-actual-repo-name/
```

### Issue: Blank Page on GitHub Pages

**Symptom**: Site loads but shows blank page

**Solution**: 
1. Check browser console for errors
2. Verify base path is correct
3. Ensure GitHub Pages is configured to use `gh-pages` branch

### Issue: 404 on GitHub Pages URL

**Symptom**: `https://username.github.io/packaging-configurator-3d/` returns 404

**Solution**:
1. Wait 1-2 minutes after first deployment
2. Check GitHub Pages settings (Settings → Pages)
3. Verify `gh-pages` branch exists in your repository

### Issue: Changes Not Reflecting on GitHub Pages

**Symptom**: Deployed site shows old version

**Solution**:
```bash
# Force rebuild and redeploy
rm -rf dist/
pnpm run deploy:github
```

GitHub Pages may cache aggressively - wait a few minutes or do a hard refresh (Ctrl+Shift+R).

## Integration with External Backend

When integrating with an external backend system:

### Option 1: Use GitHub Pages for Frontend Only

Deploy the frontend to GitHub Pages and configure API calls to point to your backend:

```typescript
// Example: Configure API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.com/api';
```

Set `VITE_API_URL` in your build command:
```bash
VITE_BASE_PATH=/packaging-configurator-3d/ VITE_API_URL=https://your-backend.com/api pnpm run build:github
```

### Option 2: Self-Host Both Frontend and Backend

For production deployments with backend integration, consider:
- Deploying to a cloud provider (AWS, Azure, GCP)
- Using Manus hosting with custom domain
- Containerizing with Docker (see `DEPLOYMENT.md` for Docker configuration)

## CI/CD Integration (Optional)

To automate GitHub Pages deployment on every push:

**1. Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build and deploy
        run: pnpm run deploy:github
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**2. Commit and push the workflow:**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages CI/CD workflow"
git push
```

Now every push to `main` will automatically deploy to GitHub Pages.

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [gh-pages Package](https://github.com/tschaub/gh-pages)

## Support

For issues specific to:
- **Manus hosting**: Visit https://help.manus.im
- **GitHub Pages**: Check GitHub Pages documentation
- **Application bugs**: Create an issue in your GitHub repository

---

**Last Updated**: December 2024  
**Vite Version**: 7.1.9  
**Node Version**: 22.13.0
