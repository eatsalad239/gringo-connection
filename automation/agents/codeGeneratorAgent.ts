/**
 * Code Generator Agent - On-demand code generation
 * Generates components, API routes, tests, docs using local LLM
 * Makes Eddy's development life easier
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { llm } from '../providers.js';

interface CodeGenRequest {
  type: 'component' | 'api' | 'test' | 'hook' | 'util' | 'page';
  name: string;
  description: string;
  props?: string; // For components
  endpoint?: string; // For API routes
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // For API routes
}

// Generate React component
async function generateComponent(request: CodeGenRequest): Promise<string> {
  const prompt = `Generate a Next.js 14 React component named ${request.name}.

Description: ${request.description}

${request.props ? `Props: ${request.props}` : 'Make it a self-contained component'}

Requirements:
- TypeScript with proper types
- Tailwind CSS for styling
- Follow Next.js 14 App Router patterns
- Make it reusable and well-documented
- Include proper JSDoc comments
- Use modern React patterns (hooks, no class components)
- Export default
- Include example usage in comments

Output ONLY the component code, no explanations:`;

  const result = await llm.text(prompt, {
    maxTokens: 2000,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini') : undefined, // Default to lightweight
    system: 'You are an expert React/Next.js developer. Output only valid TypeScript/TSX code.',
  });

  if (result.ok && result.text) {
    const codeMatch = result.text.match(/```(?:tsx|typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : result.text;
  }

  return `// Component: ${request.name}\n// ${request.description}\n// TODO: Implement component`;
}

// Generate API route
async function generateAPIRoute(request: CodeGenRequest): Promise<string> {
  const method = request.method || 'GET';
  const endpoint = request.endpoint || '/api/example';

  const prompt = `Generate a Next.js 14 App Router API route for ${endpoint} using ${method} method.

Description: ${request.description}

Requirements:
- TypeScript with proper types
- Use NextRequest and NextResponse
- Include input validation
- Include error handling
- Include rate limiting (basic)
- Include proper HTTP status codes
- Export the ${method} handler
- Include JSDoc comments

Output ONLY the API route code, no explanations:`;

  const result = await llm.text(prompt, {
    maxTokens: 1500,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini') : undefined, // Default to lightweight
    system: 'You are an expert Next.js API developer. Output only valid TypeScript code.',
  });

  if (result.ok && result.text) {
    const codeMatch = result.text.match(/```(?:tsx|typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : result.text;
  }

  return `// API Route: ${endpoint}\n// ${request.description}\n// TODO: Implement ${method} handler`;
}

// Generate custom hook
async function generateHook(request: CodeGenRequest): Promise<string> {
  const prompt = `Generate a React custom hook named use${request.name}.

Description: ${request.description}

Requirements:
- TypeScript with proper types
- Use React hooks (useState, useEffect, etc.)
- Include proper return type
- Include error handling
- Include JSDoc comments
- Export default
- Include example usage in comments

Output ONLY the hook code, no explanations:`;

  const result = await llm.text(prompt, {
    maxTokens: 1000,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini') : undefined, // Default to lightweight
    system: 'You are an expert React developer. Output only valid TypeScript code.',
  });

  if (result.ok && result.text) {
    const codeMatch = result.text.match(/```(?:tsx|typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : result.text;
  }

  return `// Hook: use${request.name}\n// ${request.description}\n// TODO: Implement hook`;
}

// Generate utility function
async function generateUtil(request: CodeGenRequest): Promise<string> {
  const prompt = `Generate a utility function named ${request.name}.

Description: ${request.description}

Requirements:
- TypeScript with proper types
- Pure function (no side effects)
- Include JSDoc comments
- Include example usage
- Export default or named export
- Handle edge cases

Output ONLY the utility code, no explanations:`;

  const result = await llm.text(prompt, {
    maxTokens: 800,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_FAST || 'phi3:mini') : undefined, // Default to lightweight
    system: 'You are an expert TypeScript developer. Output only valid TypeScript code.',
  });

  if (result.ok && result.text) {
    const codeMatch = result.text.match(/```(?:tsx|typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : result.text;
  }

  return `// Util: ${request.name}\n// ${request.description}\n// TODO: Implement utility`;
}

// Main generator function
export async function generateCode(request: CodeGenRequest, outputPath?: string): Promise<{ ok: boolean; code?: string; path?: string; reason?: string }> {
  console.log(`🤖 Generating ${request.type}: ${request.name}...`);

  let code = '';

  switch (request.type) {
    case 'component':
      code = await generateComponent(request);
      break;
    case 'api':
      code = await generateAPIRoute(request);
      break;
    case 'hook':
      code = await generateHook(request);
      break;
    case 'util':
      code = await generateUtil(request);
      break;
    default:
      return { ok: false, reason: `Unknown type: ${request.type}` };
  }

  // Save to file if path provided
  if (outputPath) {
    try {
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(outputPath, code, 'utf-8');
      console.log(`✅ Code saved to ${outputPath}`);
      return { ok: true, code, path: outputPath };
    } catch (e) {
      return { ok: false, reason: `Failed to save file: ${e}` };
    }
  }

  return { ok: true, code };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Usage: tsx codeGeneratorAgent.ts <type> <name> <description> [outputPath]

Types: component, api, hook, util

Examples:
  tsx codeGeneratorAgent.ts component Button "A reusable button component" components/Button.tsx
  tsx codeGeneratorAgent.ts api users "Get all users" app/api/users/route.ts
  tsx codeGeneratorAgent.ts hook useAuth "Authentication hook" hooks/useAuth.ts
    `);
    process.exit(1);
  }

  const [type, name, description, outputPath] = args;
  
  generateCode(
    {
      type: type as any,
      name,
      description,
    },
    outputPath
  )
    .then((result) => {
      if (result.ok) {
        if (result.path) {
          console.log(`✅ Generated ${type} at ${result.path}`);
        } else {
          console.log('\n' + result.code);
        }
      } else {
        console.error(`❌ Failed: ${result.reason}`);
        process.exit(1);
      }
    })
    .catch(console.error);
}

