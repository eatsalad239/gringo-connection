/**
 * Email Content Generator for Medellín Businesses - Colombian Spanish
 * Pre-generates personalized email content using AI for faster campaign execution
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';
import { getMedellinEmailCampaignTargets } from './medellin-business-scraper.js';

interface GeneratedEmail {
  business_id: string;
  subject: string;
  html: string;
  generated_at: string;
  priority: number;
}

const CONTENT_DIR = join(process.cwd(), 'data');
const GENERATED_CONTENT_FILE = join(CONTENT_DIR, 'generated_emails.json');

// Ensure content directory exists
if (!existsSync(CONTENT_DIR)) {
  require('fs').mkdirSync(CONTENT_DIR, { recursive: true });
}

// Load generated content
function loadGeneratedContent(): GeneratedEmail[] {
  try {
    if (existsSync(GENERATED_CONTENT_FILE)) {
      return JSON.parse(readFileSync(GENERATED_CONTENT_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('No se pudo cargar contenido generado:', e);
  }
  return [];
}

// Save generated content
function saveGeneratedContent(content: GeneratedEmail[]): void {
  writeFileSync(GENERATED_CONTENT_FILE, JSON.stringify(content, null, 2));
}

// Generate email content for a business
async function generateEmailContent(business: any): Promise<GeneratedEmail> {
  const industryProfile = getIndustryProfile(business.industry);

  const prompt = `Genera contenido de email personalizado para un negocio de Medellín. Debe ser persuasivo, local y en español colombiano natural.

DATOS DEL NEGOCIO:
- Nombre: ${business.name}
- Industria: ${business.industry}
- Barrio: ${business.neighborhood}
- Estimación ingresos: ${business.revenue_estimate}
- Dueño operativo: ${business.owner_occupied}
- Puntos de dolor específicos: ${business.pain_points?.join(', ')}
- Servicios que necesita: ${business.services_needed?.join(', ')}

PERFIL DE INDUSTRIA (${business.industry}):
- Dolores comunes: ${industryProfile?.pain_points?.join(', ')}
- Servicios necesarios: ${industryProfile?.services?.join(', ')}

El email debe:
1. ASUNTO atractivo (máximo 55 caracteres)
2. Saludo personalizado usando el nombre del negocio
3. Introducción que mencione específicamente el barrio de Medellín
4. Identificar 2-3 problemas específicos que enfrenta
5. Presentar soluciones concretas y medibles
6. Incluir prueba social de otros negocios de Medellín
7. Crear urgencia con oferta especial para el barrio
8. Llamado a acción claro (WhatsApp + email)
9. Cierre personal y local

Estilo: Profesional pero cercano, como un vecino de Medellín ayudando a otro negocio local.

Output JSON:
{
  "subject": "Asunto persuasivo",
  "content": "Contenido completo del email en HTML simple"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 1200,
    temperature: 0.9, // Higher creativity for Colombian Spanish
    system: 'Eres un experto en marketing digital para Medellín. Creas contenido persuasivo en español colombiano que conecta emocionalmente con dueños de negocio locales.',
  });

  let subject = `Transforme ${business.name} en Medellín`;
  let content = '';

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        subject = parsed.subject || subject;
        content = parsed.content || '';
      }
    } catch (e) {
      console.warn('No se pudo analizar respuesta de generación de contenido:', e);
    }
  }

  // Fallback content
  if (!content) {
    content = generateFallbackContent(business);
  }

  return {
    business_id: business.id,
    subject,
    html: wrapInHTML(content, business),
    generated_at: new Date().toISOString(),
    priority: business.contact_priority
  };
}

// Wrap content in HTML structure
function wrapInHTML(content: string, business: any): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  ${content}

  <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="color: #2563eb; margin: 0 0 10px 0;">¿Hablamos?</h3>
    <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +57 300 123 4567</p>
    <p style="margin: 5px 0;"><strong>Email:</strong> info@gringoconnection.com</p>
    <p style="margin: 5px 0;"><strong>Web:</strong> gringoconnection.com</p>
  </div>

  <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <p style="margin: 0; color: #856404;"><strong>Oferta Especial para ${business.neighborhood}:</strong> 25% descuento en los primeros 3 meses</p>
  </div>
</div>`;
}

// Get industry profile
function getIndustryProfile(industry: string) {
  const profiles = {
    'restaurantes': {
      pain_points: ['pedidos online lentos', 'reseñas negativas', 'clientes que no regresan', 'competencia de domicilios'],
      services: ['sistema de pedidos online', 'gestión de reseñas', 'programa de fidelización', 'marketing local']
    },
    'clínicas': {
      pain_points: ['pacientes que faltan', 'facturación lenta', 'competencia grande', 'gestión de citas caótica'],
      services: ['recordatorios automáticos', 'facturación electrónica', 'app para pacientes', 'sistema de citas online']
    },
    'abogados': {
      pain_points: ['plazos vencidos', 'documentos perdidos', 'clientes que no pagan', 'gestión manual'],
      services: ['alertas de plazos', 'automatización documental', 'portal cliente', 'facturación jurídica']
    },
    'contadores': {
      pain_points: ['declaraciones atrasadas', 'clientes que no entregan papeles', 'multas por errores', 'trabajo manual'],
      services: ['software contable', 'recordatorios automáticos', 'declaraciones automáticas', 'portal seguro']
    },
    'comercios': {
      pain_points: ['inventario que no cuadra', 'clientes que no regresan', 'ventas estancadas', 'competencia online'],
      services: ['inventario automático', 'fidelización digital', 'tienda online', 'marketing local']
    }
  };

  return profiles[industry.toLowerCase()] || profiles['comercios'];
}

// Fallback content generator
function generateFallbackContent(business: any): string {
  return `
<h2 style="color: #2563eb;">¡Hola ${business.name}!</h2>

<p>Soy Daniel de Gringo Connection, y estamos ayudando a negocios como el suyo en ${business.neighborhood}, Medellín, a crecer con tecnología digital.</p>

<p>Veo que ${business.name} es un ${business.industry} establecido en uno de los barrios más vibrantes de Medellín. ¿Está enfrentando desafíos como:</p>

<ul>
  <li>Clientes que no regresan</li>
  <li>Competencia cada vez más fuerte</li>
  <li>Gestión manual que consume tiempo</li>
  <li>Ventas que podrían ser mayores</li>
</ul>

<p>Podemos ayudar con soluciones específicas para ${business.industry} en Medellín:</p>

<ul>
  <li><strong>Sitio web profesional</strong> que atraiga más clientes locales</li>
  <li><strong>Automatización</strong> que libere su tiempo para enfocarse en el negocio</li>
  <li><strong>Marketing digital</strong> dirigido específicamente a ${business.neighborhood}</li>
  <li><strong>Herramientas de gestión</strong> que hagan todo más eficiente</li>
</ul>

<p>Ya hemos transformado más de 150 negocios en Medellín, y podemos hacer lo mismo por ${business.name}.</p>

<p>¿Le gustaría una conversación gratuita de 30 minutos para ver exactamente cómo podemos ayudar?</p>`;
}

// Generate content for multiple businesses
export async function generateEmailContentBatch(businesses: any[], batchSize: number = 50): Promise<GeneratedEmail[]> {
  const existingContent = loadGeneratedContent();
  const existingIds = new Set(existingContent.map(c => c.business_id));

  // Filter businesses that don't have content yet
  const newBusinesses = businesses.filter(biz => !existingIds.has(biz.id)).slice(0, batchSize);

  if (newBusinesses.length === 0) {
    console.log('✅ Ya se ha generado contenido para todos los negocios objetivo');
    return existingContent;
  }

  console.log(`📝 Generando contenido para ${newBusinesses.length} negocios...`);

  const generatedContent: GeneratedEmail[] = [...existingContent];

  for (const business of newBusinesses) {
    try {
      console.log(`✍️  Generando para ${business.name}...`);
      const content = await generateEmailContent(business);
      generatedContent.push(content);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (e) {
      console.error(`💥 Error generando contenido para ${business.name}:`, e);
    }
  }

  // Save progress
  saveGeneratedContent(generatedContent);
  console.log(`💾 Contenido guardado: ${generatedContent.length} emails generados`);

  return generatedContent;
}

// Get generated content for a business
export function getGeneratedContent(businessId: string): GeneratedEmail | null {
  const content = loadGeneratedContent();
  return content.find(c => c.business_id === businessId) || null;
}

// Main content generation function
export async function runContentGeneration(batchSize: number = 50): Promise<void> {
  console.log('🎨 Iniciando generación de contenido de emails...');

  const businesses = getMedellinEmailCampaignTargets();
  const generated = await generateEmailContentBatch(businesses, batchSize);

  const stats = {
    total_generated: generated.length,
    high_priority: generated.filter(c => c.priority >= 8).length,
    medium_priority: generated.filter(c => c.priority >= 6 && c.priority < 8).length,
    low_priority: generated.filter(c => c.priority < 6).length
  };

  console.log(`📊 Estadísticas de contenido generado:`);
  console.log(`   📧 Total: ${stats.total_generated}`);
  console.log(`   🔥 Alta prioridad: ${stats.high_priority}`);
  console.log(`   🟡 Media prioridad: ${stats.medium_priority}`);
  console.log(`   🟢 Baja prioridad: ${stats.low_priority}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const batchSize = parseInt(process.argv[2] || '50');
  runContentGeneration(batchSize).catch(console.error);
}