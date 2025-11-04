/**
 * Dev Helper Agent - Runs daily at 08:00
 * Helps Eddy with development workflow, code generation, component suggestions
 * Uses local LLM (Ollama) for code generation
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface DevTask {
  type: 'component' | 'api' | 'test' | 'doc' | 'refactor' | 'bug';
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedFiles: string[];
  codeSnippet?: string;
}

// Analyze codebase for suggestions
async function analyzeCodebase(): Promise<DevTask[]> {
  const tasks: DevTask[] = [];
  const webDir = join(process.cwd(), 'apps', 'web');
  const componentsDir = join(webDir, 'components');
  const appDir = join(webDir, 'app');

  // Check for missing components
  if (existsSync(componentsDir)) {
    const components = readdirSync(componentsDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.tsx'))
      .map((d) => d.name.replace('.tsx', ''));

    // Suggest commonly needed components
    const commonComponents = ['Button', 'Input', 'Card', 'Modal', 'Dropdown', 'Toast'];
    const missing = commonComponents.filter((c) => !components.includes(c));

    missing.forEach((comp) => {
      tasks.push({
        type: 'component',
        description: `Create reusable ${comp} component`,
        priority: 'medium',
        suggestedFiles: [`components/${comp}.tsx`],
      });
    });
  }

  // Check for missing API routes
  if (existsSync(appDir)) {
    const apiDir = join(appDir, 'api');
    if (existsSync(apiDir)) {
      const routes = readdirSync(apiDir, { recursive: true, withFileTypes: true })
        .filter((d) => d.isFile() && d.name === 'route.ts')
        .map((d) => d.path);

      const commonRoutes = ['/api/users', '/api/posts', '/api/webhooks'];
      const missing = commonRoutes.filter((r) => !routes.some((existing) => existing.includes(r)));

      missing.forEach((route) => {
        tasks.push({
          type: 'api',
          description: `Create ${route} API endpoint`,
          priority: 'low',
          suggestedFiles: [`app/api${route}/route.ts`],
        });
      });
    }
  }

  return tasks;
}

// Generate component code using local LLM
async function generateComponentCode(componentName: string, description: string): Promise<string> {
  const prompt = `Generate a Next.js 14 React component for ${componentName}.

Requirements:
- TypeScript with proper types
- Tailwind CSS for styling
- Follow Next.js 14 App Router patterns
- Make it reusable and well-documented
- Include props interface
- Use modern React patterns (no class components)

Description: ${description}

Output ONLY the component code, no explanations:`;

  const result = await llm.text(prompt, {
    maxTokens: 1000,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini') : undefined, // Default to lightweight
    system: 'You are an expert React/Next.js developer. Output only valid TypeScript/TSX code.',
  });

  if (result.ok && result.text) {
    // Extract code block if present
    const codeMatch = result.text.match(/```(?:tsx|typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : result.text;
  }

  return `// Component: ${componentName}\n// ${description}\n// TODO: Implement component`;
}

// Suggest improvements based on codebase
async function suggestImprovements(): Promise<string[]> {
  const suggestions: string[] = [];

  // Check for error boundaries
  const errorBoundaryPath = join(process.cwd(), 'apps', 'web', 'app', 'error.tsx');
  if (!existsSync(errorBoundaryPath)) {
    suggestions.push('Add error boundary (error.tsx) for better error handling');
  }

  // Check for loading states
  const loadingPath = join(process.cwd(), 'apps', 'web', 'app', 'loading.tsx');
  if (!existsSync(loadingPath)) {
    suggestions.push('Add loading component (loading.tsx) for better UX');
  }

  // Check for tests
  const testDir = join(process.cwd(), 'apps', 'web', '__tests__');
  if (!existsSync(testDir)) {
    suggestions.push('Add test directory and basic component tests');
  }

  // Check for environment validation
  const envExamplePath = join(process.cwd(), 'env.example');
  if (existsSync(envExamplePath)) {
    const envExample = readFileSync(envExamplePath, 'utf-8');
    if (!envExample.includes('NEXT_PUBLIC_SITE_URL')) {
      suggestions.push('Add NEXT_PUBLIC_SITE_URL to env.example for better SEO');
    }
  }

  return suggestions;
}

// Generate daily dev suggestions
async function generateDevSuggestions(): Promise<{ en: string; es: string }> {
  const tasks = await analyzeCodebase();
  const improvements = await suggestImprovements();

  const prompt = `Generate helpful development suggestions for today.

Tasks to suggest:
${tasks.map((t) => `- ${t.description} (${t.priority} priority)`).join('\n')}

Improvements:
${improvements.map((i) => `- ${i}`).join('\n')}

Generate a brief, actionable daily dev suggestion in English and Spanish.
Focus on what would make development easier and faster.

Format as JSON: {"en": "suggestion", "es": "sugerencia"}`;

  const result = await llm.text(prompt, {
    maxTokens: 300,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_FAST || 'llama3:8b') : undefined,
    system: 'You are a helpful development assistant. Output only valid JSON.',
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
  }

  return {
    en: 'Review and improve code quality today. Check for missing components and API routes.',
    es: 'Revisa y mejora la calidad del código hoy. Verifica componentes y rutas API faltantes.',
  };
}

export async function runDevHelper(): Promise<void> {
  console.log('🛠️  Running dev helper agent...');

  const tasks = await analyzeCodebase();
  const improvements = await suggestImprovements();
  const suggestions = await generateDevSuggestions();

  // Generate code for top priority component if needed
  let componentCode = '';
  const topComponentTask = tasks.find((t) => t.type === 'component' && t.priority === 'high');
  if (topComponentTask) {
    const componentName = topComponentTask.suggestedFiles[0]?.replace('components/', '').replace('.tsx', '') || 'Component';
    componentCode = await generateComponentCode(componentName, topComponentTask.description);
  }

  const tasksHtml = tasks
    .slice(0, 5) // Top 5
    .map(
      (task) => `
      <div style="background: ${task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f9fafb'}; border-left: 4px solid ${task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#6b7280'}; padding: 15px; margin: 10px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px;">${task.description}</h4>
        <p style="margin: 5px 0;"><strong>Type:</strong> ${task.type}</p>
        <p style="margin: 5px 0;"><strong>Priority:</strong> ${task.priority}</p>
        ${task.suggestedFiles.length > 0 ? `<p style="margin: 5px 0;"><strong>Files:</strong> ${task.suggestedFiles.join(', ')}</p>` : ''}
      </div>
    `
    )
    .join('');

  const improvementsHtml = improvements
    .map(
      (imp) => `
      <li style="margin: 8px 0;">${imp}</li>
    `
    )
    .join('');

  const codeSection = componentCode
    ? `
      <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #1e40af; margin-top: 0;">💻 Generated Component Code</h3>
        <p><strong>Component:</strong> ${topComponentTask?.suggestedFiles[0] || 'Component'}</p>
        <pre style="background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px;"><code>${componentCode}</code></pre>
        <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">💡 Copy this code to create the component</p>
      </div>
    `
    : '';

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🛠️ Daily Dev Helper Report</h1>
      <p><strong>Date:</strong> ${format(new Date(), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ })}</p>
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #166534; margin-top: 0;">💡 Today's Suggestion</h2>
        <p style="font-size: 18px; color: #1f2937; margin: 10px 0;"><strong>EN:</strong> ${suggestions.en}</p>
        <p style="font-size: 18px; color: #1f2937; margin: 10px 0;"><strong>ES:</strong> ${suggestions.es}</p>
      </div>

      ${codeSection}

      <h2 style="color: #1e40af; margin-top: 30px;">📋 Development Tasks</h2>
      ${tasks.length > 0 ? tasksHtml : '<p>No pending tasks found!</p>'}

      <h2 style="color: #1e40af; margin-top: 30px;">✨ Improvement Suggestions</h2>
      <ul style="line-height: 1.8;">
        ${improvementsHtml || '<li>No improvements needed!</li>'}
      </ul>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Tip:</strong> Use local LLM for code generation. Set LOCAL_LLM=true in .env</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `🛠️ Dev Helper — ${tasks.length} Tasks, ${improvements.length} Improvements`,
    html,
  });

  if (result.ok) {
    console.log(`✅ Dev helper report sent: ${tasks.length} tasks, ${improvements.length} improvements`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDevHelper().catch(console.error);
}

