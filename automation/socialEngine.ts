/**
 * Social Engine - generates and refreshes posts from seeds
 * Expands seeds to 30+ polished EN/ES posts; LATAM-authority tone
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';

interface Post {
  type: 'authority' | 'lifestyle' | 'testimonial' | 'event' | 'offer';
  vertical?: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  media_prompt?: string;
  reel_script?: string;
  verified: boolean;
  createdAt?: string;
}

const CONTENT_DIR = join(process.cwd(), 'content');
const SEED_PATH = join(CONTENT_DIR, 'social', 'posts.seed.json');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');

async function loadSeeds(): Promise<Post[]> {
  try {
    const data = readFileSync(SEED_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function loadQueue(): Promise<Post[]> {
  try {
    const data = readFileSync(QUEUE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveQueue(posts: Post[]): Promise<void> {
  writeFileSync(QUEUE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

async function generatePostVariations(seed: Post): Promise<Post[]> {
  const variations: Post[] = [];

  // Generate EN variation
  const enPrompt = `Generate a social media post for Gringo Connection (AI/automation services in Medellín, Colombia).

Type: ${seed.type}
Vertical: ${seed.vertical || 'general'}
Tone: Professional, authoritative, LATAM-focused, no hype, enterprise-grade

Write a compelling caption in English (max 220 chars), then suggest 5-8 relevant hashtags.
Format: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`;

  const enResult = await llm.text(enPrompt, {
    maxTokens: 300,
    temperature: 0.8,
    model: 'gpt-4-turbo', // Best for creative social posts
  });

  if (enResult.ok && enResult.text) {
    const [caption, hashtagsLine] = enResult.text.split('\n\n');
    const hashtags = hashtagsLine?.replace('HASHTAGS:', '').trim().split(/\s+/) || seed.hashtags;

    variations.push({
      ...seed,
      language: 'en',
      caption_en: caption.trim(),
      caption_es: seed.caption_es, // Keep original ES
      hashtags: hashtags.slice(0, 8),
      verified: false,
    });
  }

  // Generate ES variation
  const esPrompt = `Genera un post para redes sociales de Gringo Connection (servicios de IA/automatización en Medellín, Colombia).

Tipo: ${seed.type}
Vertical: ${seed.vertical || 'general'}
Tono: Profesional, autoritativo, enfocado en LATAM, sin exageraciones, nivel empresarial

Escribe un caption convincente en español colombiano (máx 220 caracteres), luego sugiere 5-8 hashtags relevantes.
Formato: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`;

  const esResult = await llm.text(esPrompt, {
    maxTokens: 300,
    temperature: 0.8,
    model: 'gpt-4-turbo', // Best for creative social posts
  });

  if (esResult.ok && esResult.text) {
    const [caption, hashtagsLine] = esResult.text.split('\n\n');
    const hashtags = hashtagsLine?.replace('HASHTAGS:', '').trim().split(/\s+/) || seed.hashtags;

    variations.push({
      ...seed,
      language: 'es',
      caption_en: seed.caption_en, // Keep original EN
      caption_es: caption.trim(),
      hashtags: hashtags.slice(0, 8),
      verified: false,
    });
  }

  return variations;
}

export async function generatePosts(): Promise<void> {
  console.log('🌱 Loading seeds...');
  const seeds = await loadSeeds();
  console.log(`Found ${seeds.length} seed posts`);

  console.log('📝 Generating variations...');
  const allVariations: Post[] = [];

  for (const seed of seeds) {
    const variations = await generatePostVariations(seed);
    allVariations.push(...variations);
    
    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Generated ${allVariations.length} variations`);

  // Load existing queue and merge
  const existing = await loadQueue();
  const existingIds = new Set(
    existing.map((p) => `${p.type}-${p.language}-${p.caption_en.slice(0, 50)}`)
  );

  const newPosts = allVariations.filter(
    (p) => !existingIds.has(`${p.type}-${p.language}-${p.caption_en.slice(0, 50)}`)
  );

  const updated = [...existing, ...newPosts].map((p) => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
  }));

  await saveQueue(updated);
  console.log(`✅ Queue updated: ${updated.length} total posts (${newPosts.length} new)`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePosts().catch(console.error);
}

