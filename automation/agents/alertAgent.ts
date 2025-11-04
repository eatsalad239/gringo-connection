/**
 * Alert Agent - realtime alerts
 * Deadline<48h, deploy fail, DM backlog, bounce>2%
 */

import { mail } from '../providers.js';

const ALERT_TO = process.env.ALERT_TO || 'dan@doorknockingsucks.com';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface Alert {
  type: 'deadline' | 'deploy' | 'dm' | 'bounce';
  severity: 'high' | 'medium' | 'low';
  messageEn: string;
  messageEs: string;
  actionUrl?: string;
}

export async function sendAlert(alert: Alert): Promise<void> {
  const result = await mail.send({
    to: ALERT_TO.split(',').map((e) => e.trim()),
    subject: `🚨 Alert: ${alert.type.toUpperCase()} — ${alert.severity}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>English</h2>
        <p>${alert.messageEn}</p>
        ${alert.actionUrl ? `<p><a href="${alert.actionUrl}">Take Action</a></p>` : ''}
        <hr style="margin: 40px 0;">
        <h2>Español</h2>
        <p>${alert.messageEs}</p>
        ${alert.actionUrl ? `<p><a href="${alert.actionUrl}">Tomar Acción</a></p>` : ''}
      </div>
    `,
  });

  if (result.ok) {
    console.log(`✅ Alert sent: ${alert.type}`);
  }

  // Send to Slack if configured
  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.type.toUpperCase()}: ${alert.messageEn}`,
        }),
      });
    } catch (e) {
      console.warn('Slack webhook failed:', e);
    }
  }
}

export async function checkDeadlines(): Promise<void> {
  // Check grants for deadlines < 48h
  // Implementation would load grants and check dates
}

export async function checkDeployStatus(): Promise<void> {
  // Check deployment status
  // Implementation would ping deployment endpoints
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDeadlines().catch(console.error);
}

