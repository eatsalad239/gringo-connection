/**
 * Posting Pack Generator - creates ZIP for manual posting
 * Includes captions, hashtags, schedule CSV, and assets
 */

import { writeFileSync, mkdirSync, readFileSync, createWriteStream } from 'fs';
import { join } from 'path';
import archiver from 'archiver';

const CONTENT_DIR = join(process.cwd(), 'content');
const DIST_DIR = join(process.cwd(), 'dist');

interface ScheduleSlot {
  date: string;
  time: string;
  type: string;
  language: 'en' | 'es';
}

interface Post {
  caption_en: string;
  caption_es: string;
  hashtags: string[];
}

export async function createPostingPack(
  slots: ScheduleSlot[],
  queue: Post[]
): Promise<string> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const packDir = join(DIST_DIR, `pack-${today}`);
  mkdirSync(packDir, { recursive: true });
  mkdirSync(join(packDir, 'assets'), { recursive: true });

  // Generate captions files
  const captionsEn: string[] = [];
  const captionsEs: string[] = [];
  const hashtags: string[] = [];
  const scheduleRows: string[] = ['Date,Time,Language,Type,Caption,Hashtags'];

  for (const slot of slots) {
    const post = queue.find(
      (p) =>
        p.language === slot.language &&
        (slot.type === 'any' || p.type === slot.type)
    ) || queue[0];

    if (slot.language === 'en') {
      captionsEn.push(`${slot.date} ${slot.time}\n${post.caption_en}\n`);
    } else {
      captionsEs.push(`${slot.date} ${slot.time}\n${post.caption_es}\n`);
    }

    hashtags.push(post.hashtags.join(' '));

    scheduleRows.push(
      `${slot.date},${slot.time},${slot.language},${slot.type},"${slot.language === 'en' ? post.caption_en : post.caption_es}","${post.hashtags.join(' ')}"`
    );
  }

  writeFileSync(join(packDir, 'captions_en.txt'), captionsEn.join('\n---\n\n'), 'utf-8');
  writeFileSync(join(packDir, 'captions_es.txt'), captionsEs.join('\n---\n\n'), 'utf-8');
  writeFileSync(join(packDir, 'hashtags.txt'), hashtags.join('\n'), 'utf-8');
  writeFileSync(join(packDir, 'schedule.csv'), scheduleRows.join('\n'), 'utf-8');

  // Create ZIP
  const zipPath = join(DIST_DIR, `social-pack_${today}.zip`);
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ ZIP created: ${zipPath} (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    archive.directory(packDir, false);
    archive.finalize();
  });
}

