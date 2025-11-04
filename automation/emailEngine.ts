/**
 * Email Engine - orchestrates agent emails
 */

import { runIntake } from './agents/intakeAgent.js';
import { runEOD } from './agents/eodAgent.js';
import { runGrantAgent } from './agents/grantAgent.js';

export async function runEmails(): Promise<void> {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Intake at 09:15 & 14:00
  if (hour === 9 || hour === 14) {
    await runIntake();
  }

  // EOD at 21:30
  if (hour === 21) {
    await runEOD();
  }

  // Grant agent Mon & Thu at 08:00
  if (hour === 8 && (dayOfWeek === 1 || dayOfWeek === 4)) {
    await runGrantAgent();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEmails().catch(console.error);
}

