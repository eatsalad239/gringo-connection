/**
 * Campaña de Email para Negocios de Medellín - Español Colombiano
 * Envía emails personalizados a negocios de Medellín usando Resend API
 * Rota entre múltiples cuentas @gringoconnection.com
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { mail, llm } from './providers.js';
import { obtenerObjetivosCampanaEmailMedellin } from './medellin-negocios-scraper.js';

interface CuentaEmail {
  email: string;
  nombre: string;
  limite_diario: number;
  enviados_hoy: number;
  ultimo_envio: string;
}

interface EmailCampana {
  negocio: any;
  asunto: string;
  html: string;
  email_origen: string;
  fecha_envio?: string;
  estado: 'pendiente' | 'enviado' | 'fallido';
}

// Cuentas de email para rotación (todas @gringoconnection.com)
const CUENTAS_EMAIL: CuentaEmail[] = [
  { email: 'info@gringoconnection.com', nombre: 'Gringo Connection Medellín', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'negocios@gringoconnection.com', nombre: 'Desarrollo Empresarial', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'soluciones@gringoconnection.com', nombre: 'Soluciones Digitales', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'tecnologia@gringoconnection.com', nombre: 'Tecnología Empresarial', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'consultoria@gringoconnection.com', nombre: 'Consultoría Digital', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'automatizacion@gringoconnection.com', nombre: 'Automatización Inteligente', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'transformacion@gringoconnection.com', nombre: 'Transformación Digital', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'innovacion@gringoconnection.com', nombre: 'Innovación Empresarial', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'medellin@gringoconnection.com', nombre: 'Medellín Business Hub', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
  { email: 'crecimiento@gringoconnection.com', nombre: 'Crecimiento Empresarial', limite_diario: 500, enviados_hoy: 0, ultimo_envio: '' },
];

const ARCHIVO_CAMPANA = join(process.cwd(), 'data', 'campana_email_medellin.json');

// Cargar datos de campaña
function cargarDatosCampana(): EmailCampana[] {
  try {
    const datos = readFileSync(ARCHIVO_CAMPANA, 'utf-8');
    return JSON.parse(datos);
  } catch (e) {
    return [];
  }
}

// Guardar datos de campaña
function guardarDatosCampana(datos: EmailCampana[]): void {
  require('fs').writeFileSync(ARCHIVO_CAMPANA, JSON.stringify(datos, null, 2));
}

// Obtener siguiente cuenta de email disponible
function obtenerSiguienteCuentaEmail(): CuentaEmail | null {
  const hoy = new Date().toISOString().split('T')[0];

  CUENTAS_EMAIL.forEach(cuenta => {
    if (cuenta.ultimo_envio !== hoy) {
      cuenta.enviados_hoy = 0;
      cuenta.ultimo_envio = hoy;
    }
  });

  const cuentaDisponible = CUENTAS_EMAIL.find(cuenta =>
    cuenta.enviados_hoy < cuenta.limite_diario
  );

  return cuentaDisponible || null;
}

// Generar contenido de email personalizado en español colombiano
async function generarEmailPersonalizado(negocio: any): Promise<{ asunto: string; html: string }> {
  const perfilIndustria = obtenerPerfilIndustria(negocio.industria);

  const prompt = `Genera contenido de email personalizado para un negocio de Medellín. Debe ser extremadamente persuasivo y dirigido específicamente a sus puntos de dolor. Todo en español colombiano natural y conversacional.

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
5. Presentar soluciones concretas y medibles con beneficios específicos
6. Incluir prueba social de otros negocios de Medellín que hemos ayudado
7. Crear urgencia con oferta especial para el barrio
8. Llamados a acción claros (WhatsApp + email de respuesta)
9. Cierre personal y local

Estilo: Profesional pero cercano, como un vecino paisa de Medellín ayudando a otro negocio local. Usar expresiones colombianas naturales como "parce", "mi llave", etc. cuando sea apropiado, pero mantener el profesionalismo.

Output JSON:
{
  "asunto": "Asunto persuasivo y corto",
  "html": "Contenido completo del email HTML con estilos profesionales"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 1500,
    temperature: 0.8,
    system: 'Eres un experto en desarrollo empresarial en Medellín, Colombia. Creas emails persuasivos en español colombiano natural, usando expresiones paisas apropiadas pero manteniendo profesionalismo. Conoces perfectamente el mercado local.',
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.asunto && parsed.html) {
          return {
            asunto: parsed.asunto,
            html: mejorarHTMLemail(parsed.html, negocio)
          };
        }
      }
    } catch (e) {
      console.warn('No se pudo analizar la respuesta de generación de email:', e);
    }
  }

  return generarEmailRespaldo(negocio);
}

// Obtener perfil de industria
function obtenerPerfilIndustria(industria: string) {
  const perfiles = {
    'restaurantes': {
      puntos_dolor: ['pedidos online lentos', 'reseñas negativas que afectan ventas', 'menús desactualizados', 'clientes que no regresan', 'competencia de apps de delivery'],
      servicios: ['sistema de pedidos online', 'gestión automática de reseñas', 'menú digital con fotos', 'programa de fidelización', 'optimización SEO local']
    },
    'clínicas': {
      puntos_dolor: ['pacientes que faltan a citas', 'historias clínicas en papel', 'facturación lenta', 'competencia de clínicas grandes', 'pacientes que no pagan'],
      servicios: ['recordatorios automáticos', 'historia clínica digital', 'facturación automática', 'app para pacientes', 'marketing digital']
    },
    'abogados': {
      puntos_dolor: ['plazos que se vencen', 'documentos que se pierden', 'clientes que no pagan', 'competencia de bufetes grandes', 'gestión manual'],
      servicios: ['alertas de plazos', 'automatización documental', 'portal cliente', 'facturación jurídica', 'CRM legal']
    },
    'contadores': {
      puntos_dolor: ['declaraciones atrasadas', 'clientes que no entregan papeles', 'multas por errores', 'competencia de firmas grandes', 'trabajo manual'],
      servicios: ['software contable', 'recordatorios automáticos', 'declaraciones automáticas', 'portal seguro', 'alertas tributarias']
    },
    'comercios': {
      puntos_dolor: ['inventario que no cuadra', 'clientes que no regresan', 'ventas estancadas', 'competencia online', 'gestión manual'],
      servicios: ['inventario automático', 'fidelización digital', 'tienda online', 'marketing local', 'gestión proveedores']
    }
  };

  return perfiles[industria.toLowerCase()] || perfiles['comercios'];
}

// Mejorar HTML del email con estilos profesionales colombianos
function mejorarHTMLemail(contenido: string, negocio: any): string {
  const baseHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; max-width: 600px; margin: 0 auto; padding: 20px; background: #f7fafc; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .content { background: white; border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .highlight { background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .services { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); transition: all 0.3s ease; }
    .cta-button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-2px); box-shadow: 0 6px 8px rgba(37, 99, 235, 0.4); }
    .secondary-cta { display: inline-block; background: #f1f5f9; color: #475569; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 0; border: 1px solid #e2e8f0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center; background: #f8fafc; padding: 20px; border-radius: 6px; }
    h1 { margin: 0; font-size: 26px; font-weight: 700; }
    h2 { color: #1e40af; margin-top: 30px; font-size: 20px; }
    h3 { color: #2563eb; margin: 20px 0 10px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .emoji { font-size: 1.2em; }
    .medellin-badge { background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Transforme su Negocio en Medellín</h1>
    <p>Soluciones Digitales Personalizadas para ${negocio.nombre}<span class="medellin-badge">MEDELLÍN</span></p>
  </div>

  <div class="content">
    ${contenido}

    <div class="highlight">
      <h3>🎯 ¿Por qué elegir Gringo Connection en Medellín?</h3>
      <ul>
        <li><strong class="emoji">🏙️</strong> <strong>Expertos Locales:</strong> Equipo basado en Medellín, entendemos su realidad</li>
        <li><strong class="emoji">⚡</strong> <strong>Implementación Rápida:</strong> Resultados en semanas, no meses</li>
        <li><strong class="emoji">💰</strong> <strong>Retorno de Inversión Comprobado:</strong> Más de 150+ negocios medellinenses transformados</li>
        <li><strong class="emoji">🤝</strong> <strong>Soporte Personalizado:</strong> Atención directa con el propietario</li>
        <li><strong class="emoji">🇨🇴</strong> <strong>100% Colombiano:</strong> Adaptado a leyes y regulaciones locales</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/573001234567?text=Hola,%20soy%20el%20dueño%20de%20${encodeURIComponent(negocio.nombre)}%20en%20${encodeURIComponent(negocio.barrio)},Medellín.%20Vi%20su%20email%20sobre%20soluciones%20digitales." class="cta-button">
        📞 ¡Hablemos! Agendar Reunión Gratuita
      </a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>O contáctenos directamente:</p>
      <p><strong>📱 WhatsApp:</strong> +57 300 123 4567<br>
      <strong>📧 Email:</strong> info@gringoconnection.com<br>
      <strong>🌐 Web:</strong> gringoconnection.com<br>
      <strong>📍 Ubicación:</strong> Medellín, Colombia</p>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #ffc107;">
      <h3 style="margin: 0 0 10px 0; color: #856404;">⏰ Oferta Especial para ${negocio.barrio}</h3>
      <p style="margin: 0; color: #856404;"><strong>Primeros 50 negocios de ${negocio.barrio}:</strong> 25% descuento en los primeros 3 meses</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>Gringo Connection</strong> - Transformamos negocios medellinenses con tecnología de vanguardia</p>
    <p>🏙️ <strong>Medellín, Colombia</strong> | 📧 info@gringoconnection.com | 🌐 gringoconnection.com</p>
    <p style="font-size: 12px; margin-top: 10px;">
      Este email fue enviado específicamente para ${negocio.nombre} en ${negocio.barrio}, Medellín basado en su perfil empresarial.
      Si no desea recibir más comunicaciones, responda con "NO QUIERO" y será removido inmediatamente.
    </p>
  </div>
</body>
</html>`;

  return baseHTML;
}

// Generar email de respaldo
function generarEmailRespaldo(negocio: any): { asunto: string; html: string } {
  const asunto = `Transforme ${negocio.nombre} en Medellín`;

  const contenido = `
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

<p>¿Le gustaría una reunión gratuita de 30 minutos para ver exactamente cómo podemos ayudar?</p>

<p>Tenemos una oferta especial para negocios de ${negocio.barrio} este mes.</p>
  `;

  return { asunto, html: mejorarHTMLemail(contenido, negocio) };
}

// Ejecutar campaña de email
export async function ejecutarCampanaEmailMedellin(tamanoLote: number = 50): Promise<void> {
  console.log('🚀 Iniciando campaña de email para negocios de Medellín...');

  const objetivos = obtenerObjetivosCampanaEmailMedellin();
  const datosCampana = cargarDatosCampana();

  const idsContactados = new Set(datosCampana.map(c => c.negocio.id));
  const objetivosNuevos = objetivos.filter(neg => !idsContactados.has(neg.id));

  console.log(`📊 Encontrados ${objetivosNuevos.length} nuevos objetivos de alta prioridad`);

  if (objetivosNuevos.length === 0) {
    console.log('✅ Todos los objetivos de alta prioridad han sido contactados');
    return;
  }

  let enviadosCount = 0;
  let indiceCuenta = 0;

  for (const negocio of objetivosNuevos) {
    if (enviadosCount >= tamanoLote) break;

    const cuentaEmail = obtenerSiguienteCuentaEmail();
    if (!cuentaEmail) {
      console.log('⚠️  Todas las cuentas de email han alcanzado el límite diario');
      break;
    }

    try {
      console.log(`📧 Generando email para ${negocio.nombre} (${negocio.barrio})`);

      const contenidoEmail = await generarEmailPersonalizado(negocio);

      const emailDestinatario = negocio.email ||
        `info@${negocio.sitio_web?.replace('https://www.', '').replace('https://', '').replace('http://www.', '').replace('http://', '')}` ||
        `${negocio.nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}@gmail.com`;

      const result = await mail.send({
        to: emailDestinatario,
        subject: contenidoEmail.asunto,
        html: contenidoEmail.html,
        from: `${cuentaEmail.nombre} <${cuentaEmail.email}>`
      });

      if (result.ok) {
        console.log(`✅ Enviado a ${negocio.nombre} via ${cuentaEmail.email}`);

        datosCampana.push({
          negocio,
          asunto: contenidoEmail.asunto,
          html: contenidoEmail.html,
          email_origen: cuentaEmail.email,
          fecha_envio: new Date().toISOString(),
          estado: 'enviado'
        });

        cuentaEmail.enviados_hoy++;
        enviadosCount++;

        if (enviadosCount % 10 === 0) {
          guardarDatosCampana(datosCampana);
          console.log(`💾 Progreso guardado: ${enviadosCount} emails enviados`);
        }

      } else {
        console.warn(`❌ No se pudo enviar a ${negocio.nombre}: ${result.reason}`);

        datosCampana.push({
          negocio,
          asunto: contenidoEmail.asunto,
          html: contenidoEmail.html,
          email_origen: cuentaEmail.email,
          estado: 'fallido'
        });
      }

    } catch (e) {
      console.error(`💥 Error procesando ${negocio.nombre}:`, e);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  guardarDatosCampana(datosCampana);
  console.log(`🎯 Campaña completada: ${enviadosCount} emails enviados en este lote`);

  const enviadosHoy = datosCampana.filter(c => c.fecha_envio?.startsWith(new Date().toISOString().split('T')[0]) && c.estado === 'enviado').length;
  const totalEnviados = datosCampana.filter(c => c.estado === 'enviado').length;
  const fallidos = datosCampana.filter(c => c.estado === 'fallido').length;

  console.log(`📈 Resumen de Hoy: ${enviadosHoy} enviados, ${fallidos} fallidos`);
  console.log(`📊 Campaña Total: ${totalEnviados} enviados, ${fallidos} fallidos`);
}

// Obtener estadísticas de campaña
export function obtenerEstadisticasCampanaMedellin(): any {
  const datosCampana = cargarDatosCampana();

  const hoy = new Date().toISOString().split('T')[0];
  const enviadosHoy = datosCampana.filter(c => c.fecha_envio?.startsWith(hoy) && c.estado === 'enviado');

  return {
    total_enviados: datosCampana.filter(c => c.estado === 'enviado').length,
    total_fallidos: datosCampana.filter(c => c.estado === 'fallido').length,
    enviados_hoy: enviadosHoy.length,
    pendientes: datosCampana.filter(c => c.estado === 'pendiente').length,
    cuentas_usadas: [...new Set(datosCampana.map(c => c.email_origen))].length,
    top_barrios: obtenerTopBarrios(datosCampana.filter(c => c.estado === 'enviado')),
    top_industrias: obtenerTopIndustrias(datosCampana.filter(c => c.estado === 'enviado'))
  };
}

function obtenerTopBarrios(emailsEnviados: EmailCampana[]): string[] {
  const conteoBarrios: Record<string, number> = {};

  emailsEnviados.forEach(email => {
    const barrio = email.negocio.barrio;
    conteoBarrios[barrio] = (conteoBarrios[barrio] || 0) + 1;
  });

  return Object.entries(conteoBarrios)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([barrio]) => barrio);
}

function obtenerTopIndustrias(emailsEnviados: EmailCampana[]): string[] {
  const conteoIndustrias: Record<string, number> = {};

  emailsEnviados.forEach(email => {
    const industria = email.negocio.industria;
    conteoIndustrias[industria] = (conteoIndustrias[industria] || 0) + 1;
  });

  return Object.entries(conteoIndustrias)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([industria]) => industria);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tamanoLote = parseInt(process.argv[2] || '50');
  ejecutarCampanaEmailMedellin(tamanoLote).catch(console.error);
}