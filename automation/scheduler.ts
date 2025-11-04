/**
 * Daily Posting Scheduler - executes calendar slots
 * Tries Buffer → Meta → Posting Pack fallback
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { format, parseISO, isAfter } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { schedulers, mail } from './providers.js';
import { buildCalendar } from './calendar.js';
import { generatePosts } from './socialEngine.js';
import { createPostingPack } from './postingPack.js';
import { refreshOldContent } from './contentRefresh.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const SCHEDULE_PATH = join(CONTENT_DIR, 'social', 'schedule.json');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface ScheduleSlot {
  date: string;
  time: string;
  type: string;
  vertical?: string;
  language: 'en' | 'es';
  postId?: string;
}

interface Post {
  type: string;
  language: 'en' | 'es';
  caption_en: string;
  caption_es: string;
  hashtags: string[];
  verified: boolean;
}

function loadSchedule(): ScheduleSlot[] {
  try {
    const data = readFileSync(SCHEDULE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
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

function findMatchingPost(slot: ScheduleSlot, queue: Post[]): Post | null {
  const candidates = queue.filter(
    (p) =>
      p.type === slot.type &&
      p.language === slot.language &&
      (!slot.vertical || p.vertical === slot.vertical) &&
      p.verified
  );

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function ensureQueueSupply(): Promise<void> {
  const queue = loadQueue();
  const verified = queue.filter((p) => p.verified);
  const daysNeeded = 7;

  if (verified.length < daysNeeded * 3) {
    console.log(`⚠️  Low verified posts (${verified.length}), generating more...`);
    await generatePosts();
    
    // Run QA agent to verify some posts
    const updated = loadQueue();
    const unverified = updated.filter((p) => !p.verified);
    
    // Auto-verify safe posts (simple heuristic)
    for (const post of unverified.slice(0, 20)) {
      if (
        post.caption_en.length > 50 &&
        post.caption_es.length > 50 &&
        post.hashtags.length >= 3
      ) {
        post.verified = true;
      }
    }
    
    saveQueue(updated);
    console.log(`✅ Queue refreshed: ${updated.filter((p) => p.verified).length} verified`);
  }
}

async function schedulePost(slot: ScheduleSlot, post: Post): Promise<boolean> {
  const dateTime = `${slot.date}T${slot.time}`;
  const scheduledAt = zonedTimeToUtc(parseISO(dateTime), DEFAULT_TZ);

  // Skip if already passed
  if (isAfter(new Date(), scheduledAt)) {
    return false;
  }

  const caption = slot.language === 'en' ? post.caption_en : post.caption_es;
  const text = `${caption}\n\n${post.hashtags.join(' ')}`;

  // Try Buffer first
  if (process.env.BUFFER_TOKEN) {
    const result = await schedulers.buffer({
      text,
      scheduledAt,
      platforms: ['facebook', 'instagram'],
    });

    if (result.ok) {
      console.log(`✅ Scheduled via Buffer: ${slot.date} ${slot.time}`);
      return true;
    }
  }

  // Try Meta
  if (process.env.META_PAGE_ACCESS_TOKEN) {
    const result = await schedulers.meta({
      message: text,
      scheduledPublishTime: scheduledAt,
    });

    if (result.ok) {
      console.log(`✅ Scheduled via Meta: ${slot.date} ${slot.time}`);
      return true;
    }
  }

  return false;
}

export async function runScheduler(): Promise<void> {
  console.log('🚀 Starting daily scheduler...');

  // Refresh old content (once per week)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) { // Sunday
    console.log('🔄 Running weekly content refresh...');
    await refreshOldContent();
  }

  // Refresh calendar
  await buildCalendar();

  // Ensure queue supply
  await ensureQueueSupply();

  const schedule = loadSchedule();
  const queue = loadQueue();
  const today = format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });

  // Process today's slots
  const todaySlots = schedule.filter((s) => s.date === today);
  const unscheduled: ScheduleSlot[] = [];

  for (const slot of todaySlots) {
    const post = findMatchingPost(slot, queue);
    if (!post) {
      console.warn(`⚠️  No matching post for ${slot.date} ${slot.time}`);
      unscheduled.push(slot);
      continue;
    }

    const scheduled = await schedulePost(slot, post);
    if (!scheduled) {
      unscheduled.push(slot);
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Auto-run QA agent on new posts
  if (process.env.AUTO_QA !== 'false') {
    try {
      const { runQA } = await import('./agents/qaAgent.js');
      console.log('🔍 Running QA agent on unverified posts...');
      await runQA();
      // Reload queue after QA
      const refreshedQueue = loadQueue();
      Object.assign(queue, refreshedQueue);
    } catch (e) {
      console.warn('QA agent failed:', e);
    }
  }

  // If unscheduled posts, create posting pack
  if (unscheduled.length > 0 || (!process.env.BUFFER_TOKEN && !process.env.META_PAGE_ACCESS_TOKEN)) {
    console.log('📦 Creating posting pack for manual posting...');
    const packPath = await createPostingPack(unscheduled, queue);

    // Email pack
    const emailResult = await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `Manual Posting Pack (EN/ES) — ${today}`,
      html: `
        <p>Hello,</p>
        <p>Today's posting pack is attached. ${unscheduled.length} posts need manual scheduling.</p>
        <p>Best,<br>Gringo Connection Automation</p>
      `,
      attachments: [
        {
          filename: `social-pack_${today}.zip`,
          content: readFileSync(packPath),
        },
      ],
    });

    if (emailResult.ok) {
      console.log(`✅ Posted pack emailed to ${EOD_TO}`);
    } else {
      console.warn(`⚠️  Email failed: ${emailResult.reason}`);
    }
  }

  console.log('✅ Scheduler complete');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScheduler().catch(console.error);
}

