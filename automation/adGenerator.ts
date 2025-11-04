/**
 * Ad Generator - creates 3 bilingual ad sets
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DIST_DIR = join(process.cwd(), 'dist');

interface AdSet {
  name: string;
  vertical: string;
  primaryText_en: string;
  primaryText_es: string;
  headline_en: string;
  headline_es: string;
  description_en: string;
  description_es: string;
  cta: string;
  targeting: {
    interests: string[];
    demographics: string[];
    locations: string[];
  };
}

async function generateAdSet(vertical: string, name: string): Promise<AdSet> {
  const prompt = `Create a Facebook/Instagram ad set for Gringo Connection targeting ${vertical} businesses in Colombia.

Include:
- Primary text (max 125 chars) - EN and ES
- Headline (max 40 chars) - EN and ES
- Description (max 30 chars) - EN and ES
- CTA button text
- Targeting suggestions (interests, demographics, locations)

Format as JSON:
{
  "primaryText_en": "...",
  "primaryText_es": "...",
  "headline_en": "...",
  "headline_es": "...",
  "description_en": "...",
  "description_es": "...",
  "cta": "...",
  "targeting": {
    "interests": ["..."],
    "demographics": ["..."],
    "locations": ["Colombia", "Medellín"]
  }
}`;

  const result = await llm.text(prompt, { 
    maxTokens: 800,
    model: 'claude-3-opus', // Best for creative ad copy
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          name,
          vertical,
          ...parsed,
        };
      }
    } catch {}
  }

  // Fallback
  return {
    name,
    vertical,
    primaryText_en: `Transform your ${vertical} business with AI automation. Built in Medellín.`,
    primaryText_es: `Transforma tu negocio de ${vertical} con automatización IA. Hecho en Medellín.`,
    headline_en: 'AI That Elevates Your Brand',
    headline_es: 'IA Que Eleva Tu Marca',
    description_en: 'Enterprise-grade solutions',
    description_es: 'Soluciones nivel empresa',
    cta: 'Learn More',
    targeting: {
      interests: [`${vertical} business`, 'entrepreneurship', 'digital transformation'],
      demographics: ['Business owners', '25-55'],
      locations: ['Colombia', 'Medellín'],
    },
  };
}

export async function generateAds(): Promise<void> {
  console.log('📢 Generating ad sets...');

  const adSets: AdSet[] = [];

  // Law
  adSets.push(await generateAdSet('law', 'Law Firms'));
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Clinics
  adSets.push(await generateAdSet('clinics', 'Medical Clinics'));
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Gato Blanco Tours
  adSets.push(await generateAdSet('tours', 'Gato Blanco Tours'));

  const output = {
    generatedAt: new Date().toISOString(),
    adSets,
  };

  mkdirSync(DIST_DIR, { recursive: true });
  writeFileSync(join(DIST_DIR, 'ads.json'), JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Generated ${adSets.length} ad sets → dist/ads.json`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAds().catch(console.error);
}

