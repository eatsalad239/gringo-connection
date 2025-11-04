#!/bin/bash

# Vercel Setup Script
# This script helps automate Vercel deployment setup

echo "🚀 Vercel Setup Helper"
echo "======================"
echo ""
echo "Domain: gringoconection.com"
echo ""
echo "Steps:"
echo "1. Sign in to Vercel (browser will open)"
echo "2. Import GitHub repo"
echo "3. Add domain"
echo "4. Configure environment variables"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""
echo "Next steps:"
echo "1. Run: vercel login"
echo "2. Run: vercel link"
echo "3. Run: vercel --prod"
echo ""
echo "Or use the browser to set up through Vercel dashboard"

