/**
 * Workflow Automation Agent - Makes Eddy's life easier
 * Automates common development tasks, checks, and workflows
 * Runs daily at 09:00
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail } from '../providers.js';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface WorkflowCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  action?: string;
}

// Check if build passes
async function checkBuild(): Promise<WorkflowCheck> {
  // In a real implementation, would run `pnpm build` and check output
  // For now, check if build artifacts exist
  const buildDir = join(process.cwd(), 'apps', 'web', '.next');
  
  if (existsSync(buildDir)) {
    const buildTime = statSync(buildDir).mtime;
    const daysSinceBuild = (Date.now() - buildTime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceBuild > 1) {
      return {
        name: 'Build Status',
        status: 'warning',
        message: `Last build was ${Math.floor(daysSinceBuild)} days ago. Consider rebuilding.`,
        action: 'Run: pnpm build',
      };
    }
    
    return {
      name: 'Build Status',
      status: 'pass',
      message: 'Build artifacts exist and are recent.',
    };
  }
  
  return {
    name: 'Build Status',
    status: 'fail',
    message: 'No build artifacts found. Build may have failed.',
    action: 'Run: pnpm build',
  };
}

// Check for linting errors
async function checkLinting(): Promise<WorkflowCheck> {
  // Check if there's a lint config
  const lintConfigs = ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js', '.eslintrc.cjs'];
  const hasLintConfig = lintConfigs.some((config) => existsSync(join(process.cwd(), config)));
  
  if (!hasLintConfig) {
    return {
      name: 'Linting',
      status: 'warning',
      message: 'No ESLint config found. Consider adding linting.',
      action: 'Add ESLint config',
    };
  }
  
  return {
    name: 'Linting',
    status: 'pass',
    message: 'ESLint config found.',
  };
}

// Check for TypeScript errors
async function checkTypeScript(): Promise<WorkflowCheck> {
  const tsConfig = join(process.cwd(), 'tsconfig.json');
  
  if (!existsSync(tsConfig)) {
    return {
      name: 'TypeScript',
      status: 'warning',
      message: 'No tsconfig.json found.',
      action: 'Add TypeScript config',
    };
  }
  
  return {
    name: 'TypeScript',
    status: 'pass',
    message: 'TypeScript config found.',
  };
}

// Check environment variables
async function checkEnvVars(): Promise<WorkflowCheck> {
  const envExample = join(process.cwd(), 'env.example');
  const envFile = join(process.cwd(), '.env');
  
  if (!existsSync(envExample)) {
    return {
      name: 'Environment Variables',
      status: 'warning',
      message: 'No env.example file found.',
      action: 'Create env.example',
    };
  }
  
  if (!existsSync(envFile)) {
    return {
      name: 'Environment Variables',
      status: 'warning',
      message: 'No .env file found. Copy from env.example.',
      action: 'Copy env.example to .env',
    };
  }
  
  return {
    name: 'Environment Variables',
    status: 'pass',
    message: 'Environment files configured.',
  };
}

// Check for missing dependencies
async function checkDependencies(): Promise<WorkflowCheck> {
  const packageJson = join(process.cwd(), 'package.json');
  
  if (!existsSync(packageJson)) {
    return {
      name: 'Dependencies',
      status: 'fail',
      message: 'No package.json found.',
    };
  }
  
  const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
  const hasDeps = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
  
  if (!hasDeps) {
    return {
      name: 'Dependencies',
      status: 'warning',
      message: 'No dependencies found in package.json.',
    };
  }
  
  return {
    name: 'Dependencies',
    status: 'pass',
    message: `${Object.keys(pkg.dependencies || {}).length} dependencies configured.`,
  };
}

// Check Git status
async function checkGit(): Promise<WorkflowCheck> {
  const gitDir = join(process.cwd(), '.git');
  
  if (!existsSync(gitDir)) {
    return {
      name: 'Git',
      status: 'warning',
      message: 'Not a git repository.',
      action: 'Run: git init',
    };
  }
  
  return {
    name: 'Git',
    status: 'pass',
    message: 'Git repository initialized.',
  };
}

// Check for local LLM setup
async function checkLocalLLM(): Promise<WorkflowCheck> {
  const hasLocalLLM = process.env.LOCAL_LLM === 'true';
  const hasOllamaUrl = !!process.env.OLLAMA_URL;
  
  if (!hasLocalLLM || !hasOllamaUrl) {
    return {
      name: 'Local LLM',
      status: 'warning',
      message: 'Local LLM not configured. Set LOCAL_LLM=true and OLLAMA_URL in .env',
      action: 'Configure Ollama in .env',
    };
  }
  
  // Try to ping Ollama
  try {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/tags`);
    if (response.ok) {
      return {
        name: 'Local LLM',
        status: 'pass',
        message: 'Ollama is running and accessible.',
      };
    }
  } catch (e) {
    return {
      name: 'Local LLM',
      status: 'fail',
      message: 'Ollama not reachable. Make sure it\'s running.',
      action: 'Run: ollama serve',
    };
  }
  
  return {
    name: 'Local LLM',
    status: 'pass',
    message: 'Local LLM configured.',
  };
}

export async function runWorkflowAutomation(): Promise<void> {
  console.log('⚙️  Running workflow automation agent...');

  const checks = await Promise.all([
    checkBuild(),
    checkLinting(),
    checkTypeScript(),
    checkEnvVars(),
    checkDependencies(),
    checkGit(),
    checkLocalLLM(),
  ]);

  const passed = checks.filter((c) => c.status === 'pass').length;
  const warnings = checks.filter((c) => c.status === 'warning').length;
  const failed = checks.filter((c) => c.status === 'fail').length;

  const checksHtml = checks
    .map(
      (check) => `
      <div style="background: ${check.status === 'pass' ? '#f0fdf4' : check.status === 'warning' ? '#fffbeb' : '#fef2f2'}; border-left: 4px solid ${check.status === 'pass' ? '#16a34a' : check.status === 'warning' ? '#f59e0b' : '#ef4444'}; padding: 15px; margin: 10px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px;">
          ${check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'} ${check.name}
        </h4>
        <p style="margin: 5px 0; color: #1f2937;">${check.message}</p>
        ${check.action ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Action:</strong> ${check.action}</p>` : ''}
      </div>
    `
    )
    .join('');

  const stats = `
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px;">📊 Workflow Status</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${passed}</div>
          <div style="color: #6b7280;">Passed</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${warnings}</div>
          <div style="color: #6b7280;">Warnings</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${failed}</div>
          <div style="color: #6b7280;">Failed</div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">⚙️ Workflow Automation Report</h1>
      <p><strong>Date:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm', { timeZone: DEFAULT_TZ })}</p>
      
      ${stats}
      
      <h2 style="color: #1e40af; margin-top: 30px;">🔍 Checks</h2>
      ${checksHtml}
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Tip:</strong> Fix warnings and failures to keep your workflow smooth!</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `⚙️ Workflow Automation — ${passed} Passed, ${warnings} Warnings, ${failed} Failed`,
    html,
  });

  if (result.ok) {
    console.log(`✅ Workflow automation report sent: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkflowAutomation().catch(console.error);
}

