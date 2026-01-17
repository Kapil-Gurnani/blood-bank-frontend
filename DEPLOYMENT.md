# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages using GitHub Actions and connect to your AWS backend.

## Setup Instructions

### 1. Configure AWS Backend Secrets

Since your backend is in AWS, you need to configure GitHub Secrets:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following secrets:

   - **`AWS_API_BASE_URL`**: Your AWS API Gateway base URL (must include full path to blood-banks API)
     - Example: `https://your-api.execute-api.us-east-1.amazonaws.com/prod/api/blood-banks`
     - Or: `https://api.yourdomain.com/api/blood-banks`
     - **Important**: Include the `/api/blood-banks` path in the URL
   
   - **`AWS_VOICE_CHAT_ENDPOINT`**: Voice chat API endpoint (relative to base URL)
     - Default: `/api/voice-chat`
     - Only set this if your endpoint is different
   
   - **`AWS_WS_URL`**: WebSocket URL for real-time chat
     - Example: `wss://your-ws-api.execute-api.us-east-1.amazonaws.com/prod`
     - Or: `wss://ws.yourdomain.com`

**Note:** If you don't set these secrets, the app will default to `http://localhost:8080` (for local development).

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save the settings

### 3. Repository Name

The deployment workflow automatically uses your repository name as the base path. If your repository is named `health-blood-units`, your site will be available at:
- `https://<username>.github.io/health-blood-units/`

### 4. Deploy

The deployment happens automatically when you push to the `main` branch. You can also trigger it manually:

1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## AWS Backend Configuration

### API Endpoints

The frontend is configured to call your AWS backend for:

1. **Blood Bank API** (`lib/api.ts`):
   - States: `GET {AWS_API_BASE_URL}/api/blood-banks/states`
   - Districts: `GET {AWS_API_BASE_URL}/api/blood-banks/districts`
   - Stock Nearby: `GET {AWS_API_BASE_URL}/api/blood-banks/stock-nearby`

2. **Voice Chat API** (`components/voice-chat-interface.tsx`):
   - `POST {AWS_API_BASE_URL}{AWS_VOICE_CHAT_ENDPOINT}`

3. **WebSocket Chat** (`components/websocket-chat-interface.tsx`):
   - `{AWS_WS_URL}`

### CORS Configuration

Make sure your AWS backend has CORS configured to allow requests from your GitHub Pages domain:
- `https://<username>.github.io`

Example CORS headers for AWS API Gateway:
```
Access-Control-Allow-Origin: https://<username>.github.io
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Local Development

For local development, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_VOICE_CHAT_ENDPOINT=/api/voice-chat
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

The basePath is empty for local development, so the app runs at `http://localhost:3000`.

To test the GitHub Pages build locally with AWS backend:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name \
NEXT_PUBLIC_API_BASE_URL=https://your-aws-api.execute-api.us-east-1.amazonaws.com/prod/api/blood-banks \
NEXT_PUBLIC_WS_URL=wss://your-ws-api.execute-api.us-east-1.amazonaws.com/prod \
pnpm run build
pnpm run start
```

Then visit `http://localhost:3000/your-repo-name/`

## Custom Domain

If you want to use a custom domain:

1. Update `next.config.mjs` to remove or adjust the `basePath`
2. Update the GitHub Actions workflow to not set `NEXT_PUBLIC_BASE_PATH`
3. Configure your custom domain in GitHub Pages settings
