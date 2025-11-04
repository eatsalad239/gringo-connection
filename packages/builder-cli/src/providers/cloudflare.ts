import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function deployCloudflare(): Promise<void> {
  console.log('📦 Preparing Cloudflare deployment...');

  // Create wrangler.toml if it doesn't exist
  const wranglerPath = join(process.cwd(), 'wrangler.toml');
  try {
    readFileSync(wranglerPath, 'utf-8');
  } catch {
    const sample = readFileSync(
      join(process.cwd(), 'wrangler.sample.toml'),
      'utf-8'
    );
    writeFileSync(wranglerPath, sample);
    console.log('✅ Created wrangler.toml from sample');
  }

  // Build Next.js app
  console.log('🔨 Building Next.js app...');
  execSync('pnpm --filter @app/web build', { stdio: 'inherit' });

  // Deploy with Wrangler
  console.log('🚀 Deploying to Cloudflare Pages...');
  execSync('npx wrangler pages deploy apps/web/.next', { stdio: 'inherit' });

  console.log('✅ Deployment complete!');
}

