import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';

const CONTENT_DIR = join(process.cwd(), 'content');
const BACKUP_DIR = join(process.cwd(), 'backups');

const files = [
  'i18n/en.json',
  'i18n/es.json',
  'services.json',
  'verticals.json',
  'tours.json',
  'social/posts.seed.json',
  'social/queue.json',
  'social/schedule.json',
  'grants/grants_matrix.json',
];

const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
const backupPath = join(BACKUP_DIR, timestamp);

mkdirSync(backupPath, { recursive: true });

for (const file of files) {
  try {
    copyFileSync(
      join(CONTENT_DIR, file),
      join(backupPath, file.replace(/\//g, '_'))
    );
  } catch (e) {
    console.warn(`Failed to backup ${file}:`, e);
  }
}

console.log(`✅ Content backed up to ${backupPath}`);

