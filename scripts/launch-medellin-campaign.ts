/**
 * Launch Medellín Business Outreach Campaign
 * Quick launcher for the complete Medellín-focused email campaign
 */

import { spawn } from 'child_process';
import { join } from 'path';

const SCRIPTS_DIR = join(process.cwd(), 'automation');

async function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', reject);
  });
}

async function launchMedellinCampaign(): Promise<void> {
  console.log('🚀 Iniciando Campaña Completa de Outreach para Medellín');
  console.log('==================================================');

  try {
    // Step 1: Start business scraping
    console.log('📊 Paso 1: Iniciando scraping de negocios de Medellín...');
    await runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-business-scraper.ts'), '5000']);

    // Step 2: Pre-generate email content
    console.log('📝 Paso 2: Generando contenido personalizado de emails...');
    await runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'email-content-generator.ts'), '200']);

    // Step 3: Start the swarm
    console.log('🤖 Paso 3: Iniciando swarm de envío masivo...');
    console.log('💡 El swarm enviará emails continuamente por 2 horas...');

    const swarmProcess = spawn('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-outreach-swarm.ts'), 'start', '120'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Wait for swarm to complete
    await new Promise((resolve, reject) => {
      swarmProcess.on('close', (code) => {
        if (code === 0) {
          resolve(void 0);
        } else {
          reject(new Error(`Swarm failed with code ${code}`));
        }
      });

      swarmProcess.on('error', reject);
    });

    console.log('🎯 ¡Campaña completada exitosamente!');
    console.log('📈 Revisa los logs para ver estadísticas detalladas');

  } catch (error) {
    console.error('💥 Error en la campaña:', error);
    process.exit(1);
  }
}

async function showCampaignStatus(): Promise<void> {
  console.log('📊 Estado de la Campaña de Medellín');
  console.log('==================================');

  try {
    await runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-outreach-swarm.ts'), 'status']);
  } catch (error) {
    console.error('Error obteniendo estado:', error);
  }
}

async function stopCampaign(): Promise<void> {
  console.log('🛑 Deteniendo Campaña de Medellín...');

  try {
    await runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-outreach-swarm.ts'), 'stop']);
    console.log('✅ Campaña detenida');
  } catch (error) {
    console.error('Error deteniendo campaña:', error);
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'start') {
  launchMedellinCampaign().catch(console.error);
} else if (command === 'status') {
  showCampaignStatus().catch(console.error);
} else if (command === 'stop') {
  stopCampaign().catch(console.error);
} else if (command === 'scrape') {
  const count = process.argv[3] || '5000';
  console.log(`📊 Scraping ${count} negocios de Medellín...`);
  runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-business-scraper.ts'), count]).catch(console.error);
} else if (command === 'generate') {
  const count = process.argv[3] || '200';
  console.log(`📝 Generando contenido para ${count} emails...`);
  runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'email-content-generator.ts'), count]).catch(console.error);
} else if (command === 'swarm') {
  const duration = process.argv[3] || '120';
  console.log(`🤖 Iniciando swarm por ${duration} minutos...`);
  runCommand('npx', ['tsx', join(SCRIPTS_DIR, 'medellin-outreach-swarm.ts'), 'start', duration]).catch(console.error);
} else {
  console.log('🚀 Campaña de Outreach para Negocios de Medellín');
  console.log('');
  console.log('Uso:');
  console.log('  npm run medellin start           # Iniciar campaña completa');
  console.log('  npm run medellin status          # Ver estado de la campaña');
  console.log('  npm run medellin stop            # Detener campaña');
  console.log('  npm run medellin scrape [count]  # Solo scraping (default 5000)');
  console.log('  npm run medellin generate [count] # Solo generación contenido (default 200)');
  console.log('  npm run medellin swarm [min]     # Solo swarm (default 120min)');
  console.log('');
  console.log('Ejemplos:');
  console.log('  npm run medellin scrape 10000    # Scrap 10k negocios');
  console.log('  npm run medellin swarm 60        # Swarm por 1 hora');
}