/**
 * Colombian Follow-Up Agent
 * Handles automated follow-up sequences for non-responders
 * Sends 3-email sequence: Day 3, Day 7, Day 14
 * All in SPANISH
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

const EDDY_PHONE = '+505 5780 2643';

interface CorreoSeguimiento {
  correoOriginal: string;
  nombreNegocio: string;
  industria: string;
  asuntoOriginal: string;
  día: 3 | 7 | 14;
  tipo: 'recordatorio' | 'urgencia' | 'ultimaoportunidad';
  correoSeguimiento: string;
  asunto: string;
  cuerpo: string;
  estado: 'enviado' | 'fallido' | 'saltado';
  fechaEnvío?: Date;
}

interface ConfiguracionSeguimiento {
  maxDías: number;
  reintentosFallidos: number;
  incluirOfertaEspecial: boolean;
}

// Generar correo de seguimiento personalizado
async function generarCorreoSeguimiento(
  correoOriginal: CorreoSeguimiento,
  config: ConfiguracionSeguimiento
): Promise<{ asunto: string; cuerpo: string }> {
  const prompt = `Eres un experto en copywriting B2B en español. Genera un correo de seguimiento profesional y persuasivo EN ESPAÑOL.

Contexto:
- Correo anterior enviado hace ${correoOriginal.día} días sobre: ${correoOriginal.asuntoOriginal}
- No hubo respuesta del negocio
- Industria: ${correoOriginal.industria}
- Tipo de seguimiento: ${correoOriginal.tipo}

Requisitos del correo:
1. NO repetir el correo anterior - NUEVO contenido
2. Recordar que hemos trabajado con otros ${correoOriginal.industria} en Colombia
3. Si es día 7 o 14: Ofrecer descuento o bono (ej: "Primera consulta gratis")
4. Crear urgencia sin ser agresivo
5. Incluir CTA específica: ${correoOriginal.día === 3 ? '"Agendemos una llamada"' : correoOriginal.día === 7 ? '"Aprovecha esta oferta especial"' : '"Última oportunidad para esta propuesta"'}
6. Todo en ESPAÑOL profesional

Responde SOLO con JSON válido:
{
  "asunto": "...",
  "cuerpo": "..."
}`;

  const resultado = await llm.text(prompt, {
    maxTokens: 600,
    temperature: 0.6,
    system: 'Eres un experto en copywriting de seguimiento. Genera emails convincentes EN ESPAÑOL que reconecten sin ser molestos. RESPONDE SOLO CON JSON.',
  });

  let contenido = {
    asunto: `[Seguimiento] Recordatorio de nuestra propuesta para ${correoOriginal.industria}`,
    cuerpo: `Hola,

Te escribo porque no hemos recibido respuesta a nuestro correo anterior.

Quería asegurarme de que te llegó y si tienes preguntas sobre cómo podemos ayudar a tu ${correoOriginal.industria}.

¿Podemos agendar una llamada rápida?

Saludos,
Gringo Connection
${EDDY_PHONE}`,
  };

  if (resultado.ok && resultado.text) {
    try {
      const jsonMatch = resultado.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contenido = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Error al parsear respuesta de IA para seguimiento:', e);
    }
  }

  return contenido;
}

// Enviar correo de seguimiento
async function enviarSeguimiento(
  correoSeguimiento: CorreoSeguimiento
): Promise<CorreoSeguimiento> {
  try {
    const resultado = await mail.send({
      to: correoSeguimiento.correoOriginal,
      subject: correoSeguimiento.asunto,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <p style="margin: 0 0 15px; line-height: 1.6;">${correoSeguimiento.cuerpo.split('\n').join('<br>')}</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>¿Tienes preguntas?</strong><br>
              Estamos aquí para ayudarte.
            </p>
          </div>

          <p style="margin: 20px 0 0; font-size: 14px; color: #999;">
            Mejores saludos,<br>
            <strong>Gringo Connection</strong><br>
            <a href="tel:${EDDY_PHONE.replace(/\s/g, '')}" style="color: #0066cc; text-decoration: none;">${EDDY_PHONE}</a><br>
            <a href="https://gringoconnection.com" style="color: #0066cc; text-decoration: none;">gringoconnection.com</a>
          </p>

          <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
            Respetamos tu bandeja de entrada. <a href="#" style="color: #0066cc; text-decoration: none;">Desuscribirse</a> si prefieres no escuchar de nosotros.
          </p>
        </div>
      `,
      text: correoSeguimiento.cuerpo,
    });

    if (resultado.ok) {
      correoSeguimiento.estado = 'enviado';
      correoSeguimiento.fechaEnvío = new Date();
      console.log(`✅ Seguimiento enviado a ${correoSeguimiento.correoOriginal} (Día ${correoSeguimiento.día})`);
    } else {
      correoSeguimiento.estado = 'fallido';
      console.warn(`❌ Error enviando seguimiento a ${correoSeguimiento.correoOriginal}: ${resultado.reason}`);
    }
  } catch (e) {
    correoSeguimiento.estado = 'fallido';
    console.error(`❌ Excepción en seguimiento para ${correoSeguimiento.correoOriginal}:`, e);
  }

  return correoSeguimiento;
}

// Generar secuencia de 3 seguimientos para una campaña
export async function generarSecuenciaSeguimiento(
  archivosCampaña: string[],
  config: Partial<ConfiguracionSeguimiento> = {}
): Promise<void> {
  const configuracion: ConfiguracionSeguimiento = {
    maxDías: 14,
    reintentosFallidos: 2,
    incluirOfertaEspecial: true,
    ...config,
  };

  console.log(`📧 Generando secuencia de seguimiento para ${archivosCampaña.length} campañas...`);

  const todosSeguimientos: CorreoSeguimiento[] = [];

  for (const archivoCampaña of archivosCampaña) {
    try {
      const rutaCampaña = join(CONTENT_DIR, archivoCampaña);
      const datosCampaña = JSON.parse(readFileSync(rutaCampaña, 'utf-8'));

      if (!datosCampaña.campanas) {
        console.warn(`No hay campañas en ${archivoCampaña}`);
        continue;
      }

      // Para cada correo enviado exitosamente, crear 3 seguimientos
      for (const campana of datosCampaña.campanas) {
        if (campana.estado !== 'enviado') continue;

        // Día 3: Recordatorio suave
        const dia3 = await generarCorreoSeguimiento(
          {
            correoOriginal: campana.correo,
            nombreNegocio: campana.idNegocio,
            industria: 'Negocio',
            asuntoOriginal: campana.asunto,
            día: 3,
            tipo: 'recordatorio',
            correoSeguimiento: '',
            asunto: '',
            cuerpo: '',
            estado: 'enviado',
          },
          configuracion
        );

        // Día 7: Ofrecer descuento
        const dia7 = await generarCorreoSeguimiento(
          {
            correoOriginal: campana.correo,
            nombreNegocio: campana.idNegocio,
            industria: 'Negocio',
            asuntoOriginal: campana.asunto,
            día: 7,
            tipo: 'urgencia',
            correoSeguimiento: '',
            asunto: '',
            cuerpo: '',
            estado: 'enviado',
          },
          configuracion
        );

        // Día 14: Última oportunidad
        const dia14 = await generarCorreoSeguimiento(
          {
            correoOriginal: campana.correo,
            nombreNegocio: campana.idNegocio,
            industria: 'Negocio',
            asuntoOriginal: campana.asunto,
            día: 14,
            tipo: 'ultimaoportunidad',
            correoSeguimiento: '',
            asunto: '',
            cuerpo: '',
            estado: 'enviado',
          },
          configuracion
        );

        const todosLos3 = [
          { ...dia3.asunto, dia: 3 },
          { ...dia7, dia: 7 },
          { ...dia14, dia: 14 },
        ];

        todosSeguimientos.push(
          ...todosLos3.map((item: any) => ({
            correoOriginal: campana.correo,
            nombreNegocio: campana.idNegocio,
            industria: campana.serviciosRecomendados?.[0] || 'Negocio',
            asuntoOriginal: campana.asunto,
            día: item.dia as 3 | 7 | 14,
            tipo: item.dia === 3 ? 'recordatorio' : item.dia === 7 ? 'urgencia' : 'ultimaoportunidad',
            correoSeguimiento: campana.correo,
            asunto: item.asunto || dia3.asunto,
            cuerpo: item.cuerpo || dia3.cuerpo,
            estado: 'pendiente' as const,
          }))
        );
      }
    } catch (e) {
      console.warn(`Error procesando campaña ${archivoCampaña}:`, e);
    }
  }

  // Guardar secuencia
  const rutaSeguimientos = join(CONTENT_DIR, `seguimientos-${Date.now()}.json`);
  writeFileSync(rutaSeguimientos, JSON.stringify({ timestamp: new Date().toISOString(), seguimientos: todosSeguimientos }, null, 2));

  console.log(`\n✅ Secuencia de seguimiento generada: ${todosSeguimientos.length} correos en 3 olas`);
  console.log(`   - Día 3: ${todosSeguimientos.filter((s) => s.día === 3).length} recordatorios`);
  console.log(`   - Día 7: ${todosSeguimientos.filter((s) => s.día === 7).length} ofertas`);
  console.log(`   - Día 14: ${todosSeguimientos.filter((s) => s.día === 14).length} últimas oportunidades`);
  console.log(`\nGuardado en: ${rutaSeguimientos}`);

  // Enviar resumen
  const htmlResumen = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📧 Secuencia de Seguimiento Generada</h1>
      <p><strong>Fecha:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm', { timeZone: DEFAULT_TZ })}</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px;">📊 Resumen de Seguimiento</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #e0f2fe;">
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Correos Totales</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${todosSeguimientos.length}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Día 3 (Recordatorios)</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${todosSeguimientos.filter((s) => s.día === 3).length}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Día 7 (Ofertas)</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${todosSeguimientos.filter((s) => s.día === 7).length}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Día 14 (Últimas Oportunidades)</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${todosSeguimientos.filter((s) => s.día === 14).length}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Próximo Paso:</strong></p>
        <p style="margin: 10px 0 0;">Los seguimientos están listos para ser enviados. Ejecutar:</p>
        <pre style="background: #333; color: #0f0; padding: 10px; border-radius: 4px; overflow-x: auto;">pnpm outreach:follow-up</pre>
      </div>
    </div>
  `;

  await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `📧 Secuencia de Seguimiento Generada — ${todosSeguimientos.length} Correos`,
    html: htmlResumen,
  });
}

// Ejecutar seguimientos (llamado en producción)
export async function ejecutarSeguimientos(): Promise<void> {
  console.log(`📧 Ejecutando secuencia de seguimiento...`);

  try {
    // Buscar archivos de campaña más recientes
    // En producción, esto buscaría en database/CRM por "no respuesta en 3+ días"
    // Para ahora, simplemente notificar que está listo
    console.log(`✅ Sistema de seguimiento está listo`);
    console.log(`   Pasos siguientes:`);
    console.log(`   1. Generar secuencia: pnpm outreach:follow-up:generate`);
    console.log(`   2. Ejecutar en día 3: pnpm outreach:follow-up:day3`);
    console.log(`   3. Ejecutar en día 7: pnpm outreach:follow-up:day7`);
    console.log(`   4. Ejecutar en día 14: pnpm outreach:follow-up:day14`);
  } catch (e) {
    console.error('Error ejecutando seguimientos:', e);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const comando = process.argv[2];

  if (comando === 'generate') {
    // Buscar últimas campañas
    const archivosCampaña = ['campana-divulgacion-latest.json']; // En producción, buscar dinámicamente
    generarSecuenciaSeguimiento(archivosCampaña).catch(console.error);
  } else {
    ejecutarSeguimientos().catch(console.error);
  }
}
