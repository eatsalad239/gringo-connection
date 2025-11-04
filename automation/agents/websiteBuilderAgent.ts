/**
 * Website Builder Agent
 * Builds complete websites, pages, components
 * Uses Claude Code patterns + Stagehand for automation
 */

import { llm } from '../providers.js';
import { mail } from '../providers.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const TO_EMAIL = process.env.WEBSITE_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface WebsiteRequest {
  name: string;
  type: 'landing' | 'portfolio' | 'ecommerce' | 'blog' | 'saas';
  pages: string[];
  features: string[];
  style?: 'modern' | 'minimal' | 'bold' | 'elegant';
  language: 'en' | 'es';
  destination?: string; // Path to create website
}

/**
 * Generate complete website
 */
export async function generateWebsite(request: WebsiteRequest): Promise<{
  success: boolean;
  files: string[];
  error?: string;
}> {
  try {
    console.log(`🌐 Generating website: ${request.name}`);

    const files: string[] = [];
    const destination = request.destination || `./generated-websites/${request.name}`;

    // Create directory structure
    await fs.mkdir(destination, { recursive: true });
    await fs.mkdir(path.join(destination, 'app'), { recursive: true });
    await fs.mkdir(path.join(destination, 'components'), { recursive: true });
    await fs.mkdir(path.join(destination, 'public'), { recursive: true });

    // Generate package.json
    const packageJson = generatePackageJson(request);
    await fs.writeFile(path.join(destination, 'package.json'), packageJson);
    files.push('package.json');

    // Generate Next.js config
    const nextConfig = generateNextConfig();
    await fs.writeFile(path.join(destination, 'next.config.js'), nextConfig);
    files.push('next.config.js');

    // Generate Tailwind config
    const tailwindConfig = generateTailwindConfig();
    await fs.writeFile(path.join(destination, 'tailwind.config.js'), tailwindConfig);
    files.push('tailwind.config.js');

    // Generate pages
    for (const page of request.pages) {
      const pageCode = await generatePage(request, page);
      const pagePath = path.join(destination, 'app', `${page === 'home' ? 'page' : page}.tsx`);
      await fs.writeFile(pagePath, pageCode);
      files.push(`app/${page === 'home' ? 'page' : page}.tsx`);
    }

    // Generate components
    const components = ['Nav', 'Footer', 'Hero'];
    for (const component of components) {
      const componentCode = await generateComponent(request, component);
      const componentPath = path.join(destination, 'components', `${component}.tsx`);
      await fs.writeFile(componentPath, componentCode);
      files.push(`components/${component}.tsx`);
    }

    // Generate README
    const readme = generateReadme(request);
    await fs.writeFile(path.join(destination, 'README.md'), readme);
    files.push('README.md');

    // Send summary
    await sendWebsiteSummary(request, files, destination);

    return { success: true, files };
  } catch (error) {
    return { success: false, files: [], error: String(error) };
  }
}

/**
 * Generate page code using AI
 */
async function generatePage(request: WebsiteRequest, pageName: string): Promise<string> {
  const systemPrompt = `You are an expert Next.js developer. Generate a complete, production-ready ${pageName} page for a ${request.type} website.

Requirements:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Style: ${request.style || 'modern'}
- Language: ${request.language}
- Features: ${request.features.join(', ')}

Generate complete, working code. Include:
- Proper imports
- TypeScript types
- Responsive design
- SEO metadata
- Accessibility

Return ONLY the code, no explanations.`;

  const response = await llm.text({
    system: systemPrompt,
    user: `Generate ${pageName} page for ${request.name}`,
    maxTokens: 2000,
  });

  return response.text || generateFallbackPage(request, pageName);
}

/**
 * Generate component code
 */
async function generateComponent(request: WebsiteRequest, componentName: string): Promise<string> {
  const systemPrompt = `You are an expert React/Next.js developer. Generate a ${componentName} component.

Requirements:
- Next.js 14
- TypeScript
- Tailwind CSS
- Style: ${request.style || 'modern'}
- Language: ${request.language}

Return ONLY the code, no explanations.`;

  const response = await llm.text({
    system: systemPrompt,
    user: `Generate ${componentName} component`,
    maxTokens: 1500,
  });

  return response.text || generateFallbackComponent(componentName);
}

function generatePackageJson(request: WebsiteRequest): string {
  return JSON.stringify({
    name: request.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: '^14.0.4',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      typescript: '^5.3.3',
      tailwindcss: '^3.3.6',
      autoprefixer: '^10.4.16',
      postcss: '^8.4.32',
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/react': '^18.2.45',
      '@types/react-dom': '^18.2.18',
    },
  }, null, 2);
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

function generateFallbackPage(request: WebsiteRequest, pageName: string): string {
  return `export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-4xl font-bold p-8">${pageName}</h1>
    </div>
  );
}
`;
}

function generateFallbackComponent(componentName: string): string {
  return `export default function ${componentName}() {
  return <div>${componentName}</div>;
}
`;
}

function generateReadme(request: WebsiteRequest): string {
  return `# ${request.name}

Generated website for ${request.type}.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000
`;
}

async function sendWebsiteSummary(request: WebsiteRequest, files: string[], destination: string): Promise<void> {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🌐 Website Generated</h1>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Website Details</h3>
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Type:</strong> ${request.type}</p>
        <p><strong>Pages:</strong> ${request.pages.join(', ')}</p>
        <p><strong>Features:</strong> ${request.features.join(', ')}</p>
        <p><strong>Location:</strong> ${destination}</p>
      </div>

      <h2>Generated Files (${files.length})</h2>
      <ul>
        ${files.map((f) => `<li><code>${f}</code></li>`).join('')}
      </ul>

      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <h3>Next Steps</h3>
        <ol>
          <li>Navigate to: <code>cd ${destination}</code></li>
          <li>Install dependencies: <code>npm install</code></li>
          <li>Run dev server: <code>npm run dev</code></li>
          <li>Review and customize as needed</li>
        </ol>
      </div>
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `🌐 Website Generated — ${request.name}`,
    html,
  });
}

/**
 * Run website builder agent (on-demand)
 */
export async function runWebsiteBuilderAgent(): Promise<void> {
  console.log('🌐 Running Website Builder Agent...');
  console.log('✅ Website Builder Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWebsiteBuilderAgent().catch(console.error);
}

