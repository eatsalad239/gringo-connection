/**
 * Colombian Business Outreach Swarm
 * Runs multiple agents simultaneously to maximize email campaign speed
 * Scrapes data, generates content, and sends emails in parallel
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getCampaignStats } from './colombian-email-campaign.js';

const SCRIPTS_DIR = join(process.cwd(), 'automation');
const LOGS_DIR = join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

interface SwarmAgent {
  name: string;
  script: string;
  args: string[];
  instances: number;
  processes: any[];
}

class ColombianOutreachSwarm {
  private agents: SwarmAgent[] = [];
  private running = false;

  constructor() {
    this.setupAgents();
  }

  private setupAgents() {
    // Scraper agents - run continuously to build database
    this.agents.push({
      name: 'business-scraper-1',
      script: 'colombian-business-scraper.ts',
      args: ['1000'], // Target 1000 businesses per scraper
      instances: 3, // Run 3 scrapers in parallel
      processes: []
    });

    // Email campaign agents - send emails
    this.agents.push({
      name: 'email-campaign-1',
      script: 'colombian-email-campaign.ts',
      args: ['25'], // Send 25 emails per batch
      instances: 10, // Run 10 email senders in parallel
      processes: []
    });

    // Content generation agents - pre-generate personalized emails
    this.agents.push({
      name: 'content-generator-1',
      script: 'email-content-generator.ts',
      args: ['50'], // Generate 50 emails per batch
      instances: 5, // Run 5 content generators
      processes: []
    });
  }

  private async runProcess(agent: SwarmAgent, instanceId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const logFile = join(LOGS_DIR, `${agent.name}-instance-${instanceId}.log`);
      const process = spawn('npx', ['tsx', join(SCRIPTS_DIR, agent.script), ...agent.args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      // Log output
      const logStream = require('fs').createWriteStream(logFile, { flags: 'a' });
      process.stdout.pipe(logStream);
      process.stderr.pipe(logStream);

      process.on('close', (code) => {
        logStream.end();
        if (code === 0) {
          console.log(`✅ ${agent.name} instance ${instanceId} completed successfully`);
          resolve();
        } else {
          console.warn(`⚠️  ${agent.name} instance ${instanceId} exited with code ${code}`);
          resolve(); // Don't reject, let swarm continue
        }
      });

      process.on('error', (error) => {
        console.error(`💥 ${agent.name} instance ${instanceId} error:`, error);
        logStream.end();
        resolve(); // Continue swarm operation
      });

      // Store process reference for cleanup
      agent.processes.push(process);
    });
  }

  private async runAgentInstances(agent: SwarmAgent): Promise<void> {
    const promises = [];

    for (let i = 0; i < agent.instances; i++) {
      promises.push(this.runProcess(agent, i + 1));

      // Stagger starts to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await Promise.all(promises);
  }

  public async startSwarm(durationMinutes: number = 60): Promise<void> {
    if (this.running) {
      console.log('🚫 Swarm is already running');
      return;
    }

    this.running = true;
    const endTime = Date.now() + (durationMinutes * 60 * 1000);

    console.log(`🚀 Starting Colombian Outreach Swarm for ${durationMinutes} minutes`);
    console.log(`📊 Agents configured: ${this.agents.length}`);
    console.log(`🔄 Total parallel processes: ${this.agents.reduce((sum, agent) => sum + agent.instances, 0)}`);

    // Show initial stats
    const initialStats = getCampaignStats();
    console.log(`📈 Initial Campaign Stats: ${initialStats.total_sent} sent, ${initialStats.sent_today} today`);

    try {
      // Run all agents in parallel
      const agentPromises = this.agents.map(agent => this.runAgentInstances(agent));

      // Monitor progress every 5 minutes
      const monitorInterval = setInterval(() => {
        const stats = getCampaignStats();
        const timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 60000));

        console.log(`📊 Progress Update (${timeLeft}min left):`);
        console.log(`   📧 Emails sent today: ${stats.sent_today}`);
        console.log(`   📨 Total emails sent: ${stats.total_sent}`);
        console.log(`   ❌ Failed emails: ${stats.total_failed}`);
        console.log(`   🎯 Top industries: ${stats.top_industries.join(', ')}`);
        console.log(`   📱 Email accounts used: ${stats.accounts_used}`);

        if (Date.now() >= endTime) {
          console.log('⏰ Swarm duration reached, initiating shutdown...');
          clearInterval(monitorInterval);
        }
      }, 5 * 60 * 1000); // Every 5 minutes

      // Wait for duration or manual stop
      await Promise.race([
        Promise.all(agentPromises),
        new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000))
      ]);

      clearInterval(monitorInterval);

    } finally {
      await this.stopSwarm();
    }

    const finalStats = getCampaignStats();
    console.log(`\n🎯 Swarm Complete!`);
    console.log(`📊 Final Results:`);
    console.log(`   📧 Total emails sent: ${finalStats.total_sent}`);
    console.log(`   📨 Sent today: ${finalStats.sent_today}`);
    console.log(`   ❌ Failed: ${finalStats.total_failed}`);
    console.log(`   📱 Accounts used: ${finalStats.accounts_used}`);
    console.log(`   🎯 Top industries reached: ${finalStats.top_industries.join(', ')}`);
  }

  public async stopSwarm(): Promise<void> {
    console.log('🛑 Stopping Colombian Outreach Swarm...');

    for (const agent of this.agents) {
      for (const process of agent.processes) {
        if (process && !process.killed) {
          process.kill('SIGTERM');

          // Wait for graceful shutdown
          await new Promise(resolve => {
            const timeout = setTimeout(() => {
              process.kill('SIGKILL'); // Force kill if needed
              resolve(void 0);
            }, 5000);

            process.on('close', () => {
              clearTimeout(timeout);
              resolve(void 0);
            });
          });
        }
      }
      agent.processes = [];
    }

    this.running = false;
    console.log('✅ Swarm stopped successfully');
  }

  public getStatus(): any {
    const stats = getCampaignStats();
    return {
      running: this.running,
      agents: this.agents.map(agent => ({
        name: agent.name,
        instances: agent.instances,
        active_processes: agent.processes.filter(p => p && !p.killed).length
      })),
      campaign_stats: stats
    };
  }
}

// Create and export swarm instance
export const colombianOutreachSwarm = new ColombianOutreachSwarm();

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const duration = parseInt(process.argv[3] || '60');

  if (command === 'start') {
    colombianOutreachSwarm.startSwarm(duration).catch(console.error);
  } else if (command === 'stop') {
    colombianOutreachSwarm.stopSwarm().catch(console.error);
  } else if (command === 'status') {
    const status = colombianOutreachSwarm.getStatus();
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log('Usage:');
    console.log('  npm run swarm start [duration_minutes]  # Start swarm (default 60min)');
    console.log('  npm run swarm stop                       # Stop swarm');
    console.log('  npm run swarm status                     # Show status');
  }
}