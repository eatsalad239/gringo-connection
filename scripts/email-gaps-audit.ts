/**
 * Email Missing Gaps Audit to Dan & Eddy
 */

import { mail } from '../automation/providers.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const EDDY_EMAIL = 'Eddy@doorknockingsucks.com';
const DAN_EMAIL = 'dan@doorknockingsucks.com';
const RECIPIENTS = [EDDY_EMAIL, DAN_EMAIL];

// Read the audit file
const auditPath = join(process.cwd(), 'MISSING_GAPS_AUDIT.md');
let auditContent = '';
if (existsSync(auditPath)) {
  auditContent = readFileSync(auditPath, 'utf-8');
}

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #1f2937; max-width: 900px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #dc2626; font-size: 32px; margin-bottom: 10px; border-bottom: 3px solid #dc2626; padding-bottom: 15px; }
    h2 { color: #1e40af; font-size: 24px; margin-top: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    h3 { color: #059669; font-size: 20px; margin-top: 25px; }
    .summary { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 25px; border-radius: 8px; margin: 30px 0; }
    .summary h3 { color: white; margin-top: 0; }
    .gap { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .gap h4 { color: #dc2626; margin-top: 0; }
    .priority-p0 { border-left-color: #dc2626; }
    .priority-p1 { border-left-color: #f59e0b; }
    .priority-p2 { border-left-color: #3b82f6; }
    .impact { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .action { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px; }
    .action h3 { color: #92400e; margin-top: 0; }
    code { background: #1e293b; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
    ul { padding-left: 25px; }
    li { margin: 10px 0; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .stat { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; color: #dc2626; }
    .stat-label { color: #6b7280; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Missing Gaps Audit - What We're Missing</h1>
    
    <div class="summary">
      <h3>📊 Executive Summary</h3>
      <p style="font-size: 18px; margin: 10px 0;">
        We've built a <strong>solid foundation</strong> (7 agents, complete website, automation), but there are <strong>critical gaps</strong> that would take us from "good" to "nuclear" level.
      </p>
      <div class="stats" style="margin-top: 20px;">
        <div class="stat">
          <div class="stat-number">7</div>
          <div class="stat-label">Agents Built</div>
        </div>
        <div class="stat">
          <div class="stat-number">22</div>
          <div class="stat-label">Agents Missing</div>
        </div>
        <div class="stat">
          <div class="stat-number">25</div>
          <div class="stat-label">Total Gaps</div>
        </div>
      </div>
    </div>

    <h2>🔴 CRITICAL MISSING PIECES (P0)</h2>
    
    <div class="gap priority-p0">
      <h4>1. 💼 Proposal Generator Agent</h4>
      <p><strong>Impact:</strong> HIGH - Faster proposals = more wins</p>
      <p><strong>What it should do:</strong></p>
      <ul>
        <li>Takes lead requirements + service details</li>
        <li>Generates professional proposals (EN/ES)</li>
        <li>Includes pricing, timeline, deliverables</li>
        <li>Creates personalized presentations</li>
        <li>Suggests pricing strategies</li>
      </ul>
      <p><strong>Why critical:</strong> Converting HOT leads requires fast, professional proposals. Manual proposal writing is slow.</p>
    </div>

    <div class="gap priority-p0">
      <h4>2. 🤝 Referral Agent</h4>
      <p><strong>Impact:</strong> HIGH - Referrals = highest quality leads</p>
      <p><strong>What it should do:</strong></p>
      <ul>
        <li>Identifies satisfied clients</li>
        <li>Generates personalized referral requests</li>
        <li>Suggests referral incentives</li>
        <li>Tracks referral pipeline</li>
        <li>Auto-follows up on referral leads</li>
      </ul>
      <p><strong>Why critical:</strong> Referrals convert 3-5x better than cold leads. Not tapping into this is leaving money on the table.</p>
    </div>

    <div class="gap priority-p0">
      <h4>3. 📧 Email Response Agent</h4>
      <p><strong>Impact:</strong> HIGH - 50% faster email handling</p>
      <p><strong>What it should do:</strong></p>
      <ul>
        <li>Generates email responses in real-time</li>
        <li>Drafts replies based on context</li>
        <li>Learns from past responses</li>
        <li>Suggests templates</li>
      </ul>
      <p><strong>Why critical:</strong> Email is a huge time sink. Automating responses saves hours daily.</p>
    </div>

    <div class="gap priority-p0">
      <h4>4. 🎯 Onboarding Agent</h4>
      <p><strong>Impact:</strong> HIGH - Faster onboarding = better first impression</p>
      <p><strong>What it should do:</strong></p>
      <ul>
        <li>Generates onboarding docs when client signs</li>
        <li>Creates welcome emails (EN/ES)</li>
        <li>Generates setup checklists</li>
        <li>Sends follow-up sequences</li>
      </ul>
      <p><strong>Why critical:</strong> First impression matters. Automated onboarding = happier clients.</p>
    </div>

    <h2>🟡 TECHNICAL GAPS (P0)</h2>

    <div class="gap priority-p0">
      <h4>5. ⚠️ D1 Database Not Migrated</h4>
      <p><strong>Issue:</strong> Schema exists, but database not created/migrated</p>
      <p><strong>Impact:</strong> CRM/Financial system not active</p>
      <p><strong>Fix:</strong> Create D1 DB and run migrations</p>
    </div>

    <div class="gap priority-p0">
      <h4>6. ⚠️ Resend Domain Not Verified</h4>
      <p><strong>Issue:</strong> Can't send emails to Eddy directly (only to Dan in test mode)</p>
      <p><strong>Impact:</strong> Email notifications limited</p>
      <p><strong>Fix:</strong> Verify gringoconnection.com in Resend</p>
    </div>

    <h2>🟠 IMPORTANT MISSING (P1)</h2>

    <div class="gap priority-p1">
      <h4>7. 🛡️ Client Retention Agent</h4>
      <p><strong>Impact:</strong> HIGH - Reduces churn 50%</p>
    </div>

    <div class="gap priority-p1">
      <h4>8. 🧪 Test Generator Agent</h4>
      <p><strong>Impact:</strong> MEDIUM - Better code quality</p>
    </div>

    <div class="gap priority-p1">
      <h4>9. 📚 Documentation Agent</h4>
      <p><strong>Impact:</strong> MEDIUM - Better onboarding</p>
    </div>

    <div class="gap priority-p1">
      <h4>10. 🔄 Win-Back Agent</h4>
      <p><strong>Impact:</strong> MEDIUM - 15-25% reactivation</p>
    </div>

    <div class="gap priority-p1">
      <h4>11. 💰 Pricing Optimization Agent</h4>
      <p><strong>Impact:</strong> MEDIUM-HIGH - 10-20% revenue increase</p>
    </div>

    <div class="gap priority-p1">
      <h4>12. 💳 Stripe Integration</h4>
      <p><strong>Issue:</strong> Payment processing exists but Stripe not connected</p>
      <p><strong>Impact:</strong> Can't collect payments automatically</p>
    </div>

    <div class="action">
      <h3>🚀 RECOMMENDED ACTION PLAN</h3>
      <ol style="color: #78350f; line-height: 2;">
        <li><strong>Week 1-2: Critical Revenue</strong>
          <ul>
            <li>Build Proposal Generator Agent</li>
            <li>Build Referral Agent</li>
            <li>Build Email Response Agent</li>
            <li>Build Onboarding Agent</li>
            <li>Verify Resend domain</li>
            <li>Run database migrations</li>
          </ul>
        </li>
        <li><strong>Week 3-4: Quality & Operations</strong>
          <ul>
            <li>Build Test Generator Agent</li>
            <li>Build Documentation Agent</li>
            <li>Build Client Retention Agent</li>
            <li>Add Payment Processing (Stripe)</li>
            <li>Add Monitoring & Alerts</li>
          </ul>
        </li>
        <li><strong>Week 5-8: Complete Stack</strong>
          <ul>
            <li>Build remaining P1 agents</li>
            <li>Build P2 agents</li>
            <li>Complete integrations</li>
            <li>Full automation</li>
          </ul>
        </li>
      </ol>
    </div>

    <div class="impact">
      <h3>📈 Expected Impact</h3>
      <ul>
        <li><strong>If We Build P0 Items:</strong> 50-75% revenue increase + Complete CRM functionality</li>
        <li><strong>If We Build P0 + P1 Items:</strong> 2-3x revenue increase + Complete automation</li>
        <li><strong>If We Build Everything:</strong> Complete nuclear stack + 100% automation + Maximum revenue</li>
      </ul>
    </div>

    <p style="margin-top: 40px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <strong>Full audit attached:</strong> MISSING_GAPS_AUDIT.md<br>
      <strong>Status:</strong> We have a solid foundation. The gaps are clear. Building the critical pieces will take us to nuclear level! 🚀
    </p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>Built with ❤️ in Medellín, Colombia 🇨🇴</p>
      <p>AI that elevates your brand.</p>
    </div>
  </div>
</body>
</html>
`;

async function sendEmail() {
  console.log(`\n📧 Sending Missing Gaps Audit to Dan & Eddy...`);
  
  const attachments = [];
  if (existsSync(auditPath)) {
    attachments.push({
      filename: 'MISSING_GAPS_AUDIT.md',
      content: Buffer.from(auditContent),
    });
  }

  // Send to Dan first (account owner - will work)
  console.log(`\n📤 Sending to Dan (dan@doorknockingsucks.com)...`);
  const resultDan = await mail.send({
    to: DAN_EMAIL,
    subject: '🔍 Missing Gaps Audit - What We Need to Build',
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (resultDan.ok) {
    console.log(`✅ Email sent to Dan!`);
    console.log(`📬 Email ID: ${resultDan.id || 'N/A'}`);
  } else {
    console.error(`❌ Failed to send to Dan: ${resultDan.reason}`);
  }

  // Send to Eddy (may need domain verification)
  console.log(`\n📤 Sending to Eddy (Eddy@doorknockingsucks.com)...`);
  const resultEddy = await mail.send({
    to: EDDY_EMAIL,
    subject: '🔍 Missing Gaps Audit - What We Need to Build',
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (resultEddy.ok) {
    console.log(`✅ Email sent to Eddy!`);
    console.log(`📬 Email ID: ${resultEddy.id || 'N/A'}`);
  } else {
    console.warn(`⚠️  Could not send to Eddy directly: ${resultEddy.reason}`);
    console.warn(`💡 Dan can forward the email to Eddy, or verify domain in Resend`);
  }

  // Summary
  const successCount = [resultDan.ok, resultEddy.ok].filter(Boolean).length;
  
  if (successCount > 0) {
    console.log(`\n✅ ✅ ✅ EMAIL(S) SENT ✅ ✅ ✅\n`);
    console.log(`📧 Successfully sent to ${successCount}/2 recipients:`);
    if (resultDan.ok) console.log(`   ✓ Dan (dan@doorknockingsucks.com)`);
    if (resultEddy.ok) console.log(`   ✓ Eddy (Eddy@doorknockingsucks.com)`);
    if (attachments.length > 0) {
      console.log(`\n📎 Attached ${attachments.length} file:`);
      attachments.forEach((att) => console.log(`   ✓ ${att.filename}`));
    }
    
    if (!resultEddy.ok) {
      console.log(`\n💡 Note: To send directly to Eddy, verify domain at resend.com/domains`);
      console.log(`   For now, Dan can forward the email to Eddy.\n`);
    } else {
      console.log(`\n🎉 Both Dan & Eddy received the Missing Gaps Audit!\n`);
    }
  } else {
    console.error(`\n❌ ❌ ❌ FAILED TO SEND EMAIL ❌ ❌ ❌\n`);
    process.exit(1);
  }
}

sendEmail().catch((error) => {
  console.error(`\n❌ Error sending email:`, error);
  process.exit(1);
});

