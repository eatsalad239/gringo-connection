/**
 * Swarm de Outreach para Negocios de Medellín - Enfoque Español Colombiano
 * Ejecuta múltiples agentes simultáneamente para maximizar velocidad de campaña de email para negocios de Medellín
 * Extrae datos, genera contenido, y envía emails en paralelo
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { obtenerEstadisticasCampanaMedellin } from './campana-email-medellin.js';

const DIR_SCRIPTS = join(process.cwd(), 'automation');
const DIR_LOGS = join(process.cwd(), 'logs');

if (!existsSync(DIR_LOGS)) {
  mkdirSync(DIR_LOGS, { recursive: true });
}

interface AgenteSwarm {
  nombre: string;
  script: string;
  args: string[];
  instancias: number;
  procesos: any[];
}

class SwarmOutreachMedellin {
  private agentes: AgenteSwarm[] = [];
  private ejecutandose = false;

  constructor() {
    this.configurarAgentes();
  }

  private configurarAgentes() {
    // Agentes de extracción - ejecutan continuamente para construir base de datos de Medellín
    this.agentes.push({
      nombre: 'scraper-medellin-1',
      script: 'medellin-negocios-scraper.ts',
      args: ['2000'], // Extraer 2000 negocios por scraper
      instancias: 4, // Ejecutar 4 scrapers en paralelo para Medellín
      procesos: []
    });

    // Agentes de campaña de email - envían emails a negocios de Medellín
    this.agentes.push({
      nombre: 'email-medellin-1',
      script: 'campana-email-medellin.ts',
      args: ['30'], // Enviar 30 emails por lote (más rápido para enfoque Medellín)
      instancias: 12, // Ejecutar 12 enviadores de email en paralelo
      procesos: []
    });

    // Agentes de generación de contenido - pre-generan emails personalizados en español
    this.agentes.push({
      nombre: 'contenido-medellin-1',
      script: 'generador-contenido-email.ts',
      args: ['60'], // Generar 60 emails por lote
      instancias: 6, // Ejecutar 6 generadores de contenido
      procesos: []
    });
  }

  private async ejecutarProceso(agente: AgenteSwarm, idInstancia: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const archivoLog = join(DIR_LOGS, `${agente.nombre}-instancia-${idInstancia}.log`);
      const proceso = spawn('npx', ['tsx', join(DIR_SCRIPTS, agente.script), ...agente.args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      const streamLog = require('fs').createWriteStream(archivoLog, { flags: 'a' });
      proceso.stdout.pipe(streamLog);
      proceso.stderr.pipe(streamLog);

      proceso.on('close', (codigo) => {
        streamLog.end();
        if (codigo === 0) {
          console.log(`✅ ${agente.nombre} instancia ${idInstancia} completada exitosamente`);
          resolve();
        } else {
          console.warn(`⚠️  ${agente.nombre} instancia ${idInstancia} terminó con código ${codigo}`);
          resolve(); // No rechazar, permitir que el swarm continúe
        }
      });

      proceso.on('error', (error) => {
        console.error(`💥 ${agente.nombre} instancia ${idInstancia} error:`, error);
        streamLog.end();
        resolve(); // Continuar operación del swarm
      });

      agente.procesos.push(proceso);
    });
  }

  private async ejecutarInstanciasAgente(agente: AgenteSwarm): Promise<void> {
    const promesas = [];

    for (let i = 0; i < agente.instancias; i++) {
      promesas.push(this.ejecutarProceso(agente, i + 1));

      // Escalona inicios para evitar sobrecargar APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await Promise.all(promesas);
  }

  public async iniciarSwarm(minutosDuracion: number = 120): Promise<void> {
    if (this.ejecutandose) {
      console.log('🚫 El swarm ya está ejecutándose');
      return;
    }

    this.ejecutandose = true;
    const tiempoFin = Date.now() + (minutosDuracion * 60 * 1000);

    console.log(`🚀 Iniciando Swarm de Outreach para Medellín por ${minutosDuracion} minutos`);
    console.log(`📊 Agentes configurados: ${this.agentes.length}`);
    console.log(`🔄 Procesos paralelos totales: ${this.agentes.reduce((sum, agente) => sum + agente.instancias, 0)}`);

    // Mostrar estadísticas iniciales
    const estadisticasIniciales = obtenerEstadisticasCampanaMedellin();
    console.log(`📈 Estadísticas Iniciales: ${estadisticasIniciales.total_enviados} enviados, ${estadisticasIniciales.enviados_hoy} hoy`);

    try {
      // Ejecutar todos los agentes en paralelo
      const promesasAgentes = this.agentes.map(agente => this.ejecutarInstanciasAgente(agente));

      // Monitorear progreso cada 3 minutos (más frecuente para enfoque Medellín)
      const intervaloMonitoreo = setInterval(() => {
        const estadisticas = obtenerEstadisticasCampanaMedellin();
        const minutosRestantes = Math.max(0, Math.round((tiempoFin - Date.now()) / 60000));

        console.log(`📊 Progreso (${minutosRestantes}min restantes):`);
        console.log(`   📧 Emails enviados hoy: ${estadisticas.enviados_hoy}`);
        console.log(`   📨 Emails enviados total: ${estadisticas.total_enviados}`);
        console.log(`   ❌ Emails fallidos: ${estadisticas.total_fallidos}`);
        console.log(`   🏙️  Top barrios: ${estadisticas.top_barrios.join(', ')}`);
        console.log(`   💼 Top industrias: ${estadisticas.top_industrias.join(', ')}`);
        console.log(`   📱 Cuentas usadas: ${estadisticas.cuentas_usadas}`);

        if (Date.now() >= tiempoFin) {
          console.log('⏰ Duración del swarm alcanzada, iniciando apagado...');
          clearInterval(intervaloMonitoreo);
        }
      }, 3 * 60 * 1000); // Cada 3 minutos

      // Esperar por duración o parada manual
      await Promise.race([
        Promise.all(promesasAgentes),
        new Promise(resolve => setTimeout(resolve, minutosDuracion * 60 * 1000))
      ]);

      clearInterval(intervaloMonitoreo);

    } finally {
      await this.detenerSwarm();
    }

    const estadisticasFinales = obtenerEstadisticasCampanaMedellin();
    console.log(`\n🎯 Swarm Completado!`);
    console.log(`📊 Resultados Finales:`);
    console.log(`   📧 Total emails enviados: ${estadisticasFinales.total_enviados}`);
    console.log(`   📨 Enviados hoy: ${estadisticasFinales.enviados_hoy}`);
    console.log(`   ❌ Fallidos: ${estadisticasFinales.total_fallidos}`);
    console.log(`   📱 Cuentas usadas: ${estadisticasFinales.cuentas_usadas}`);
    console.log(`   🏙️  Barrios alcanzados: ${estadisticasFinales.top_barrios.join(', ')}`);
    console.log(`   💼 Industrias contactadas: ${estadisticasFinales.top_industrias.join(', ')}`);
  }

  public async detenerSwarm(): Promise<void> {
    console.log('🛑 Deteniendo Swarm de Outreach de Medellín...');

    for (const agente of this.agentes) {
      for (const proceso of agente.procesos) {
        if (proceso && !proceso.killed) {
          proceso.kill('SIGTERM');

          // Esperar apagado graceful
          await new Promise(resolve => {
            const timeout = setTimeout(() => {
              proceso.kill('SIGKILL'); // Forzar cierre si es necesario
              resolve(void 0);
            }, 5000);

            proceso.on('close', () => {
              clearTimeout(timeout);
              resolve(void 0);
            });
          });
        }
      }
      agente.procesos = [];
    }

    this.ejecutandose = false;
    console.log('✅ Swarm detenido exitosamente');
  }

  public obtenerEstado(): any {
    const estadisticas = obtenerEstadisticasCampanaMedellin();
    return {
      ejecutandose: this.ejecutandose,
      agentes: this.agentes.map(agente => ({
        nombre: agente.nombre,
        instancias: agente.instancias,
        procesos_activos: agente.procesos.filter(p => p && !p.killed).length
      })),
      estadisticas_campana: estadisticas
    };
  }
}

// Crear e exportar instancia del swarm
export const swarmOutreachMedellin = new SwarmOutreachMedellin();

// Interfaz CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const comando = process.argv[2];
  const duracion = parseInt(process.argv[3] || '120');

  if (comando === 'iniciar') {
    swarmOutreachMedellin.iniciarSwarm(duracion).catch(console.error);
  } else if (comando === 'detener') {
    swarmOutreachMedellin.detenerSwarm().catch(console.error);
  } else if (comando === 'estado') {
    const estado = swarmOutreachMedellin.obtenerEstado();
    console.log(JSON.stringify(estado, null, 2));
  } else {
    console.log('🚀 Swarm de Outreach para Negocios de Medellín');
    console.log('');
    console.log('Uso:');
    console.log('  npx tsx swarm-medellin-outreach.ts iniciar [minutos_duracion]  # Iniciar swarm (default 120min)');
    console.log('  npx tsx swarm-medellin-outreach.ts detener                       # Detener swarm');
    console.log('  npx tsx swarm-medellin-outreach.ts estado                       # Mostrar estado');
    console.log('');
    console.log('Ejemplos:');
    console.log('  npx tsx swarm-medellin-outreach.ts iniciar 60                   # Swarm por 1 hora');
  }
}