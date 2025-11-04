/**
 * Grant Agent - runs Mon & Thu at 08:00
 * Fetches → summarizes → fit score → emails
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const GRANTS_PATH = join(CONTENT_DIR, 'grants', 'grants_matrix.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com';

interface Grant {
  program: string;
  agency: string;
  amount: string;
  sector: string;
  region: string;
  deadline: string;
  url: string;
}

function loadGrants(): Grant[] {
  try {
    const data = readFileSync(GRANTS_PATH, 'utf-8');
    return JSON.parse(data).grants || [];
  } catch {
    return [];
  }
}

async function scoreGrant(grant: Grant): Promise<number> {
  const services = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'services.json'), 'utf-8')
  );

  const keywords = services.services
    ?.flatMap((s: any) => [
      s.name_en?.toLowerCase(),
      s.name_es?.toLowerCase(),
      ...(s.capabilities_en || []).join(' ').toLowerCase().split(' '),
    ])
    .filter(Boolean) || [];

  const grantText = `${grant.program} ${grant.agency} ${grant.sector}`.toLowerCase();
  const matches = keywords.filter((kw: string) => grantText.includes(kw)).length;

  return Math.min(matches / keywords.length * 100, 100);
}

export async function runGrantAgent(): Promise<void> {
  console.log('💰 Running grant agent...');

  const grants = loadGrants();
  const upcoming = grants.filter(
    (g) => new Date(g.deadline) > new Date() && new Date(g.deadline) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const scored = await Promise.all(
    upcoming.map(async (g) => ({
      ...g,
      fitScore: await scoreGrant(g),
    }))
  );

  const highFit = scored.filter((g) => g.fitScore >= 60);

  if (highFit.length === 0) {
    console.log('No high-fit grants found');
    return;
  }

  const summaryEn = highFit
    .map(
      (g) =>
        `**${g.program}** (${g.agency})\n` +
        `Amount: ${g.amount}\n` +
        `Sector: ${g.sector}\n` +
        `Deadline: ${g.deadline}\n` +
        `Fit Score: ${g.fitScore.toFixed(0)}%\n` +
        `URL: ${g.url}\n`
    )
    .join('\n---\n\n');

  const summaryEs = highFit
    .map(
      (g) =>
        `**${g.program}** (${g.agency})\n` +
        `Monto: ${g.amount}\n` +
        `Sector: ${g.sector}\n` +
        `Fecha límite: ${g.deadline}\n` +
        `Puntuación: ${g.fitScore.toFixed(0)}%\n` +
        `URL: ${g.url}\n`
    )
    .join('\n---\n\n');

  const whatsappLink = process.env.WHATSAPP_NUMBER
    ? `https://wa.me/${process.env.WHATSAPP_NUMBER.replace(/\D/g, '')}`
    : '';

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `Grant Opportunities — ${highFit.length} High-Fit Matches`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>English</h2>
        <pre style="white-space: pre-wrap;">${summaryEn}</pre>
        ${whatsappLink ? `<p><a href="${whatsappLink}">Alert via WhatsApp</a></p>` : ''}
        <hr style="margin: 40px 0;">
        <h2>Español</h2>
        <pre style="white-space: pre-wrap;">${summaryEs}</pre>
        ${whatsappLink ? `<p><a href="${whatsappLink}">Alerta por WhatsApp</a></p>` : ''}
      </div>
    `,
  });

  if (result.ok) {
    console.log(`✅ Grant report sent: ${highFit.length} opportunities`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGrantAgent().catch(console.error);
}

