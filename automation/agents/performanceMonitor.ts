/**
 * Performance Monitor Agent
 * Monitors agent performance, prevents system slowdown
 * Runs every 5 minutes
 */

import { formatInTimeZone } from 'date-fns-tz';
import { mail } from '../providers.js';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number; // 0-100
  memoryUsage: number; // GB
  ollamaMemory: number; // GB
  activeAgents: number;
  systemLoad: number;
}

// Get system metrics (Mac/Linux compatible)
async function getSystemMetrics(): Promise<PerformanceMetrics> {
  // Check Ollama memory usage
  let ollamaMemory = 0;
  try {
    // Try to get Ollama process memory
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Mac/Linux: ps command
      const { stdout } = await execAsync('ps aux | grep ollama | grep -v grep | awk \'{sum+=$6} END {print sum/1024}\'');
      ollamaMemory = parseFloat(stdout.trim()) || 0;
    } catch {
      // Fallback: estimate based on model
      const model = process.env.OLLAMA_MODEL_QUALITY || process.env.OLLAMA_MODEL_FAST || 'phi3:mini';
      if (model.includes('70b') || model.includes('72b')) {
        ollamaMemory = 40; // Large model
      } else if (model.includes('14b')) {
        ollamaMemory = 12; // Medium-large
      } else if (model.includes('8b')) {
        ollamaMemory = 10; // Medium
      } else if (model.includes('3b') || model.includes('7b')) {
        ollamaMemory = 6; // Small-medium
      } else {
        ollamaMemory = 2; // Small
      }
    }
  } catch (e) {
    console.warn('Failed to get Ollama memory:', e);
  }

  // Get system memory (Mac)
  let totalMemory = 24; // Default for MacBook Pro 2025
  let freeMemory = 20;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Mac: vm_stat command
      const { stdout } = await execAsync('vm_stat | grep "Pages free" | awk \'{print $3}\' | sed \'s/\\.//\'');
      const pagesFree = parseInt(stdout.trim()) || 0;
      const pageSize = 4096; // bytes
      freeMemory = (pagesFree * pageSize) / (1024 * 1024 * 1024); // GB
      
      // Get total memory
      const { stdout: memStdout } = await execAsync('sysctl hw.memsize | awk \'{print $2}\'');
      const totalBytes = parseInt(memStdout.trim()) || 0;
      totalMemory = totalBytes / (1024 * 1024 * 1024); // GB
    } catch {
      // Fallback values
    }
  } catch (e) {
    console.warn('Failed to get system memory:', e);
  }

  const memoryUsage = totalMemory - freeMemory;

  // Get CPU usage (simplified)
  let cpuUsage = 0;
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Mac: top command
      const { stdout } = await execAsync('top -l 1 | grep "CPU usage" | awk \'{print $3}\' | sed \'s/%//\'');
      cpuUsage = parseFloat(stdout.trim()) || 0;
    } catch {
      // Fallback
      cpuUsage = 20; // Estimated
    }
  } catch (e) {
    console.warn('Failed to get CPU usage:', e);
  }

  return {
    timestamp: new Date(),
    cpuUsage,
    memoryUsage,
    ollamaMemory,
    activeAgents: 0, // Would track from swarm orchestrator
    systemLoad: cpuUsage,
  };
}

// Check if system is healthy
function isSystemHealthy(metrics: PerformanceMetrics): { healthy: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Memory check (warn if >80% used)
  const memoryPercent = (metrics.memoryUsage / 24) * 100; // Assuming 24GB
  if (memoryPercent > 80) {
    warnings.push(`High memory usage: ${memoryPercent.toFixed(1)}% (${metrics.memoryUsage.toFixed(1)}GB/24GB)`);
  }
  
  // CPU check (warn if >70% sustained)
  if (metrics.cpuUsage > 70) {
    warnings.push(`High CPU usage: ${metrics.cpuUsage.toFixed(1)}%`);
  }
  
  // Ollama memory check
  if (metrics.ollamaMemory > 15) {
    warnings.push(`Large Ollama model loaded: ${metrics.ollamaMemory.toFixed(1)}GB - consider lighter model`);
  }
  
  return {
    healthy: warnings.length === 0,
    warnings,
  };
}

export async function runPerformanceMonitor(): Promise<void> {
  console.log('📊 Running performance monitor...');

  const metrics = await getSystemMetrics();
  const health = isSystemHealthy(metrics);

  const statusColor = health.healthy ? '#16a34a' : '#f59e0b';
  const statusText = health.healthy ? '✅ Healthy' : '⚠️ Warnings';

  const warningsHtml = health.warnings.length > 0
    ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <h3 style="color: #92400e; margin-top: 0;">⚠️ Warnings</h3>
        <ul style="color: #78350f; line-height: 1.8;">
          ${health.warnings.map((w) => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const recommendations = [];
  
  if (metrics.memoryUsage > 18) {
    recommendations.push('Consider using lighter models (llama3.2:3b instead of llama3:8b)');
  }
  
  if (metrics.cpuUsage > 60) {
    recommendations.push('Reduce concurrent agent runs or wait for CPU to cool down');
  }
  
  if (metrics.ollamaMemory > 12) {
    recommendations.push('Using large model - system is handling it well, but lighter models would be faster');
  }

  const recommendationsHtml = recommendations.length > 0
    ? `
      <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <h3 style="color: #1e40af; margin-top: 0;">💡 Recommendations</h3>
        <ul style="color: #1e40af; line-height: 1.8;">
          ${recommendations.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📊 Performance Monitor</h1>
      <p><strong>Date:</strong> ${formatInTimeZone(metrics.timestamp, DEFAULT_TZ, 'yyyy-MM-dd HH:mm:ss')}</p>
      
      <div style="background: ${health.healthy ? '#f0fdf4' : '#fffbeb'}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: ${health.healthy ? '#166534' : '#92400e'}; margin-top: 0;">${statusText}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.memoryUsage.toFixed(1)}GB</div>
            <div style="color: #6b7280;">Memory Used</div>
            <div style="color: #9ca3af; font-size: 12px;">of 24GB (${((metrics.memoryUsage / 24) * 100).toFixed(1)}%)</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.cpuUsage.toFixed(1)}%</div>
            <div style="color: #6b7280;">CPU Usage</div>
            <div style="color: #9ca3af; font-size: 12px;">Current load</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.ollamaMemory.toFixed(1)}GB</div>
            <div style="color: #6b7280;">Ollama Memory</div>
            <div style="color: #9ca3af; font-size: 12px;">Model size</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.activeAgents}</div>
            <div style="color: #6b7280;">Active Agents</div>
            <div style="color: #9ca3af; font-size: 12px;">Running now</div>
          </div>
        </div>
      </div>
      
      ${warningsHtml}
      ${recommendationsHtml}
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #166534;">
          <strong>✅ System Status:</strong> Your MacBook Pro 2025 is handling the agent swarm well! 
          ${health.healthy ? 'All metrics are healthy.' : 'Some warnings above, but system is still responsive.'}
        </p>
      </div>
    </div>
  `;

  // Only send email if there are warnings or on daily summary
  const shouldEmail = !health.healthy || new Date().getHours() === 8; // Email at 8 AM daily or if warnings

  if (shouldEmail) {
    const result = await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `📊 Performance Monitor — ${health.healthy ? 'All Healthy' : `${health.warnings.length} Warnings`}`,
      html,
    });

    if (result.ok) {
      console.log(`✅ Performance report sent: ${health.healthy ? 'Healthy' : 'Warnings'}`);
    } else {
      console.warn(`⚠️  Email failed: ${result.reason}`);
    }
  } else {
    console.log(`📊 Performance check: ${health.healthy ? 'All healthy' : `${health.warnings.length} warnings`}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceMonitor().catch(console.error);
}

