/**
 * Tour Engine - manages weekly events from tours.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { format, parseISO, addDays } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

const CONTENT_DIR = join(process.cwd(), 'content');
const TOURS_PATH = join(CONTENT_DIR, 'tours.json');
const SCHEDULE_PATH = join(CONTENT_DIR, 'social', 'schedule.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';

interface Tour {
  id: string;
  name: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  capacity: number;
  dates: string[];
  blackoutDates?: string[];
  upsells?: Array<{ name: string; price: number }>;
}

export async function syncTours(): Promise<void> {
  const tours = JSON.parse(readFileSync(TOURS_PATH, 'utf-8')).tours || [];
  const schedule = JSON.parse(readFileSync(SCHEDULE_PATH, 'utf-8'));

  // Insert event teasers 48h before tour dates
  for (const tour of tours) {
    for (const tourDate of tour.dates) {
      const tourDt = parseISO(tourDate);
      const teaserDate = addDays(tourDt, -2);
      const dateStr = format(teaserDate, 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });

      // Check if teaser already exists
      const exists = schedule.some(
        (s: any) => s.date === dateStr && s.type === 'event' && s.vertical === 'tours'
      );

      if (!exists) {
        schedule.push({
          date: dateStr,
          time: '19:00',
          type: 'event',
          language: 'es',
          vertical: 'tours',
          tourId: tour.id,
        });
      }
    }
  }

  // Sort and save
  schedule.sort((a: any, b: any) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  writeFileSync(SCHEDULE_PATH, JSON.stringify(schedule, null, 2), 'utf-8');
  console.log('✅ Tours synced to schedule');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncTours().catch(console.error);
}

