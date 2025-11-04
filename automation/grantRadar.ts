/**
 * Grant Radar - configurable sources → summarize → fit score → email
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { llm, mail } from './providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const GRANTS_PATH = join(CONTENT_DIR, 'grants', 'grants_matrix.json');
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Grant {
  program: string;
  agency: string;
  amount: string;
  sector: string;
  region: string;
  deadline: string;
  url: string;
}

async function fetchGrants(): Promise<Grant[]> {
  // Stub: load from grants_matrix.json
  // In production, would fetch from actual grant databases/APIs
  try {
    const data = readFileSync(GRANTS_PATH, 'utf-8');
    return JSON.parse(data).grants || [];
  } catch {
    return [];
  }
}

async function summarizeGrant(grant: Grant): Promise<{ en: string; es: string }> {
  const prompt = `Summarize this grant opportunity in English and Spanish:

Program: ${grant.program}
Agency: ${grant.agency}
Amount: ${grant.amount}
Sector: ${grant.sector}
Region: ${grant.region}
Deadline: ${grant.deadline}
URL: ${grant.url}

Format as JSON: {"en": "summary", "es": "resumen"}`;

  const result = await llm.text(prompt, { 
    maxTokens: 300,
    model: 'claude-3-opus', // Best for structured summaries
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
  }

  return {
    en: `${grant.program} (${grant.agency}) - ${grant.amount} - Deadline: ${grant.deadline}`,
    es: `${grant.program} (${grant.agency}) - ${grant.amount} - Fecha límite: ${grant.deadline}`,
  };
}

export async function runGrantRadar(): Promise<void> {
  console.log('🔍 Running grant radar...');

  const grants = await fetchGrants();
  const upcoming = grants.filter(
    (g) => new Date(g.deadline) > new Date() && new Date(g.deadline) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  );

  if (upcoming.length === 0) {
    console.log('No upcoming grants found');
    return;
  }

  const summaries = await Promise.all(upcoming.map(summarizeGrant));

  const emailBody = summaries
    .map((s, i) => {
      const g = upcoming[i];
      return `
        <h3>${g.program}</h3>
        <p><strong>Agency:</strong> ${g.agency}</p>
        <p><strong>Amount:</strong> ${g.amount}</p>
        <p><strong>Sector:</strong> ${g.sector}</p>
        <p><strong>Deadline:</strong> ${g.deadline}</p>
        <p><strong>URL:</strong> <a href="${g.url}">${g.url}</a></p>
        <p><strong>EN:</strong> ${s.en}</p>
        <p><strong>ES:</strong> ${s.es}</p>
        <hr>
      `;
    })
    .join('');

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `Grant Opportunities — ${upcoming.length} Upcoming`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Grant Opportunities</h1>
        ${emailBody}
      </div>
    `,
  });

  if (result.ok) {
    console.log(`✅ Grant radar report sent: ${upcoming.length} opportunities`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGrantRadar().catch(console.error);
}

