/**
 * Medellín Business Outreach Swarm - Colombian Spanish Focus
 * Runs multiple agents simultaneously to maximize email campaign speed for Medellín businesses
 * Scrapes data, generates content, and sends emails in parallel
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getMedellinCampaignStats } from './medellin-email-campaign.js';

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

class MedellinOutreachSwarm {
  private agents: SwarmAgent[] = [];
  private running = false;

  constructor() {
    this.setupAgents();
  }

  private setupAgents() {
    // Scraper agents - run continuously to build Medellín database
    this.agents.push({
      name: 'medellin-scraper-1',
      script: 'medellin-business-scraper.ts',
      args: ['2000'], // Target 2000 businesses per scraper
      instances: 4, // Run 4 scrapers in parallel for Medellín
      processes: []
    });

    // Email campaign agents - send emails to Medellín businesses
    this.agents.push({
      name: 'medellin-email-1',
      script: 'medellin-email-campaign.ts',
      args: ['30'], // Send 30 emails per batch (faster for Medellín focus)
      instances: 12, // Run 12 email senders in parallel
      processes: []
    });

    // Content generation agents - pre-generate personalized emails in Spanish
    this.agents.push({
      name: 'medellin-content-1',
      script: 'email-content-generator.ts',
      args: ['60'], // Generate 60 emails per batch
      instances: 6, // Run 6 content generators
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
          console.log(`✅ ${agent.name} instancia ${instanceId} completada exitosamente`);
          resolve();
        } else {
          console.warn(`⚠️  ${agent.name} instancia ${instanceId} terminó con código ${code}`);
          resolve(); // Don't reject, let swarm continue
        }
      });

      process.on('error', (error) => {
        console.error(`💥 ${agent.name} instancia ${instanceId} error:`, error);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await Promise.all(promises);
  }

  public async startSwarm(durationMinutes: number = 120): Promise<void> {
    if (this.running) {
      console.log('🚫 El swarm ya está ejecutándose');
      return;
    }

    this.running = true;
    const endTime = Date.now() + (durationMinutes * 60 * 1000);

    console.log(`🚀 Iniciando Swarm de Outreach para Medellín por ${durationMinutes} minutos`);
    console.log(`📊 Agentes configurados: ${this.agents.length}`);
    console.log(`🔄 Procesos paralelos totales: ${this.agents.reduce((sum, agent) => sum + agent.instances, 0)}`);

    // Show initial stats
    const initialStats = getMedellinCampaignStats();
    console.log(`📈 Estadísticas Iniciales: ${initialStats.total_sent} enviados, ${initialStats.sent_today} hoy`);

    try {
      // Run all agents in parallel
      const agentPromises = this.agents.map(agent => this.runAgentInstances(agent));

      // Monitor progress every 3 minutes (more frequent for Medellín focus)
      const monitorInterval = setInterval(() => {
        const stats = getMedellinCampaignStats();
        const timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 60000));

        console.log(`📊 Progreso (${timeLeft}min restantes):`);
        console.log(`   📧 Emails enviados hoy: ${stats.sent_today}`);
        console.log(`   📨 Emails enviados total: ${stats.total_sent}`);
        console.log(`   ❌ Emails fallidos: ${stats.total_failed}`);
        console.log(`   🏙️  Top barrios: ${stats.top_neighborhoods.join(', ')}`);
        console.log(`   💼 Top industrias: ${stats.top_industries.join(', ')}`);
        console.log(`   📱 Cuentas usadas: ${stats.accounts_used}`);

        if (Date.now() >= endTime) {
          console.log('⏰ Duración del swarm alcanzada, iniciando apagado...');
          clearInterval(monitorInterval);
        }
      }, 3 * 60 * 1000); // Every 3 minutes

      // Wait for duration or manual stop
      await Promise.race([
        Promise.all(agentPromises),
        new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000))
      ]);

      clearInterval(monitorInterval);

    } finally {
      await this.stopSwarm();
    }

    const finalStats = getMedellinCampaignStats();
    console.log(`\n🎯 Swarm Completado!`);
    console.log(`📊 Resultados Finales:`);
    console.log(`   📧 Total emails enviados: ${finalStats.total_sent}`);
    console.log(`   📨 Enviados hoy: ${finalStats.sent_today}`);
    console.log(`   ❌ Fallidos: ${finalStats.total_failed}`);
    console.log(`   📱 Cuentas usadas: ${finalStats.accounts_used}`);
    console.log(`   🏙️  Barrios alcanzados: ${finalStats.top_neighborhoods.join(', ')}`);
    console.log(`   💼 Industrias contactadas: ${finalStats.top_industries.join(', ')}`);
  }

  public async stopSwarm(): Promise<void> {
    console.log('🛑 Deteniendo Swarm de Outreach de Medellín...');

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
    console.log('✅ Swarm detenido exitosamente');
  }

  public getStatus(): any {
    const stats = getMedellinCampaignStats();
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
export const medellinOutreachSwarm = new MedellinOutreachSwarm();

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const duration = parseInt(process.argv[3] || '120');

  if (command === 'start') {
    medellinOutreachSwarm.startSwarm(duration).catch(console.error);
  } else if (command === 'stop') {
    medellinOutreachSwarm.stopSwarm().catch(console.error);
  } else if (command === 'status') {
    const status = medellinOutreachSwarm.getStatus();
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log('Uso:');
    console.log('  npm run medellin-swarm start [duracion_minutos]  # Iniciar swarm (default 120min)');
    console.log('  npm run medellin-swarm stop                       # Detener swarm');
    console.log('  npm run medellin-swarm status                     # Mostrar estado');
  }
}