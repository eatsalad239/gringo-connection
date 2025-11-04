/**
 * Intake Agent - runs at 09:15 & 14:00
 * Asks 5-8 unblockers, emails bilingual to EOD_TO
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const TOURS_PATH = join(CONTENT_DIR, 'tours.json');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com';

async function generateQuestions(): Promise<{ en: string[]; es: string[] }> {
  const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
  const tours = JSON.parse(readFileSync(TOURS_PATH, 'utf-8'));

  const prompt = `Generate 5-8 priority questions for today's Gringo Connection operations:

Context:
- ${queue.filter((p: any) => !p.verified).length} unverified posts in queue
- ${tours.tours?.length || 0} active tours
- Today's date: ${format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ })}

Generate questions about:
1. Today's priority vertical
2. New partners/testimonials
3. Tonight's post focus
4. Tour capacity/blackouts/upsells
5. Grant opportunities
6. Team blockers

Format as JSON: {"en": ["question1", ...], "es": ["pregunta1", ...]}`;

  const result = await llm.text(prompt, { 
    maxTokens: 500,
    model: 'claude-3-opus', // Best for structured questions
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
  }

  // Fallback questions
  return {
    en: [
      'What is today\'s priority vertical?',
      'Any new partners or testimonials to highlight?',
      'What should tonight\'s post focus on?',
      'Tour capacity and blackout dates?',
      'Any grant opportunities to pursue?',
    ],
    es: [
      '¿Cuál es el vertical prioritario de hoy?',
      '¿Nuevos socios o testimonios para destacar?',
      '¿En qué debe enfocarse el post de esta noche?',
      '¿Capacidad de tours y fechas bloqueadas?',
      '¿Oportunidades de subvenciones a explorar?',
    ],
  };
}

export async function runIntake(): Promise<void> {
  console.log('📥 Running intake agent...');

  const questions = await generateQuestions();
  
  const templatePathEn = join(process.cwd(), 'automation', 'agents', 'templates', 'intake_en.html');
  const templatePathEs = join(process.cwd(), 'automation', 'agents', 'templates', 'intake_es.html');
  
  const templateEn = existsSync(templatePathEn)
    ? readFileSync(templatePathEn, 'utf-8')
    : '<div>{{QUESTIONS}}</div>';
  const htmlEn = templateEn.replace('{{QUESTIONS}}', questions.en.map((q) => `<li>${q}</li>`).join(''));
  
  const templateEs = existsSync(templatePathEs)
    ? readFileSync(templatePathEs, 'utf-8')
    : '<div>{{QUESTIONS}}</div>';
  const htmlEs = templateEs.replace('{{QUESTIONS}}', questions.es.map((q) => `<li>${q}</li>`).join(''));

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `Daily Intake Questions — ${format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ })}`,
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
    console.log(`✅ Intake email sent to ${EOD_TO}`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntake().catch(console.error);
}

