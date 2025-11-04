#!/bin/bash

# Cloudflare Setup Script
# This script helps automate Cloudflare setup

echo "☁️ Cloudflare Setup Helper"
echo "=========================="
echo ""
echo "Domain: gringoconection.com"
echo ""
echo "Steps:"
echo "1. Create email: info@gringoconection.com"
echo "2. Sign up for Cloudflare"
echo "3. Add domain"
echo "4. Update nameservers"
echo "5. Configure DNS records"
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI ready"
echo ""
echo "Next steps:"
echo "1. Run: wrangler login"
echo "2. Configure wrangler.toml"
echo "3. Set up DNS records in Cloudflare dashboard"

