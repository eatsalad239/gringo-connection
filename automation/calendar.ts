/**
 * Content Calendar Engine - builds 30-day rolling posting plan
 * Mixes per-day slots, rotates verticals/languages, respects blackouts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';

const CONTENT_DIR = join(process.cwd(), 'content');
const TOURS_PATH = join(CONTENT_DIR, 'tours.json');
const SCHEDULE_PATH = join(CONTENT_DIR, 'social', 'schedule.json');
const QUEUE_PATH = join(CONTENT_DIR, 'social', 'queue.json');

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';

interface ScheduleSlot {
  date: string; // ISO date in DEFAULT_TZ
  time: string; // HH:mm in DEFAULT_TZ
  type: 'authority' | 'lifestyle' | 'testimonial' | 'event' | 'offer';
  vertical?: string;
  language: 'en' | 'es';
  postId?: string; // Reference to queue.json post
}

interface Tour {
  id: string;
  name: string;
  dates: string[]; // ISO dates
  blackoutDates?: string[]; // ISO dates to avoid posting
}

function loadTours(): Tour[] {
  try {
    const data = readFileSync(TOURS_PATH, 'utf-8');
    return JSON.parse(data).tours || [];
  } catch {
    return [];
  }
}

function loadQueue(): any[] {
  try {
    const data = readFileSync(QUEUE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function getBlackoutDates(tours: Tour[]): Set<string> {
  const blackouts = new Set<string>();
  for (const tour of tours) {
    if (tour.blackoutDates) {
      tour.blackoutDates.forEach((d) => blackouts.add(d));
    }
  }
  return blackouts;
}

function generateSlotsForDay(date: Date, blackouts: Set<string>): ScheduleSlot[] {
  const dateStr = format(date, 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });
  
  if (blackouts.has(dateStr)) {
    return []; // Skip blackout dates
  }

  const slots: ScheduleSlot[] = [];
  const dayOfWeek = date.getDay();

  // Authority post (morning)
  slots.push({
    date: dateStr,
    time: '09:15',
    type: 'authority',
    language: Math.random() < 0.3 ? 'en' : 'es', // 30% EN, 70% ES
  });

  // Lifestyle post (midday)
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    // Skip weekends for lifestyle
    slots.push({
      date: dateStr,
      time: '13:30',
      type: 'lifestyle',
      language: Math.random() < 0.3 ? 'en' : 'es',
    });
  }

  // Event/Offer post (evening)
  slots.push({
    date: dateStr,
    time: '19:00',
    type: dayOfWeek === 5 ? 'offer' : 'event', // Friday = offer
    language: Math.random() < 0.3 ? 'en' : 'es',
  });

  return slots;
}

function assignVertical(slot: ScheduleSlot, index: number): ScheduleSlot {
  const verticals = ['law', 'clinics', 'restaurants', 'education', 'startups', 'real-estate'];
  slot.vertical = verticals[index % verticals.length];
  return slot;
}

export async function buildCalendar(): Promise<void> {
  console.log('📅 Building 30-day calendar...');

  const tours = loadTours();
  const blackouts = getBlackoutDates(tours);
  const now = new Date();
  const slots: ScheduleSlot[] = [];

  // Generate 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const daySlots = generateSlotsForDay(date, blackouts);
    
    // Assign verticals
    daySlots.forEach((slot, idx) => {
      assignVertical(slot, slots.length + idx);
    });

    slots.push(...daySlots);
  }

  // Insert event teasers 48h before tour dates
  for (const tour of tours) {
    for (const tourDate of tour.dates) {
      const tourDt = new Date(tourDate);
      const teaserDate = new Date(tourDt);
      teaserDate.setDate(teaserDate.getDate() - 2);
      
      const dateStr = format(teaserDate, 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });
      if (!blackouts.has(dateStr)) {
        slots.push({
          date: dateStr,
          time: '19:00',
          type: 'event',
          language: 'es',
          vertical: 'tours',
        });
      }
    }
  }

  // Sort by date + time
  slots.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  // Write schedule
  writeFileSync(SCHEDULE_PATH, JSON.stringify(slots, null, 2), 'utf-8');
  console.log(`✅ Calendar built: ${slots.length} slots over 30 days`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildCalendar().catch(console.error);
}

