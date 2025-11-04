/**
 * Onboarding Agent - Creative Client Experience Agent
 * Generates onboarding docs, welcome emails, setup checklists when client signs
 * Creates personalized, professional onboarding experience
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const SERVICES_PATH = join(CONTENT_DIR, 'services.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  services: string[];
  signedDate: string;
  language: 'en' | 'es';
}

interface OnboardingPackage {
  welcomeEmail: { subject: string; body: string };
  checklist: Array<{ task: string; dueDate: string; priority: 'high' | 'medium' | 'low' }>;
  nextSteps: string[];
  resources: Array<{ title: string; url?: string; description: string }>;
}

// Load services
function loadServices(): any[] {
  try {
    const content = readFileSync(SERVICES_PATH, 'utf-8');
    return JSON.parse(content).services || [];
  } catch {
    return [];
  }
}

// Generate creative onboarding package
export async function generateOnboardingPackage(
  client: Client
): Promise<OnboardingPackage> {
  const isEs = client.language === 'es';
  const services = loadServices();
  const clientServices = services.filter((s) => client.services.includes(s.id));

  const servicesList = clientServices.map((s) => s.name[client.language]).join(', ');

  const prompt = isEs
    ? `Eres un experto en crear experiencias de onboarding excepcionales para clientes.

Cliente:
- Nombre: ${client.name}
- Empresa: ${client.company || 'N/A'}
- Servicios contratados: ${servicesList}
- Fecha de firma: ${client.signedDate}

Genera un paquete completo de onboarding que incluya:

1. **Email de bienvenida** (tono cálido, profesional, entusiasta):
   - Saludo personalizado
   - Confirmación de servicios contratados
   - Próximos pasos claros
   - Contacto para preguntas

2. **Checklist de onboarding** (5-7 tareas específicas):
   - Tareas relevantes para los servicios contratados
   - Fechas de vencimiento realistas (próximos 7-14 días)
   - Prioridades (high/medium/low)

3. **Próximos pasos** (3-5 acciones claras):
   - Qué esperar en los próximos días
   - Qué información necesitamos de ellos
   - Cómo iniciar el trabajo

4. **Recursos** (enlaces útiles, documentos, guías):
   - Documentación relevante
   - Acceso a portales/herramientas
   - Guías de inicio rápido

Formato JSON:
{
  "welcomeEmail": {
    "subject": "asunto creativo y personalizado",
    "body": "cuerpo completo del email (3-4 párrafos)"
  },
  "checklist": [
    {"task": "tarea específica", "dueDate": "YYYY-MM-DD", "priority": "high|medium|low"}
  ],
  "nextSteps": ["paso1", "paso2", "paso3"],
  "resources": [
    {"title": "título", "url": "url opcional", "description": "descripción"}
  ]
}`
    : `You are an expert at creating exceptional onboarding experiences for clients.

Client:
- Name: ${client.name}
- Company: ${client.company || 'N/A'}
- Services purchased: ${servicesList}
- Signed date: ${client.signedDate}

Generate a complete onboarding package that includes:

1. **Welcome email** (warm, professional, enthusiastic tone):
   - Personalized greeting
   - Confirmation of purchased services
   - Clear next steps
   - Contact for questions

2. **Onboarding checklist** (5-7 specific tasks):
   - Tasks relevant to purchased services
   - Realistic due dates (next 7-14 days)
   - Priorities (high/medium/low)

3. **Next steps** (3-5 clear actions):
   - What to expect in the coming days
   - What information we need from them
   - How to start the work

4. **Resources** (useful links, documents, guides):
   - Relevant documentation
   - Access to portals/tools
   - Quick start guides

JSON format:
{
  "welcomeEmail": {
    "subject": "creative and personalized subject",
    "body": "complete email body (3-4 paragraphs)"
  },
  "checklist": [
    {"task": "specific task", "dueDate": "YYYY-MM-DD", "priority": "high|medium|low"}
  ],
  "nextSteps": ["step1", "step2", "step3"],
  "resources": [
    {"title": "title", "url": "optional url", "description": "description"}
  ]
}`;

  try {
    const result = await llm.text(prompt, {
      model: process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini',
      temperature: 0.7,
      maxTokens: 2000,
    });

    if (!result.ok || !result.text) {
      throw new Error(result.reason || 'Failed to generate onboarding package');
    }

    const response = result.text;

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        welcomeEmail: parsed.welcomeEmail || {
          subject: isEs ? '¡Bienvenido a Gringo Connection!' : 'Welcome to Gringo Connection!',
          body: response,
        },
        checklist: parsed.checklist || [],
        nextSteps: parsed.nextSteps || [],
        resources: parsed.resources || [],
      };
    }

    // Fallback
    return {
      welcomeEmail: {
        subject: isEs ? '¡Bienvenido a Gringo Connection!' : 'Welcome to Gringo Connection!',
        body: response,
      },
      checklist: [],
      nextSteps: [],
      resources: [],
    };
  } catch (error) {
    console.error('Error generating onboarding package:', error);
    throw error;
  }
}

// Format onboarding package as email
function formatOnboardingEmail(package_: OnboardingPackage, client: Client): string {
  const isEs = client.language === 'es';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 800px; margin: 0 auto; padding: 30px; }
    h1 { color: #1e40af; }
    .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .checklist-item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .priority-high { border-left: 4px solid #dc2626; }
    .priority-medium { border-left: 4px solid #f59e0b; }
    .priority-low { border-left: 4px solid #3b82f6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${package_.welcomeEmail.subject}</h1>
    
    <div class="section">
      ${package_.welcomeEmail.body.split('\n').map((p) => `<p>${p}</p>`).join('')}
    </div>

    <div class="section">
      <h2>${isEs ? '✅ Checklist de Onboarding' : '✅ Onboarding Checklist'}</h2>
      ${package_.checklist.map((item) => `
        <div class="checklist-item priority-${item.priority}">
          <strong>${item.task}</strong><br>
          <small>${isEs ? 'Vence' : 'Due'}: ${format(new Date(item.dueDate), 'PPP', { timeZone: DEFAULT_TZ })}</small>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>${isEs ? '🚀 Próximos Pasos' : '🚀 Next Steps'}</h2>
      <ul>
        ${package_.nextSteps.map((step) => `<li>${step}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>${isEs ? '📚 Recursos' : '📚 Resources'}</h2>
      ${package_.resources.map((res) => `
        <div>
          <strong>${res.title}</strong><br>
          ${res.url ? `<a href="${res.url}">${res.url}</a><br>` : ''}
          <small>${res.description}</small>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `;
}

// Main function
export async function onboardNewClient(client: Client): Promise<void> {
  try {
    const package_ = await generateOnboardingPackage(client);

    // Send welcome email to client
    await mail.send({
      to: client.email,
      subject: package_.welcomeEmail.subject,
      html: formatOnboardingEmail(package_, client),
    });

    // Notify team
    await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `🎯 New Client Onboarded: ${client.name}`,
      html: `
        <h2>New Client Onboarded</h2>
        <p><strong>Client:</strong> ${client.name}${client.company ? ` (${client.company})` : ''}</p>
        <p><strong>Services:</strong> ${client.services.join(', ')}</p>
        <p><strong>Onboarding package sent!</strong></p>
      `,
    });

    console.log(`✅ Onboarding package sent to ${client.name}`);
  } catch (error) {
    console.error('Error onboarding client:', error);
    throw error;
  }
}

