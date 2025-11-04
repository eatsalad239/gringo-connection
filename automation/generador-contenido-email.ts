/**
 * Generador de Contenido de Email para Negocios de Medellín - Español Colombiano
 * Pre-genera contenido personalizado de emails usando IA para ejecución más rápida de campaña
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';
import { obtenerObjetivosCampanaEmailMedellin } from './medellin-negocios-scraper.js';

interface EmailGenerado {
  id_negocio: string;
  asunto: string;
  html: string;
  fecha_generacion: string;
  prioridad: number;
}

const DIR_CONTENIDO = join(process.cwd(), 'data');
const ARCHIVO_CONTENIDO_GENERADO = join(DIR_CONTENIDO, 'emails_generados.json');

// Cargar contenido generado
function cargarContenidoGenerado(): EmailGenerado[] {
  try {
    if (existsSync(ARCHIVO_CONTENIDO_GENERADO)) {
      return JSON.parse(readFileSync(ARCHIVO_CONTENIDO_GENERADO, 'utf-8'));
    }
  } catch (e) {
    console.warn('No se pudo cargar contenido generado:', e);
  }
  return [];
}

// Guardar contenido generado
function guardarContenidoGenerado(contenido: EmailGenerado[]): void {
  writeFileSync(ARCHIVO_CONTENIDO_GENERADO, JSON.stringify(contenido, null, 2));
}

// Generar contenido de email para un negocio
async function generarContenidoEmail(negocio: any): Promise<EmailGenerado> {
  const perfilIndustria = obtenerPerfilIndustria(negocio.industria);

  const prompt = `Genera contenido de email personalizado para un negocio de Medellín. Debe ser persuasivo, local y en español colombiano natural.

DATOS DEL NEGOCIO:
- Nombre: ${negocio.nombre}
- Industria: ${negocio.industria}
- Barrio: ${negocio.barrio}
- Estimación ingresos: ${negocio.estimacion_ingresos}
- Dueño operativo: ${negocio.dueno_operativo}
- Puntos de dolor específicos: ${negocio.puntos_dolor?.join(', ')}
- Servicios que necesita: ${negocio.servicios_necesarios?.join(', ')}

PERFIL DE INDUSTRIA (${negocio.industria}):
- Dolores comunes: ${perfilIndustria?.puntos_dolor?.join(', ')}
- Servicios necesarios: ${perfilIndustria?.servicios?.join(', ')}

El email debe:
1. ASUNTO atractivo (máximo 55 caracteres)
2. Saludo personalizado usando el nombre del negocio
3. Introducción que mencione específicamente el barrio de Medellín
4. Identificar 2-3 problemas específicos que enfrenta
5. Presentar soluciones concretas y medibles
6. Incluir prueba social de otros negocios de Medellín
7. Crear urgencia con oferta especial para el barrio
8. Llamados a acción claros (WhatsApp + email)
9. Cierre personal y local

Estilo: Profesional pero cercano, como un vecino paisa de Medellín ayudando a otro negocio local. Usar expresiones colombianas naturales cuando sea apropiado.

Output JSON:
{
  "asunto": "Asunto persuasivo y corto",
  "contenido": "Contenido completo del email en HTML simple"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 1200,
    temperature: 0.9,
    system: 'Eres un experto en marketing digital para Medellín. Creas contenido persuasivo en español colombiano que conecta emocionalmente con dueños de negocio locales.',
  });

  let asunto = `Transforme ${negocio.nombre} en Medellín`;
  let contenido = '';

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        asunto = parsed.asunto || asunto;
        contenido = parsed.contenido || '';
      }
    } catch (e) {
      console.warn('No se pudo analizar respuesta de generación de contenido:', e);
    }
  }

  // Contenido de respaldo
  if (!contenido) {
    contenido = generarContenidoRespaldo(negocio);
  }

  return {
    id_negocio: negocio.id,
    asunto,
    html: envolverEnHTML(contenido, negocio),
    fecha_generacion: new Date().toISOString(),
    prioridad: negocio.prioridad_contacto
  };
}

// Envolver contenido en estructura HTML
function envolverEnHTML(contenido: string, negocio: any): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  ${contenido}

  <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="margin: 0 0 10px 0;">¿Hablamos?</h3>
    <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +57 300 123 4567</p>
    <p style="margin: 5px 0;"><strong>Email:</strong> info@gringoconnection.com</p>
    <p style="margin: 5px 0;"><strong>Web:</strong> gringoconnection.com</p>
  </div>

  <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <p style="margin: 0; color: #856404;"><strong>Oferta Especial para ${negocio.barrio}:</strong> 25% descuento en los primeros 3 meses</p>
  </div>
</div>`;
}

// Obtener perfil de industria
function obtenerPerfilIndustria(industria: string) {
  const perfiles = {
    'restaurantes': {
      puntos_dolor: ['pedidos online lentos', 'reseñas negativas', 'menús desactualizados', 'clientes que no regresan'],
      servicios: ['sistema de pedidos online', 'gestión de reseñas', 'menú digital', 'programa de fidelización']
    },
    'clínicas': {
      puntos_dolor: ['pacientes que faltan', 'historias clínicas en papel', 'facturación lenta', 'competencia grande'],
      servicios: ['recordatorios automáticos', 'historia clínica digital', 'facturación automática', 'app para pacientes']
    },
    'abogados': {
      puntos_dolor: ['plazos vencidos', 'documentos perdidos', 'clientes que no pagan', 'gestión manual'],
      servicios: ['alertas de plazos', 'automatización documental', 'portal cliente', 'facturación jurídica']
    },
    'contadores': {
      puntos_dolor: ['declaraciones atrasadas', 'clientes que no entregan papeles', 'multas por errores', 'trabajo manual'],
      servicios: ['software contable', 'recordatorios automáticos', 'declaraciones automáticas', 'portal seguro']
    },
    'comercios': {
      puntos_dolor: ['inventario que no cuadra', 'clientes que no regresan', 'ventas estancadas', 'competencia online'],
      servicios: ['inventario automático', 'fidelización digital', 'tienda online', 'marketing local']
    }
  };

  return perfiles[industria.toLowerCase()] || perfiles['comercios'];
}

// Generar contenido de respaldo
function generarContenidoRespaldo(negocio: any): string {
  return `
<h2 style="color: #2563eb;">¡Hola ${negocio.nombre}!</h2>

<p>Soy Daniel de Gringo Connection, y estamos ayudando a negocios como el suyo en ${negocio.barrio}, Medellín, a crecer con tecnología digital.</p>

<p>Veo que ${negocio.nombre} es un ${negocio.industria} establecido en uno de los barrios más vibrantes de Medellín. ¿Está enfrentando desafíos como:</p>

<ul>
  <li>Clientes que no regresan</li>
  <li>Competencia cada vez más fuerte</li>
  <li>Gestión manual que consume tiempo</li>
  <li>Ventas que podrían ser mayores</li>
</ul>

<p>Podemos ayudar con soluciones específicas para ${negocio.industria} en Medellín:</p>

<ul>
  <li><strong>Sitio web profesional</strong> que atraiga más clientes locales</li>
  <li><strong>Automatización</strong> que libere su tiempo para enfocarse en el negocio</li>
  <li><strong>Marketing digital</strong> dirigido específicamente a ${negocio.barrio}</li>
  <li><strong>Herramientas de gestión</strong> que hagan todo más eficiente</li>
</ul>

<p>Ya hemos transformado más de 150 negocios en Medellín, y podemos hacer lo mismo por ${negocio.nombre}.</p>

<p>¿Le gustaría una reunión gratuita de 30 minutos para ver exactamente cómo podemos ayudar?</p>`;
}

// Generar contenido para múltiples negocios
export async function generarContenidoEmailLote(negocios: any[], tamanoLote: number = 50): Promise<EmailGenerado[]> {
  const contenidoExistente = cargarContenidoGenerado();
  const idsExistentes = new Set(contenidoExistente.map(c => c.id_negocio));

  const negociosNuevos = negocios.filter(neg => !idsExistentes.has(neg.id)).slice(0, tamanoLote);

  if (negociosNuevos.length === 0) {
    console.log('✅ Ya se ha generado contenido para todos los negocios objetivo');
    return contenidoExistente;
  }

  console.log(`📝 Generando contenido para ${negociosNuevos.length} negocios...`);

  const contenidoGenerado: EmailGenerado[] = [...contenidoExistente];

  for (const negocio of negociosNuevos) {
    try {
      console.log(`✍️  Generando para ${negocio.nombre}...`);
      const contenido = await generarContenidoEmail(negocio);
      contenidoGenerado.push(contenido);

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (e) {
      console.error(`💥 Error generando contenido para ${negocio.nombre}:`, e);
    }
  }

  guardarContenidoGenerado(contenidoGenerado);
  console.log(`💾 Contenido guardado: ${contenidoGenerado.length} emails generados`);

  return contenidoGenerado;
}

// Obtener contenido generado para un negocio
export function obtenerContenidoGenerado(idNegocio: string): EmailGenerado | null {
  const contenido = cargarContenidoGenerado();
  return contenido.find(c => c.id_negocio === idNegocio) || null;
}

// Función principal de generación de contenido
export async function ejecutarGeneracionContenido(tamanoLote: number = 50): Promise<void> {
  console.log('🎨 Iniciando generación de contenido de emails...');

  const negocios = obtenerObjetivosCampanaEmailMedellin();
  const generado = await generarContenidoEmailLote(negocios, tamanoLote);

  const estadisticas = {
    total_generado: generado.length,
    alta_prioridad: generado.filter(c => c.prioridad >= 8).length,
    media_prioridad: generado.filter(c => c.prioridad >= 6 && c.prioridad < 8).length,
    baja_prioridad: generado.filter(c => c.prioridad < 6).length
  };

  console.log(`📊 Estadísticas de contenido generado:`);
  console.log(`   📧 Total: ${estadisticas.total_generado}`);
  console.log(`   🔥 Alta prioridad: ${estadisticas.alta_prioridad}`);
  console.log(`   🟡 Media prioridad: ${estadisticas.media_prioridad}`);
  console.log(`   🟢 Baja prioridad: ${estadisticas.baja_prioridad}`);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tamanoLote = parseInt(process.argv[2] || '50');
  ejecutarGeneracionContenido(tamanoLote).catch(console.error);
}