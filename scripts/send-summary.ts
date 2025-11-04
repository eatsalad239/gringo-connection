import { mail } from '../automation/providers.js';
import { format } from 'date-fns-tz';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

const today = format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ });

await mail.send({
  to: EOD_TO.split(',').map((e) => e.trim()),
  subject: `Daily Automation Summary — ${today}`,
  html: `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Daily Automation Summary</h2>
      <p>Date: ${today}</p>
      <p>The daily automation workflow has completed.</p>
      <p>Check GitHub Actions artifacts for posting pack if manual posting is needed.</p>
    </div>
  `,
});

console.log('✅ Summary email sent');

