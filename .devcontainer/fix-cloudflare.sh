#!/bin/bash
# Fix Cloudflare Build Config - Run in Codespaces
# This script updates the build output directory via Cloudflare API

set -e

echo "🔧 Cloudflare Build Config Fixer"
echo "================================"
echo ""

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN not set"
    echo ""
    echo "To get your API token:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Edit Cloudflare Workers' template"
    echo "4. Add token to Codespaces secrets or run:"
    echo "   export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    read -p "Enter your Cloudflare API token: " API_TOKEN
    export CLOUDFLARE_API_TOKEN="$API_TOKEN"
fi

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-38e10c60356f1836dc65116ac92ae0ef}"
PROJECT_NAME="gringo-connection"

echo "📋 Configuration:"
echo "  Account ID: $ACCOUNT_ID"
echo "  Project: $PROJECT_NAME"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ curl is required but not installed"
    exit 1
fi

echo "🔨 Updating build configuration..."
RESPONSE=$(curl -s -X PATCH \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "build_config": {
      "build_command": "pnpm install && cd apps/web && pnpm build",
      "destination_dir": ".next",
      "root_dir": "apps/web"
    }
  }')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Build configuration updated successfully!"
    echo ""
    echo "📋 Updated config:"
    echo "$RESPONSE" | jq '.result.build_config' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "🚀 Next: Retrying latest deployment..."
    
    # Get latest deployment and retry
    DEPLOYMENTS=$(curl -s -X GET \
      "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments" \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json")
    
    DEPLOYMENT_ID=$(echo "$DEPLOYMENTS" | jq -r '.result[0].id' 2>/dev/null)
    
    if [ "$DEPLOYMENT_ID" != "null" ] && [ -n "$DEPLOYMENT_ID" ]; then
        echo "🔄 Retrying deployment: $DEPLOYMENT_ID"
        RETRY_RESPONSE=$(curl -s -X POST \
          "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${DEPLOYMENT_ID}/retry" \
          -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
          -H "Content-Type: application/json")
        
        if echo "$RETRY_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            echo "✅ Deployment retry initiated!"
            echo "Check status: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/pages/view/gringo-connection"
        else
            echo "⚠️  Could not retry deployment automatically"
            echo "Please retry manually in Cloudflare dashboard"
        fi
    fi
else
    echo "❌ Failed to update configuration"
    echo "Response: $RESPONSE"
    exit 1
fi

