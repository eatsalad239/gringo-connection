import { mail } from '../automation/providers.js';

const EDDY_EMAIL = 'Eddy@doorknockingsucks.com';

const html = `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">✅ Email Forwarding Setup Complete</h1>
    
    <p>Hi Eddy,</p>
    
    <p>I've configured the system so you'll receive all important emails from Gringo Connection automatically.</p>
    
    <h2 style="color: #1e40af; margin-top: 30px;">📧 What You'll Receive</h2>
    
    <ul style="line-height: 1.8;">
      <li><strong>Lead Submissions</strong> - Every contact form submission (real-time)</li>
      <li><strong>Daily Intake Questions</strong> - Priority questions sent 2x daily (09:15 & 14:00)</li>
      <li><strong>End-of-Day Reports</strong> - Daily summary at 9:30 PM Bogota time</li>
      <li><strong>Grant Opportunities</strong> - High-fit grant matches (Mon & Thu at 8:00 AM)</li>
      <li><strong>Posting Packs</strong> - Daily social media content packs (when manual posting needed)</li>
      <li><strong>Alerts</strong> - Critical notifications (deadlines, deploy failures, etc.)</li>
      <li><strong>Daily Summaries</strong> - Automation workflow summaries</li>
      <li><strong>Launch Reports</strong> - System readiness reports</li>
    </ul>
    
    <h2 style="color: #1e40af; margin-top: 30px;">⚙️ How It Works</h2>
    
    <p>All emails are sent to both <strong>dan@doorknockingsucks.com</strong> and <strong>Eddy@doorknockingsucks.com</strong> simultaneously. You'll receive identical copies of all important communications.</p>
    
    <p>The system is configured to include you by default, so this will work automatically going forward.</p>
    
    <h2 style="color: #1e40af; margin-top: 30px;">🚀 Status</h2>
    
    <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
      <strong>✅ Complete</strong> - You're all set! All emails will be forwarded to you starting now.
    </p>
    
    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
      If you have any questions or need to adjust which emails you receive, just let Dan know.
    </p>
    
    <p style="margin-top: 30px;">
      Best,<br>
      <strong>Gringo Connection Automation</strong>
    </p>
  </div>
`;

const result = await mail.send({
  to: EDDY_EMAIL,
  subject: '✅ Email Forwarding Setup Complete - Gringo Connection',
  html,
});

if (result.ok) {
  console.log(`✅ Update email sent to ${EDDY_EMAIL}`);
} else {
  console.error(`❌ Failed to send email: ${result.reason}`);
  process.exit(1);
}

