/**
 * Simple metrics tracking for automation scripts
 * Tracks API calls, successes, failures, costs
 */

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.record(name, value, tags);
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    total: number;
    byName: Record<string, { count: number; sum: number; avg: number }>;
  } {
    const byName: Record<string, { count: number; sum: number; values: number[] }> = {};

    for (const metric of this.metrics) {
      if (!byName[metric.name]) {
        byName[metric.name] = { count: 0, sum: 0, values: [] };
      }
      byName[metric.name].count++;
      byName[metric.name].sum += metric.value;
      byName[metric.name].values.push(metric.value);
    }

    const summary: Record<string, { count: number; sum: number; avg: number }> = {};
    for (const [name, data] of Object.entries(byName)) {
      summary[name] = {
        count: data.count,
        sum: data.sum,
        avg: data.sum / data.count,
      };
    }

    return {
      total: this.metrics.length,
      byName: summary,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

