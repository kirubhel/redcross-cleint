# Vercel Deployment Fix

## Problem
Vercel couldn't find `package.json` during build.

## Solution
Simplified `vercel.json` to let Vercel auto-detect Vite framework.

## Manual Vercel Configuration

If auto-detection doesn't work, manually set these in Vercel dashboard:

### Settings to Configure in Vercel Dashboard:

1. **Framework Preset**: Vite (or leave as "Other")
2. **Root Directory**: `./` (or leave empty)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Environment Variables:
- `VITE_API_URL` = Your server URL (e.g., `https://redcross-server.vercel.app`)

## After Pushing

1. Go to Vercel dashboard
2. Go to your project settings
3. Verify Root Directory is set correctly
4. Redeploy

