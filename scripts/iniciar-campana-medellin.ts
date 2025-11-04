/**
 * Iniciar Campaña de Outreach para Negocios de Medellín
 * Launcher rápido para la campaña completa de email enfocada en Medellín
 */

import { spawn } from 'child_process';
import { join } from 'path';

const DIR_SCRIPTS = join(process.cwd(), 'automation');

async function ejecutarComando(comando: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const proceso = spawn(comando, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    proceso.on('close', (codigo) => {
      if (codigo === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código ${codigo}`));
      }
    });

    proceso.on('error', reject);
  });
}

async function iniciarCampanaMedellin(): Promise<void> {
  console.log('🚀 Iniciando Campaña Completa de Outreach para Medellín');
  console.log('==================================================');

  try {
    // Paso 1: Iniciar extracción de negocios
    console.log('📊 Paso 1: Iniciando extracción de negocios de Medellín...');
    await ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'medellin-negocios-scraper.ts'), '2000']);

    // Paso 2: Pre-generar contenido de emails
    console.log('📝 Paso 2: Generando contenido personalizado de emails...');
    await ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'generador-contenido-email.ts'), '200']);

    // Paso 3: Iniciar el swarm
    console.log('🤖 Paso 3: Iniciando swarm de envío masivo...');
    console.log('💡 El swarm enviará emails continuamente por 2 horas...');

    const procesoSwarm = spawn('npx', ['tsx', join(DIR_SCRIPTS, 'swarm-medellin-outreach.ts'), 'iniciar', '120'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Esperar a que el swarm complete
    await new Promise((resolve, reject) => {
      procesoSwarm.on('close', (codigo) => {
        if (codigo === 0) {
          resolve(void 0);
        } else {
          reject(new Error(`Swarm falló con código ${codigo}`));
        }
      });

      procesoSwarm.on('error', reject);
    });

    console.log('🎯 ¡Campaña completada exitosamente!');
    console.log('📈 Revisa los logs para ver estadísticas detalladas');

  } catch (error) {
    console.error('💥 Error en la campaña:', error);
    process.exit(1);
  }
}

async function mostrarEstadoCampana(): Promise<void> {
  console.log('📊 Estado de la Campaña de Medellín');
  console.log('==================================');

  try {
    await ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'swarm-medellin-outreach.ts'), 'estado']);
  } catch (error) {
    console.error('Error obteniendo estado:', error);
  }
}

async function detenerCampana(): Promise<void> {
  console.log('🛑 Deteniendo Campaña de Medellín...');

  try {
    await ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'swarm-medellin-outreach.ts'), 'detener']);
    console.log('✅ Campaña detenida');
  } catch (error) {
    console.error('Error deteniendo campaña:', error);
  }
}

// Interfaz CLI
const comando = process.argv[2];

if (comando === 'iniciar') {
  iniciarCampanaMedellin().catch(console.error);
} else if (comando === 'estado') {
  mostrarEstadoCampana().catch(console.error);
} else if (comando === 'detener') {
  detenerCampana().catch(console.error);
} else if (comando === 'extraer') {
  const cantidad = process.argv[3] || '2000';
  console.log(`📊 Extrayendo ${cantidad} negocios de Medellín...`);
  ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'medellin-negocios-scraper.ts'), cantidad]).catch(console.error);
} else if (comando === 'generar') {
  const cantidad = process.argv[3] || '200';
  console.log(`📝 Generando contenido para ${cantidad} emails...`);
  ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'generador-contenido-email.ts'), cantidad]).catch(console.error);
} else if (comando === 'swarm') {
  const duracion = process.argv[3] || '120';
  console.log(`🤖 Iniciando swarm por ${duracion} minutos...`);
  ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'swarm-medellin-outreach.ts'), 'iniciar', duracion]).catch(console.error);
} else if (comando === 'email') {
  const lote = process.argv[3] || '50';
  console.log(`📧 Enviando lote de ${lote} emails...`);
  ejecutarComando('npx', ['tsx', join(DIR_SCRIPTS, 'campana-email-medellin.ts'), lote]).catch(console.error);
} else {
  console.log('🚀 Campaña de Outreach para Negocios de Medellín');
  console.log('');
  console.log('Uso:');
  console.log('  npx tsx iniciar-campana-medellin.ts iniciar           # Iniciar campaña completa');
  console.log('  npx tsx iniciar-campana-medellin.ts estado            # Ver estado de la campaña');
  console.log('  npx tsx iniciar-campana-medellin.ts detener           # Detener campaña');
  console.log('  npx tsx iniciar-campana-medellin.ts extraer [count]   # Solo extracción (default 2000)');
  console.log('  npx tsx iniciar-campana-medellin.ts generar [count]   # Solo generación contenido (default 200)');
  console.log('  npx tsx iniciar-campana-medellin.ts swarm [min]       # Solo swarm (default 120min)');
  console.log('  npx tsx iniciar-campana-medellin.ts email [batch]     # Solo envío emails (default 50)');
  console.log('');
  console.log('Ejemplos:');
  console.log('  npx tsx iniciar-campana-medellin.ts extraer 5000      # Extraer 5k negocios');
  console.log('  npx tsx iniciar-campana-medellin.ts swarm 60          # Swarm por 1 hora');
  console.log('  npx tsx iniciar-campana-medellin.ts email 25          # Enviar 25 emails');
}