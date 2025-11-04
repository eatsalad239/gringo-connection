/**
 * Media Generator - automatically generates images/videos for posts
 * Generates media for posts with media_prompt but no media asset
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { media } from './providers.js';
import { generateSDXL } from './media/image.sdxl.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');
const MEDIA_DIR = join(process.cwd(), 'content', 'social', 'media');

interface Post {
  type: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  media_prompt?: string;
  media_url?: string;
  media_path?: string;
  verified: boolean;
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

export async function generateMediaForPosts(limit: number = 20): Promise<void> {
  console.log('🎨 Generating media for posts...');
  
  mkdirSync(MEDIA_DIR, { recursive: true });
  
  const queue = loadQueue();
  const postsNeedingMedia = queue
    .filter((p) => p.media_prompt && !p.media_path && !p.media_url)
    .slice(0, limit);

  console.log(`Found ${postsNeedingMedia.length} posts needing media`);

  for (const post of postsNeedingMedia) {
    if (!post.media_prompt) continue;

    try {
      console.log(`Generating media for: ${post.caption_en.slice(0, 50)}...`);
      
      // Generate image
      const result = await generateSDXL(post.media_prompt, {
        refiner: true,
        numSteps: 30,
        guidanceScale: 7.5,
      });

      if (result.ok && result.buffer) {
        const filename = `post-${Date.now()}-${post.type}.png`;
        const filepath = join(MEDIA_DIR, filename);
        writeFileSync(filepath, result.buffer);
        
        // Update post with media path
        const postIndex = queue.findIndex((p) => 
          p.caption_en === post.caption_en && p.caption_es === post.caption_es
        );
        if (postIndex !== -1) {
          queue[postIndex].media_path = `social/media/${filename}`;
          console.log(`✅ Generated: ${filename}`);
        }
      } else {
        console.warn(`⚠️  Failed to generate media: ${result.reason}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error generating media for post:`, error);
    }
  }

  saveQueue(queue);
  console.log(`✅ Media generation complete`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMediaForPosts(20).catch(console.error);
}

