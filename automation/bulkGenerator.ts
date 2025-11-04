/**
 * Bulk Content Generator - generates large batches of content
 * Use for initial setup or content refills
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';
import { generateMediaForPosts } from './mediaGenerator.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const SEED_PATH = join(CONTENT_DIR, 'social', 'posts.seed.json');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');

interface Post {
  type: 'authority' | 'lifestyle' | 'testimonial' | 'event' | 'offer';
  vertical?: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  media_prompt?: string;
  verified: boolean;
  createdAt?: string;
}

const VERTICALS = ['law', 'clinics', 'restaurants', 'education', 'startups', 'real-estate'];
const POST_TYPES: Post['type'][] = ['authority', 'lifestyle', 'testimonial', 'event', 'offer'];

async function generateBulkPosts(count: number = 50): Promise<Post[]> {
  console.log(`🚀 Generating ${count} bulk posts...`);
  
  const posts: Post[] = [];
  const existing = loadQueue();
  const existingIds = new Set(
    existing.map((p) => `${p.type}-${p.language}-${p.caption_en.slice(0, 50)}`)
  );

  for (let i = 0; i < count; i++) {
    const type = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)];
    const vertical = VERTICALS[Math.floor(Math.random() * VERTICALS.length)];
    const language: 'en' | 'es' = Math.random() < 0.7 ? 'es' : 'en';

    const prompt = language === 'en'
      ? `Generate a ${type} social media post for Gringo Connection (AI/automation services in Medellín, Colombia).
        
Vertical: ${vertical}
Tone: Professional, authoritative, LATAM-focused, no hype, enterprise-grade

Write a compelling caption (max 220 chars), then suggest 5-8 relevant hashtags.
Format: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`
      : `Genera un post de tipo ${type} para Gringo Connection (servicios de IA/automatización en Medellín, Colombia).

Vertical: ${vertical}
Tono: Profesional, autoritativo, enfocado en LATAM, sin exageraciones, nivel empresarial

Escribe un caption convincente (máx 220 caracteres), luego sugiere 5-8 hashtags relevantes.
Formato: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`;

    try {
      const result = await llm.text(prompt, {
        maxTokens: 300,
        temperature: 0.8,
        model: 'gpt-4-turbo',
      });

      if (result.ok && result.text) {
        const [caption, hashtagsLine] = result.text.split('\n\n');
        const hashtags = hashtagsLine?.replace('HASHTAGS:', '').trim().split(/\s+/) || [];

        const post: Post = {
          type,
          vertical,
          language,
          caption_en: language === 'en' ? caption.trim() : '',
          caption_es: language === 'es' ? caption.trim() : '',
          hashtags: hashtags.slice(0, 8),
          media_prompt: `Professional ${vertical} business in Medellín, Colombia, modern office with AI technology, ${type} theme`,
          verified: false,
          createdAt: new Date().toISOString(),
        };

        // Generate opposite language version
        if (language === 'en') {
          const esPrompt = `Traduce y adapta este post a español colombiano, manteniendo el tono profesional:

"${caption}"

Formato: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`;
          
          const esResult = await llm.text(esPrompt, {
            maxTokens: 300,
            temperature: 0.7,
          });

          if (esResult.ok && esResult.text) {
            const [esCaption] = esResult.text.split('\n\n');
            post.caption_es = esCaption.trim();
          }
        } else {
          const enPrompt = `Translate and adapt this post to English, maintaining professional tone:

"${caption}"

Format: CAPTION\n\nHASHTAGS: tag1 tag2 tag3...`;
          
          const enResult = await llm.text(enPrompt, {
            maxTokens: 300,
            temperature: 0.7,
          });

          if (enResult.ok && enResult.text) {
            const [enCaption] = enResult.text.split('\n\n');
            post.caption_en = enCaption.trim();
          }
        }

        const postId = `${post.type}-${post.language}-${post.caption_en.slice(0, 50)}`;
        if (!existingIds.has(postId)) {
          posts.push(post);
          existingIds.add(postId);
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`Error generating post ${i + 1}:`, error);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1}/${count} posts...`);
    }
  }

  return posts;
}

function loadQueue(): Post[] {
  try {
    const data = readFileSync(QUEUE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveQueue(posts: Post[]): void {
  writeFileSync(QUEUE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function generateBulkContent(count: number = 50, generateMedia: boolean = false): Promise<void> {
  console.log(`📦 Starting bulk content generation (${count} posts)...`);
  
  const existing = loadQueue();
  const newPosts = await generateBulkPosts(count);
  
  const updated = [...existing, ...newPosts];
  saveQueue(updated);
  
  console.log(`✅ Generated ${newPosts.length} new posts`);
  console.log(`Total queue: ${updated.length} posts`);

  if (generateMedia) {
    console.log('🎨 Generating media for new posts...');
    await generateMediaForPosts(newPosts.length);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = parseInt(process.argv[2]) || 50;
  const withMedia = process.argv[3] === '--media';
  generateBulkContent(count, withMedia).catch(console.error);
}

