#!/bin/bash
# Fix Cloudflare Pages Build Configuration via API
# Updates build output directory from 'out' to '.next'

set -e

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-38e10c60356f1836dc65116ac92ae0ef}"
PROJECT_NAME="gringo-connection"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"

if [ -z "$API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
    echo "Get it from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Create token with: Edit permissions for Workers & Pages"
    exit 1
fi

echo "🔧 Fixing Cloudflare Pages build configuration..."
echo "Project: $PROJECT_NAME"
echo "Account: $ACCOUNT_ID"

# Get current project configuration
echo "📥 Fetching current configuration..."
CURRENT_CONFIG=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json")

echo "Current config retrieved"

# Update build configuration
echo "🔨 Updating build output directory to '.next'..."
RESPONSE=$(curl -s -X PATCH \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "build_config": {
      "build_command": "pnpm install && cd apps/web && pnpm build",
      "destination_dir": ".next",
      "root_dir": "apps/web"
    }
  }')

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Build configuration updated successfully!"
    echo "📋 New configuration:"
    echo "$RESPONSE" | jq '.result.build_config' 2>/dev/null || echo "$RESPONSE"
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Go to: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/pages/view/gringo-connection"
    echo "2. Retry the latest deployment"
    echo "3. Wait 3-5 minutes for build to complete"
else
    echo "❌ Failed to update configuration"
    echo "Response: $RESPONSE"
    exit 1
fi

