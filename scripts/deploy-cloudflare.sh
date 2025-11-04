#!/bin/bash
# Deploy to Cloudflare Pages using Wrangler CLI

set -e

echo "🚀 Deploying to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Navigate to web app directory
cd apps/web

# Build the app
echo "📦 Building Next.js app..."
pnpm install
pnpm build

# Check if we're logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare..."
    wrangler login
fi

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy .next \
    --project-name=gringo-connection \
    --compatibility-date=2024-01-01

echo "✅ Deployment complete!"
echo "🌐 Check: https://gringo-connection.pages.dev"

