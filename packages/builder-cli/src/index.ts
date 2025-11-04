#!/usr/bin/env node

import { Command } from 'commander';
import { deployCloudflare } from './providers/cloudflare.js';
import { deployNetlify } from './providers/netlify.js';

const program = new Command();

program
  .name('builder')
  .description('V0-clone builder CLI for Cloudflare/Netlify deployment')
  .version('1.0.0');

program
  .command('deploy')
  .description('Deploy to a provider')
  .argument('<provider>', 'Provider: cloudflare or netlify')
  .action(async (provider: string) => {
    console.log(`🚀 Deploying to ${provider}...`);

    if (provider === 'cloudflare') {
      await deployCloudflare();
    } else if (provider === 'netlify') {
      await deployNetlify();
    } else {
      console.error(`Unknown provider: ${provider}`);
      process.exit(1);
    }
  });

program.parse();

