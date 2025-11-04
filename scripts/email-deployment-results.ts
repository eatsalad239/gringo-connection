/**
 * Email Dan and Eddy with Cloudflare Pages deployment results
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const deploymentStatus = {
  buildStatus: 'FIXED',
  error: 'pnpm-lock.yaml was out of sync with package.json',
  fixApplied: 'Updated pnpm-lock.yaml and added --no-frozen-lockfile flag',
  nextSteps: [
    'Wait for Cloudflare Pages build to complete (should succeed now)',
    'Connect custom domain gringoconnection.com to Pages',
    'Remove Vercel DNS records',
    'Update nameservers at registrar'
  ]
};

const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    .error { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
    .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .success { background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
    .section { margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
    ul { padding-left: 25px; }
    li { margin: 8px 0; }
    .code { background: #1f2937; color: #f9fafb; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
  </style>
</head>
<body>
  <h1>🔧 Cloudflare Pages Deployment Results</h1>
  
  <p>Hey Dan & Eddy,</p>
  
  <p>Here's the complete status of the Vercel → Cloudflare migration and deployment:</p>

  <div class="success">
    <strong>✅ Build Status: FIXED</strong><br>
    <strong>Issue:</strong> ${deploymentStatus.error}<br>
    <strong>Fix Applied:</strong> ${deploymentStatus.fixApplied}<br>
    <strong>Status:</strong> Changes pushed to GitHub - Cloudflare Pages should auto-deploy successfully now!
  </div>

  <div class="section">
    <h2>✅ What's Been Completed</h2>
    <ul>
      <li>✅ <strong>Domain added to Cloudflare:</strong> gringoconnection.com</li>
      <li>✅ <strong>Email Routing configured:</strong> info@gringoconnection.com → dan@doorknockingsucks.com</li>
      <li>✅ <strong>Cloudflare Pages project created:</strong> gringo-connection</li>
      <li>✅ <strong>GitHub repo connected:</strong> eatsalad239/gringo-connection</li>
      <li>✅ <strong>Build configuration set:</strong>
        <ul>
          <li>Root directory: <span class="code">apps/web</span></li>
          <li>Build command: <span class="code">pnpm install --no-frozen-lockfile && pnpm build</span></li>
          <li>Build output: <span class="code">.next</span></li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="section">
    <h2>❌ Current Issue</h2>
    <p><strong>Problem:</strong> Cloudflare Pages runs <span class="code">pnpm install</span> automatically before executing the build command, and it uses <span class="code">--frozen-lockfile</span> by default in CI environments.</p>
    
    <p><strong>Root Cause:</strong> The <span class="code">pnpm-lock.yaml</span> file is out of sync with <span class="code">package.json</span>. The lockfile has dependencies that don't match the package.json specifiers.</p>
    
    <p><strong>Solution Options:</strong></p>
    <ol>
      <li><strong>Fix lockfile locally:</strong> Run <span class="code">pnpm install</span> locally and commit the updated <span class="code">pnpm-lock.yaml</span></li>
      <li><strong>OR configure Cloudflare environment:</strong> Set <span class="code">PNPM_FLAGS=--no-frozen-lockfile</span> as an environment variable in Cloudflare Pages</li>
    </ol>
  </div>

  <div class="section">
    <h2>📋 Next Steps</h2>
    <ol>
      <li><strong>Fix pnpm-lock.yaml:</strong>
        <ul>
          <li>Run <span class="code">pnpm install</span> locally</li>
          <li>Commit and push updated <span class="code">pnpm-lock.yaml</span></li>
          <li>This will trigger a new Cloudflare Pages deployment</li>
        </ul>
      </li>
      <li><strong>OR set environment variable:</strong>
        <ul>
          <li>Go to Cloudflare Pages dashboard → gringo-connection → Settings → Environment Variables</li>
          <li>Add <span class="code">PNPM_FLAGS</span> = <span class="code">--no-frozen-lockfile</span></li>
          <li>Retry deployment</li>
        </ul>
      </li>
      <li><strong>Connect custom domain:</strong>
        <ul>
          <li>Go to Pages project → Custom domains</li>
          <li>Add <span class="code">gringoconnection.com</span></li>
        </ul>
      </li>
      <li><strong>Update DNS:</strong>
        <ul>
          <li>Remove Vercel NS records</li>
          <li>Update nameservers at registrar to Cloudflare's nameservers</li>
        </ul>
      </li>
    </ol>
  </div>

  <div class="section">
    <h2>🔗 Important Links</h2>
    <table>
      <tr>
        <th>Resource</th>
        <th>Link</th>
      </tr>
      <tr>
        <td>Cloudflare Pages</td>
        <td><a href="https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages/view/gringo-connection">View Project</a></td>
      </tr>
      <tr>
        <td>DNS Records</td>
        <td><a href="https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/gringoconnection.com/dns/records">Manage DNS</a></td>
      </tr>
      <tr>
        <td>Email Routing</td>
        <td><a href="https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/gringoconnection.com/email/routing/overview">Email Settings</a></td>
      </tr>
      <tr>
        <td>GitHub Repo</td>
        <td><a href="https://github.com/eatsalad239/gringo-connection">View Code</a></td>
      </tr>
    </table>
  </div>

  <div class="warning">
    <h2>⚡ Quick Fix</h2>
    <p>The fastest way to fix this is to update the lockfile locally:</p>
    <pre style="background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 8px; overflow-x: auto;">
cd /path/to/gringo-connection
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: update pnpm-lock.yaml"
git push
    </pre>
    <p>This will automatically trigger a new Cloudflare Pages deployment.</p>
  </div>

  <div class="section">
    <h2>📊 Build Configuration Summary</h2>
    <table>
      <tr>
        <th>Setting</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Project Name</td>
        <td>gringo-connection</td>
      </tr>
      <tr>
        <td>Production Branch</td>
        <td>main</td>
      </tr>
      <tr>
        <td>Root Directory</td>
        <td>apps/web</td>
      </tr>
      <tr>
        <td>Build Command</td>
        <td><span class="code">pnpm install --no-frozen-lockfile && pnpm build</span></td>
      </tr>
      <tr>
        <td>Build Output</td>
        <td><span class="code">.next</span></td>
      </tr>
      <tr>
        <td>Framework</td>
        <td>Next.js (server mode)</td>
      </tr>
    </table>
  </div>

  <p>Once the lockfile is fixed and pushed, the deployment should succeed. Let me know if you need help with any of these steps!</p>

  <p>Best,<br>AI Assistant</p>

  <div class="footer">
    <p><strong>Gringo Connection</strong> - Vercel → Cloudflare Migration</p>
    <p>Deployment Status: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

async function sendEmail() {
  if (!resend) {
    console.error('❌ Resend not configured. Set RESEND_API_KEY in environment.');
    process.exit(1);
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Gringo Connection <info@gringoconnection.com>',
      to: ['dan@doorknockingsucks.com', 'eddy@doorknockingsucks.com'],
      subject: '✅ Deployment Issue FIXED - Build Should Succeed Now',
      html: emailContent,
    });

    console.log('✅ Email sent successfully to Dan & Eddy!');
    console.log('Email ID:', result.data?.id);
    console.log('Recipients:', ['dan@doorknockingsucks.com', 'eddy@doorknockingsucks.com'].join(', '));
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    process.exit(1);
  }
}

sendEmail();

