# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save the settings

### 2. Repository Name

The deployment workflow automatically uses your repository name as the base path. If your repository is named `health-blood-units`, your site will be available at:
- `https://<username>.github.io/health-blood-units/`

### 3. Deploy

The deployment happens automatically when you push to the `main` branch. You can also trigger it manually:

1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## Important Notes

### API Routes Limitation

⚠️ **The `/api/voice-chat` route will NOT work on GitHub Pages** because GitHub Pages only serves static files. Next.js API routes require a server.

**Options to fix this:**

1. **Use an external API service** (recommended):
   - Deploy the API route to Vercel, Netlify Functions, or another serverless platform
   - Update the fetch URL in `components/voice-chat-interface.tsx` to point to the external API

2. **Disable the voice chat feature** for the static deployment

3. **Use a different hosting** that supports server-side rendering (Vercel, Netlify, etc.)

### Local Development

For local development, the basePath is empty, so the app runs at `http://localhost:3000`.

To test the GitHub Pages build locally:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name pnpm run build
pnpm run start
```

Then visit `http://localhost:3000/your-repo-name/`

## Custom Domain

If you want to use a custom domain:

1. Update `next.config.mjs` to remove or adjust the `basePath`
2. Update the GitHub Actions workflow to not set `NEXT_PUBLIC_BASE_PATH`
3. Configure your custom domain in GitHub Pages settings
