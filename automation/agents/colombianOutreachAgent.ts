/**
 * Agente de Divulgación Empresarial Colombiana
 * Envía correos electrónicos personalizados a 50K+ negocios colombianos
 * Utiliza Resend para rotar direcciones de correo
 * Segmenta por nivel de ingresos: alto patrimonio → medio → bajo
 * Personaliza el pitch según la industria y puntos débiles
 * Limita velocidad para maximizar entregabilidad
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';
import { rateLimiter } from '../utils/rateLimiter.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

// Direcciones de correo rotativas para Resend
const SENDER_EMAILS = [
  'outreach@gringoconnection.com',
  'growth@gringoconnection.com',
  'hello@gringoconnection.com',
  'sales@gringoconnection.com',
  'contact@gringoconnection.com',
];

const SENDER_NAMES = [
  'Daniel Smith',
  'Eddy Richardson',
  'Equipo de Crecimiento',
  'Equipo de Ventas',
  'Desarrollo Empresarial',
];

interface NegocioColombia {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  industria: string;
  ubicacion: string;
  ingresoEstimado?: 'alto' | 'medio' | 'bajo';
  empleados?: number;
  sitioWeb?: string;
  nombrePropietario?: string;
  correoPropietario?: string;
  puntosDolientes?: string[];
  fuenteDatos?: string;
}

interface CampanaDivulgacion {
  idNegocio: string;
  correo: string;
  asunto: string;
  cuerpoHtml: string;
  cuerpoTexto: string;
  correoRemitente: string;
  nombreRemitente: string;
  serviciosRecomendados: string[];
  enviadoEn?: Date;
  estado: 'pendiente' | 'enviado' | 'fallido' | 'rebotado';
  mensajeError?: string;
  reintentos: number;
}

interface EstadisticasDivulgacion {
  totalSolicitado: number;
  totalEnviado: number;
  totalFallido: number;
  porIndustria: Record<string, number>;
  porNivelIngreso: Record<string, number>;
  duracionCampana: number;
  promedioCorreosPorHora: number;
}

// Obtener detalles del remitente rotativo
function obtenerProximoRemitente(indice: number): { correo: string; nombre: string } {
  return {
    correo: SENDER_EMAILS[indice % SENDER_EMAILS.length],
    nombre: SENDER_NAMES[indice % SENDER_NAMES.length],
  };
}

// Cargar negocios colombianos desde archivo local o API
async function cargarNegociosColombianos(limite: number = 1000): Promise<NegocioColombia[]> {
  const negocios: NegocioColombia[] = [];
  const rutaNegocio = join(CONTENT_DIR, 'negocios-colombianos.json');

  if (existsSync(rutaNegocio)) {
    try {
      const datos = JSON.parse(readFileSync(rutaNegocio, 'utf-8'));
      return datos.slice(0, limite);
    } catch (e) {
      console.warn('Error al cargar base de datos local de negocios:', e);
    }
  }

  // Generar negocios colombianos de muestra para pruebas
  return generarNegociosColombianosMuestra(limite);
}

// Generar negocios colombianos de muestra para pruebas
function generarNegociosColombianosMuestra(cantidad: number): NegocioColombia[] {
  const industrias = [
    'Servicios Legales',
    'Médico/Sanitario',
    'Bienes Raíces',
    'Restaurantes',
    'Retail',
    'Manufactura',
    'Construcción',
    'Educación',
    'Contabilidad',
    'Agencia de Marketing',
  ];

  const ciudades = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena'];

  const negocios: NegocioColombia[] = [];

  for (let i = 0; i < cantidad; i++) {
    const industria = industrias[Math.floor(Math.random() * industrias.length)];
    const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
    const nivelIngreso = Math.random() > 0.7 ? 'alto' : Math.random() > 0.4 ? 'medio' : 'bajo';

    negocios.push({
      id: `neg-${i}`,
      nombre: `${industria} Negocio ${i}`,
      correo: `info-${i}@negociocolombia${i % 100}.co`,
      telefono: `+57${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      industria,
      ubicacion: ciudad,
      ingresoEstimado: nivelIngreso,
      empleados: Math.floor(Math.random() * 500 + 1),
      sitioWeb: `https://negociocolombia${i}.co`,
      nombrePropietario: `Propietario ${i}`,
      correoPropietario: `propietario-${i}@negociocolombia${i % 100}.co`,
      puntosDolientes: generarPuntosDolientes(industria),
      fuenteDatos: 'prueba-muestra',
    });
  }

  return negocios;
}

// Generar puntos débiles según industria
function generarPuntosDolientes(industria: string): string[] {
  const puntosPorIndustria: Record<string, string[]> = {
    'Servicios Legales': ['adquisición de clientes', 'gestión de casos', 'automatización de documentos', 'presencia en línea'],
    'Médico/Sanitario': ['programación de pacientes', 'telemedicina', 'cumplimiento HIPAA', 'facturación'],
    'Bienes Raíces': ['listados de propiedades', 'generación de leads', 'tours virtuales', 'CRM'],
    'Restaurantes': ['pedidos en línea', 'sistema de reservas', 'gestión de inventario', 'integración de delivery'],
    'Retail': ['sistema POS', 'seguimiento de inventario', 'comercio electrónico', 'lealtad del cliente'],
    'Manufactura': ['cadena de suministro', 'seguimiento de producción', 'control de calidad', 'automatización'],
    'Construcción': ['gestión de proyectos', 'programación', 'seguimiento de costos', 'renta de equipos'],
    'Educación': ['aprendizaje en línea', 'gestión de estudiantes', 'aula virtual', 'seguimiento de tareas'],
    'Contabilidad': ['contabilidad', 'cumplimiento fiscal', 'informes financieros', 'senderos de auditoría'],
    'Agencia de Marketing': ['gestión de campañas', 'análisis', 'reportes de clientes', 'automatización'],
  };

  return puntosPorIndustria[industria] || ['transformación digital', 'automatización', 'presencia en línea'];
}

// Generar asunto y cuerpo personalizados
async function generarDivulgacionPersonalizada(
  negocio: NegocioColombia,
  indiceRemitente: number
): Promise<{ asunto: string; cuerpoHtml: string; cuerpoTexto: string; serviciosRecomendados: string[] }> {
  const remitente = obtenerProximoRemitente(indiceRemitente);

  // Usar IA para generar pitch personalizado
  const prompt = `Genera un correo electrónico profesional de divulgación en frío para un negocio colombiano de ${negocio.industria}.

Detalles del Negocio:
- Nombre: ${negocio.nombre}
- Ubicación: ${negocio.ubicacion}
- Tamaño: ~${negocio.empleados} empleados
- Puntos Débiles: ${negocio.puntosDolientes?.join(', ') || 'Desconocidos'}
- Nivel de Ingresos: ${negocio.ingresoEstimado || 'Desconocido'}

Servicios que ofrecemos:
1. Desarrollo de Sitios Web Personalizados e Integración de IA
2. Automatización Empresarial y Optimización de Flujos de Trabajo
3. Migración en la Nube e Infraestructura
4. Marketing Digital y Generación de Leads
5. Implementación e Integración de CRM
6. Análisis de Datos e Inteligencia Empresarial

Tarea:
1. Genera una línea de asunto atractiva (máximo 60 caracteres) en ESPAÑOL que mencione un punto débil específico
2. Escribe un cuerpo de correo profesional en ESPAÑOL de 3-4 párrafos que:
   - Abre con referencia personalizada a los desafíos de su industria
   - Menciona 1-2 servicios específicos que resuelven sus puntos débiles
   - Incluye un CTA suave (ej: "café virtual", "llamada de 15 minutos")
   - Se cierra profesionalmente
3. Recomienda 2-3 servicios que mejor se adapten a sus necesidades

Responde SOLO con JSON válido en español:
{
  "asunto": "...",
  "cuerpo": "...",
  "serviciosRecomendados": ["servicio1", "servicio2"]
}`;

  const resultado = await llm.text(prompt, {
    maxTokens: 800,
    temperature: 0.7,
    system: 'Eres un experto en copywriting B2B de ventas. Genera correos de divulgación en frío persuasivos y personalizados EN ESPAÑOL. Responde solo con JSON válido.',
  });

  let contenidoCorreo = {
    asunto: `Hablemos sobre el crecimiento de ${negocio.industria}`,
    cuerpo: `Hola ${negocio.nombrePropietario || 'allá'},\n\nAyudamos a negocios de ${negocio.industria} en ${negocio.ubicacion} a optimizar operaciones e impulsar ingresos.\n\n¿Estarías abierto a una rápida llamada de 15 minutos para explorar cómo podríamos ayudar?\n\nMejores saludos,\n${remitente.nombre}`,
    serviciosRecomendados: ['Desarrollo de Sitio Web Personalizado', 'Automatización Empresarial'],
  };

  if (resultado.ok && resultado.text) {
    try {
      const jsonMatch = resultado.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contenidoCorreo = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Error al parsear respuesta de IA:', e);
    }
  }

  // Convertir a HTML
  const cuerpoHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <p style="margin: 0 0 15px;">${contenidoCorreo.cuerpo.replace(/\n/g, '<br>')}</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>¿Interesado?</strong><br>
          Hagamos una llamada rápida para discutir tus necesidades específicas.
        </p>
      </div>

      <p style="margin: 20px 0 0; font-size: 14px; color: #999;">
        Mejores saludos,<br>
        <strong>${remitente.nombre}</strong><br>
        Gringo Connection<br>
        <a href="mailto:${remitente.correo}" style="color: #0066cc; text-decoration: none;">${remitente.correo}</a><br>
        <a href="https://gringoconnection.com" style="color: #0066cc; text-decoration: none;">gringoconnection.com</a>
      </p>

      <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
        Respetamos tu bandeja de entrada. <a href="#" style="color: #0066cc; text-decoration: none;">Desuscribirse</a> si prefieres no escuchar de nosotros.
      </p>
    </div>
  `;

  return {
    asunto: contenidoCorreo.asunto,
    cuerpoHtml,
    cuerpoTexto: contenidoCorreo.cuerpo,
    serviciosRecomendados: contenidoCorreo.serviciosRecomendados,
  };
}

// Enviar correo electrónico individual con limitación de velocidad
async function enviarCorreoDivulgacion(
  negocio: NegocioColombia,
  campana: Partial<CampanaDivulgacion>,
  indiceRemitente: number
): Promise<CampanaDivulgacion> {
  const remitente = obtenerProximoRemitente(indiceRemitente);

  // Limitar velocidad: respetar límites del proveedor de correo
  await rateLimiter.acquire('resend-emails', 1);

  const campanaCorreo: CampanaDivulgacion = {
    idNegocio: negocio.id,
    correo: negocio.correo,
    asunto: campana.asunto || '',
    cuerpoHtml: campana.cuerpoHtml || '',
    cuerpoTexto: campana.cuerpoTexto || '',
    correoRemitente: remitente.correo,
    nombreRemitente: remitente.nombre,
    serviciosRecomendados: campana.serviciosRecomendados || [],
    estado: 'pendiente',
    reintentos: 0,
  };

  try {
    // Enviar vía Resend
    const resultado = await mail.send({
      to: negocio.correo,
      subject: campanaCorreo.asunto,
      html: campanaCorreo.cuerpoHtml,
      text: campanaCorreo.cuerpoTexto,
    });

    if (resultado.ok) {
      campanaCorreo.estado = 'enviado';
      campanaCorreo.enviadoEn = new Date();
      console.log(`✅ Correo enviado a ${negocio.correo}`);
    } else {
      campanaCorreo.estado = 'fallido';
      campanaCorreo.mensajeError = resultado.reason;
      console.warn(`❌ Error al enviar correo a ${negocio.correo}: ${resultado.reason}`);
    }
  } catch (e) {
    campanaCorreo.estado = 'fallido';
    campanaCorreo.mensajeError = String(e);
    console.error(`❌ Excepción al enviar correo a ${negocio.correo}:`, e);
  }

  return campanaCorreo;
}

// Ordenar negocios por nivel de ingresos (alto a bajo)
function ordenarNegociosPorIngreso(negocios: NegocioColombia[]): NegocioColombia[] {
  const ordenNivel = { alto: 0, medio: 1, bajo: 2, undefined: 3 };
  return [...negocios].sort((a, b) => {
    const nivelA = ordenNivel[(a.ingresoEstimado as keyof typeof ordenNivel) || 'undefined'];
    const nivelB = ordenNivel[(b.ingresoEstimado as keyof typeof ordenNivel) || 'undefined'];
    return nivelA - nivelB;
  });
}

// Campaña de divulgación principal
export async function ejecutarDivulgacionColombia(opts?: { maxCorreos?: number }): Promise<void> {
  const maxCorreos = opts?.maxCorreos || 100; // Comenzar con 100, escalar
  console.log(`📧 Iniciando campaña de divulgación empresarial colombiana (máx: ${maxCorreos} correos)...`);

  const horaInicio = Date.now();

  // Cargar negocios
  console.log('📥 Cargando negocios colombianos...');
  const negocios = await cargarNegociosColombianos(maxCorreos * 2); // Cargar extra para filtrado
  const negociosOrdenados = ordenarNegociosPorIngreso(negocios);

  if (negociosOrdenados.length === 0) {
    console.warn('No hay negocios para divulgar');
    return;
  }

  const estadisticas: EstadisticasDivulgacion = {
    totalSolicitado: Math.min(maxCorreos, negociosOrdenados.length),
    totalEnviado: 0,
    totalFallido: 0,
    porIndustria: {},
    porNivelIngreso: { alto: 0, medio: 0, bajo: 0 },
    duracionCampana: 0,
    promedioCorreosPorHora: 0,
  };

  const campanaEnviada: CampanaDivulgacion[] = [];

  // Enviar correos con rotación y limitación de velocidad
  for (let i = 0; i < Math.min(maxCorreos, negociosOrdenados.length); i++) {
    const negocio = negociosOrdenados[i];

    // Generar correo personalizado
    console.log(`\n📝 Generando correo ${i + 1}/${estadisticas.totalSolicitado}...`);
    const { asunto, cuerpoHtml, cuerpoTexto, serviciosRecomendados } = await generarDivulgacionPersonalizada(
      negocio,
      i
    );

    // Enviar correo
    const campana = await enviarCorreoDivulgacion(
      negocio,
      { asunto, cuerpoHtml, cuerpoTexto, serviciosRecomendados },
      i
    );

    campanaEnviada.push(campana);

    // Actualizar estadisticas
    if (campana.estado === 'enviado') {
      estadisticas.totalEnviado++;
    } else {
      estadisticas.totalFallido++;
    }

    estadisticas.porIndustria[negocio.industria] = (estadisticas.porIndustria[negocio.industria] || 0) + 1;
    const nivel = (negocio.ingresoEstimado as keyof EstadisticasDivulgacion['porNivelIngreso']) || 'bajo';
    estadisticas.porNivelIngreso[nivel]++;

    // Pequeño retardo entre correos para respetar límites de velocidad
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 seg retardo
  }

  estadisticas.duracionCampana = (Date.now() - horaInicio) / 1000;
  estadisticas.promedioCorreosPorHora = (estadisticas.totalEnviado / (estadisticas.duracionCampana / 3600)) || 0;

  // Guardar resultados de campaña
  const rutaCampana = join(CONTENT_DIR, `campana-divulgacion-${Date.now()}.json`);
  writeFileSync(rutaCampana, JSON.stringify({ estadisticas, campanas: campanaEnviada }, null, 2));

  // Enviar correo de resumen
  const htmlResumen = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📧 Resumen de Campaña de Divulgación Colombiana</h1>
      <p><strong>Fecha:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm', { timeZone: DEFAULT_TZ })}</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px;">📊 Estadísticas de Campaña</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #e0f2fe;">
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Total Solicitado</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${estadisticas.totalSolicitado}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Enviado con Éxito</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right; color: #16a34a;"><strong>${estadisticas.totalEnviado}</strong></td>
          </tr>
          <tr style="background: #fef2f2;">
            <td style="padding: 10px; border: 1px solid #fecaca;"><strong>Fallido</strong></td>
            <td style="padding: 10px; border: 1px solid #fecaca; text-align: right; color: #dc2626;"><strong>${estadisticas.totalFallido}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Duración de Campaña</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${(estadisticas.duracionCampana / 60).toFixed(1)} minutos</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Correos Promedio/Hora</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${estadisticas.promedioCorreosPorHora.toFixed(0)}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #1e40af; margin-top: 20px;">📈 Por Nivel de Ingresos</h3>
      <ul>
        <li><strong>Alto Patrimonio:</strong> ${estadisticas.porNivelIngreso.alto} negocios</li>
        <li><strong>Medio:</strong> ${estadisticas.porNivelIngreso.medio} negocios</li>
        <li><strong>Bajo Ingreso:</strong> ${estadisticas.porNivelIngreso.bajo} negocios</li>
      </ul>

      <h3 style="color: #1e40af; margin-top: 20px;">🏢 Principales Industrias</h3>
      <ul>
        ${Object.entries(estadisticas.porIndustria)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([industria, cantidad]) => `<li><strong>${industria}:</strong> ${cantidad} negocios</li>`)
          .join('')}
      </ul>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Próximos Pasos:</strong></p>
        <ul style="margin: 10px 0 0;">
          <li>Monitorear tasas de entrega y rebotes de correo</li>
          <li>Configurar secuencias de seguimiento automatizado para no respondedores</li>
          <li>Rastrear tasas de apertura y clics</li>
          <li>Escalar a 50K negocios en las próximas 2-4 semanas</li>
        </ul>
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        Resultados guardados en: ${rutaCampana}
      </p>
    </div>
  `;

  const resultadoCorreo = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `📧 Campaña de Divulgación Colombiana — ${estadisticas.totalEnviado}/${estadisticas.totalSolicitado} Enviados`,
    html: htmlResumen,
  });

  if (resultadoCorreo.ok) {
    console.log(`✅ Resumen de campaña enviado al equipo`);
  }

  console.log(`\n🎉 ¡Campaña de divulgación colombiana completada!`);
  console.log(`   Enviados: ${estadisticas.totalEnviado}/${estadisticas.totalSolicitado}`);
  console.log(`   Fallidos: ${estadisticas.totalFallido}`);
  console.log(`   Duración: ${(estadisticas.duracionCampana / 60).toFixed(1)} minutos`);
  console.log(`   Promedio: ${estadisticas.promedioCorreosPorHora.toFixed(0)} correos/hora`);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxCorreos = parseInt(process.argv[2], 10) || 100;
  ejecutarDivulgacionColombia({ maxCorreos }).catch(console.error);
}
