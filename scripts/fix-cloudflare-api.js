#!/usr/bin/env node
/**
 * Fix Cloudflare Pages Build Configuration via API
 * Updates build output directory from 'out' to '.next'
 */

const https = require('https');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '38e10c60356f1836dc65116ac92ae0ef';
const PROJECT_NAME = 'gringo-connection';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ Error: CLOUDFLARE_API_TOKEN environment variable not set');
  console.error('Get it from: https://dash.cloudflare.com/profile/api-tokens');
  console.error('Create token with: Edit permissions for Workers & Pages');
  process.exit(1);
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function fixBuildConfig() {
  console.log('🔧 Fixing Cloudflare Pages build configuration...');
  console.log(`Project: ${PROJECT_NAME}`);
  console.log(`Account: ${ACCOUNT_ID}`);
  console.log('');

  try {
    // Get current config
    console.log('📥 Fetching current configuration...');
    const current = await makeRequest('GET', '');
    
    if (current.status !== 200) {
      console.error('❌ Failed to fetch current config:', current.data);
      process.exit(1);
    }

    console.log('✅ Current config retrieved');
    console.log('');

    // Update build config
    console.log('🔨 Updating build output directory to ".next"...');
    const update = await makeRequest('PATCH', '', {
      build_config: {
        build_command: 'pnpm install && cd apps/web && pnpm build',
        destination_dir: '.next',
        root_dir: 'apps/web',
      },
    });

    if (update.status === 200 && update.data.success) {
      console.log('✅ Build configuration updated successfully!');
      console.log('');
      console.log('📋 New configuration:');
      console.log(JSON.stringify(update.data.result.build_config, null, 2));
      console.log('');
      console.log('🚀 Next steps:');
      console.log('1. Go to: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/pages/view/gringo-connection');
      console.log('2. Retry the latest deployment');
      console.log('3. Wait 3-5 minutes for build to complete');
    } else {
      console.error('❌ Failed to update configuration');
      console.error('Status:', update.status);
      console.error('Response:', JSON.stringify(update.data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixBuildConfig();

