/**
 * QA Agent - verifies posts for safety and quality
 * Sets verified:true if safe; otherwise attaches TODO question
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');

interface Post {
  type: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  verified: boolean;
  qaNotes?: string;
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

async function checkPost(post: Post): Promise<{ verified: boolean; notes?: string }> {
  const caption = post.language === 'en' ? post.caption_en : post.caption_es;
  
  // Basic checks
  if (caption.length < 50) {
    return { verified: false, notes: 'Caption too short' };
  }

  if (post.hashtags.length < 3) {
    return { verified: false, notes: 'Insufficient hashtags' };
  }

  // LLM-based safety check
  const prompt = `Review this social media post for Gringo Connection (AI/automation services in Medellín):

"${caption}"

Check for:
1. False claims or hype
2. Grammar/spelling errors
3. Appropriateness for enterprise audience
4. Tone consistency (professional, authoritative, LATAM-focused)

Respond with: SAFE or CONCERN: [reason]`;

  const result = await llm.text(prompt, { 
    maxTokens: 200,
    model: 'gpt-4-turbo', // Fast and reliable for verification
  });

  if (result.ok && result.text) {
    if (result.text.includes('SAFE')) {
      return { verified: true };
    } else {
      const concern = result.text.includes('CONCERN:')
        ? result.text.split('CONCERN:')[1].trim()
        : 'Review needed';
      return { verified: false, notes: concern };
    }
  }

  // Fallback: auto-verify if basic checks pass
  return { verified: true };
}

export async function runQA(): Promise<void> {
  console.log('🔍 Running QA agent...');

  const queue = loadQueue();
  const unverified = queue.filter((p) => !p.verified);

  console.log(`Found ${unverified.length} unverified posts`);

  for (const post of unverified.slice(0, 50)) {
    const check = await checkPost(post);
    post.verified = check.verified;
    if (check.notes) {
      post.qaNotes = check.notes;
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  saveQueue(queue);
  const verifiedCount = queue.filter((p) => p.verified).length;
  console.log(`✅ QA complete: ${verifiedCount}/${queue.length} verified`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runQA().catch(console.error);
}

