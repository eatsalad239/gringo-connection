# 🔧 Cloudflare Deployment Fix

## Issue
Deployment failed because:
1. Next.js `standalone` output mode not compatible with Cloudflare Pages directly
2. Missing GitHub secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
3. Incorrect build output directory

## Solution

### Option 1: Deploy via Cloudflare Dashboard (EASIEST)

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages
2. **Click "Create application"** → **Pages** → **Connect to Git**
3. **Select repository**: `eatsalad239/gringo-connection`
4. **Configure build**:
   - **Framework preset**: `Next.js`
   - **Production branch**: `main`
   - **Root directory**: `apps/web`
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `.next`
5. **Add environment variables** (from `.env`)
6. **Save and Deploy**

### Option 2: Fix GitHub Actions (For Auto-Deploy)

**Required GitHub Secrets** (Settings → Secrets and variables → Actions):

1. `CLOUDFLARE_API_TOKEN`
   - Get from: https://dash.cloudflare.com/profile/api-tokens
   - Create token with: **Edit** permissions for **Workers & Pages**

2. `CLOUDFLARE_ACCOUNT_ID`
   - Value: `38e10c60356f1836dc65116ac92ae0ef`
   - Already known from your account

**Updated Workflow** (`.github/workflows/deploy-cloudflare.yml`):
- Changed build command to `cd apps/web && pnpm build`
- Changed output directory to `apps/web/.next/standalone`
- Added `workingDirectory: apps/web`

---

## Next Steps

1. ✅ Updated GitHub Actions workflow
2. ⏳ Add GitHub secrets (see above)
3. ⏳ Create Cloudflare Pages project via dashboard OR let GitHub Actions deploy

---

## Account Info

- **Account**: dan@doorknockingsucks.com
- **Account ID**: `38e10c60356f1836dc65116ac92ae0ef`
- **Project Name**: `gringo-connection`

