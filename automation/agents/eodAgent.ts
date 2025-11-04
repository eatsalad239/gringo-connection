/**
 * EOD Agent - runs at 21:30
 * Reports leads, posts, performance, bookings, grants, blockers, questions
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

async function generateReport(): Promise<{ en: string; es: string }> {
  const prompt = `Generate an end-of-day report for Gringo Connection operations.

Include sections:
1. Leads & Pending
2. Posts Pushed Today
3. Top Performer
4. Web Sessions & WhatsApp Clicks
5. Bookings & Capacity
6. Grants & Deadlines
7. Blockers
8. 3-5 Questions for Tomorrow

Format as JSON: {"en": "report text", "es": "texto del reporte"}`;

  const result = await llm.text(prompt, { 
    maxTokens: 1000,
    model: 'claude-3-opus', // Best for structured reports
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
  }

  // Fallback
  return {
    en: 'End-of-day report generated. Review metrics and plan for tomorrow.',
    es: 'Reporte de fin de día generado. Revisar métricas y planificar para mañana.',
  };
}

export async function runEOD(): Promise<void> {
  console.log('📊 Running EOD agent...');

  const report = await generateReport();
  
  const templatePathEn = join(process.cwd(), 'automation', 'agents', 'templates', 'eod_en.html');
  const templatePathEs = join(process.cwd(), 'automation', 'agents', 'templates', 'eod_es.html');
  
  const templateEn = existsSync(templatePathEn)
    ? readFileSync(templatePathEn, 'utf-8')
    : '<div>{{REPORT}}</div>';
  const templateEs = existsSync(templatePathEs)
    ? readFileSync(templatePathEs, 'utf-8')
    : '<div>{{REPORT}}</div>';

  const htmlEn = templateEn.replace('{{REPORT}}', report.en);
  const htmlEs = templateEs.replace('{{REPORT}}', report.es);

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `EOD Report — ${format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ })}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>English</h2>
        ${htmlEn}
        <hr style="margin: 40px 0;">
        <h2>Español</h2>
        ${htmlEs}
      </div>
    `,
  });

  if (result.ok) {
    console.log(`✅ EOD report sent to ${EOD_TO}`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEOD().catch(console.error);
}

