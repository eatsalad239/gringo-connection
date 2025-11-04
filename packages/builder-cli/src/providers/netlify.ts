import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function deployNetlify(): Promise<void> {
  console.log('📦 Preparing Netlify deployment...');

  // Ensure netlify.toml exists
  const netlifyPath = join(process.cwd(), 'netlify.toml');
  try {
    readFileSync(netlifyPath, 'utf-8');
  } catch {
    const config = `[build]
  command = "pnpm --filter @app/web build"
  publish = "apps/web/.next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`;
    writeFileSync(netlifyPath, config);
    console.log('✅ Created netlify.toml');
  }

  // Build
  console.log('🔨 Building Next.js app...');
  execSync('pnpm --filter @app/web build', { stdio: 'inherit' });

  // Deploy
  console.log('🚀 Deploying to Netlify...');
  execSync('npx netlify deploy --prod', { stdio: 'inherit' });

  console.log('✅ Deployment complete!');
}

