/**
 * Content Refresh Engine - refreshes old content automatically
 * Identifies posts older than X days and regenerates them
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseISO, differenceInDays } from 'date-fns';
import { generatePosts } from './socialEngine.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');

interface Post {
  type: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  verified: boolean;
  createdAt?: string;
  lastUsed?: string;
  useCount?: number;
}

const MAX_AGE_DAYS = 30; // Refresh posts older than 30 days
const MAX_USES = 10; // Refresh posts used more than 10 times

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

export async function refreshOldContent(): Promise<void> {
  console.log('🔄 Refreshing old content...');
  
  const queue = loadQueue();
  const now = new Date();
  const postsToRefresh: Post[] = [];

  for (const post of queue) {
    const createdAt = post.createdAt ? parseISO(post.createdAt) : null;
    const age = createdAt ? differenceInDays(now, createdAt) : 0;
    const useCount = post.useCount || 0;

    // Mark for refresh if too old or overused
    if (age > MAX_AGE_DAYS || useCount > MAX_USES) {
      postsToRefresh.push(post);
    }
  }

  console.log(`Found ${postsToRefresh.length} posts to refresh`);

  if (postsToRefresh.length > 0) {
    // Remove old posts
    const refreshedQueue = queue.filter((p) => !postsToRefresh.includes(p));
    saveQueue(refreshedQueue);

    // Regenerate new content
    console.log('Generating fresh content...');
    await generatePosts();
  }

  console.log('✅ Content refresh complete');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  refreshOldContent().catch(console.error);
}

