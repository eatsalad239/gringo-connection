/**
 * Launch Ready Script - sends final summary email
 */

import { mail } from '../automation/providers.js';
import { format } from 'date-fns-tz';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

const today = format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });

const html = `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">🚀 Launch Ready + Daily Plan</h1>
    
    <h2>English</h2>
    <p>The Gringo Ecosystem is ready for launch!</p>
    
    <h3>Local Development</h3>
    <ul>
      <li>Run <code>pnpm install</code> to install dependencies</li>
      <li>Run <code>pnpm dev</code> to start the Next.js dev server</li>
      <li>Run <code>pnpm social:generate</code> to generate posts</li>
      <li>Run <code>pnpm daily:schedule</code> to run the scheduler</li>
    </ul>
    
    <h3>Deployment</h3>
    <ul>
      <li><strong>Cloudflare:</strong> <code>pnpm deploy:cloudflare</code></li>
      <li><strong>Netlify:</strong> <code>pnpm deploy:netlify</code></li>
    </ul>
    
    <h3>Daily Automation</h3>
    <p>The system will run daily at 07:00 Bogota time via GitHub Actions.</p>
    <p>If no Buffer/Meta tokens are configured, posting packs will be emailed.</p>
    
    <h3>Agent Commands</h3>
    <ul>
      <li><code>pnpm tsx automation/agents/intakeAgent.ts</code></li>
      <li><code>pnpm tsx automation/agents/eodAgent.ts</code></li>
      <li><code>pnpm tsx automation/agents/grantAgent.ts</code></li>
      <li><code>pnpm tsx automation/agents/qaAgent.ts</code></li>
    </ul>
    
    <h3>Content Editing</h3>
    <ul>
      <li>Hero/Services: <code>content/i18n/*.json</code></li>
      <li>Services: <code>content/services.json</code></li>
      <li>Verticals: <code>content/verticals.json</code></li>
      <li>Tours: <code>content/tours.json</code></li>
      <li>Posts: <code>content/social/posts.seed.json</code></li>
    </ul>
    
    <hr style="margin: 40px 0;">
    
    <h2>Español</h2>
    <p>¡El Ecosistema Gringo está listo para el lanzamiento!</p>
    
    <h3>Desarrollo Local</h3>
    <ul>
      <li>Ejecuta <code>pnpm install</code> para instalar dependencias</li>
      <li>Ejecuta <code>pnpm dev</code> para iniciar el servidor de desarrollo Next.js</li>
      <li>Ejecuta <code>pnpm social:generate</code> para generar posts</li>
      <li>Ejecuta <code>pnpm daily:schedule</code> para ejecutar el programador</li>
    </ul>
    
    <h3>Despliegue</h3>
    <ul>
      <li><strong>Cloudflare:</strong> <code>pnpm deploy:cloudflare</code></li>
      <li><strong>Netlify:</strong> <code>pnpm deploy:netlify</code></li>
    </ul>
    
    <h3>Automatización Diaria</h3>
    <p>El sistema se ejecutará diariamente a las 07:00 hora de Bogotá vía GitHub Actions.</p>
    <p>Si no hay tokens de Buffer/Meta configurados, se enviarán paquetes de publicación por correo.</p>
    
    <p style="margin-top: 30px;">
      <strong>Fecha:</strong> ${today}<br>
      <strong>Sistema:</strong> Gringo Ecosystem v1.0.0
    </p>
  </div>
`;

await mail.send({
  to: EOD_TO.split(',').map((e) => e.trim()),
  subject: `Launch Ready + Daily Plan — ${today}`,
  html,
});

console.log('✅ Launch ready email sent to', EOD_TO);

