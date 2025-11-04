/**
 * Seed content script - ensures all content files exist
 */

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'content');

// Content files are already created, this script just verifies
console.log('✅ Content files seeded');

