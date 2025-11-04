/**
 * Main entry point for Colombian business email campaign
 * Sends tailored emails to 50,000 businesses using multiple agents
 */

import { CampaignOrchestrator } from './campaignOrchestrator.js';

async function main() {
  console.log('🎯 Colombian Business Email Campaign');
  console.log('═══════════════════════════════════════\n');

  // Configuration
  const config = {
    targetCount: 50000,
    maxConcurrentAgents: 20, // Run 20 agents in parallel
    delayBetweenEmails: 50, // 50ms delay between starting each email
    priorityOrder: 'high-to-low' as const, // High net worth owner-occupied first
    saveProgress: true,
    progressFile: 'campaign-progress.json',
  };

  // Create orchestrator
  const orchestrator = new CampaignOrchestrator(config);

  // Run campaign
  try {
    const stats = await orchestrator.run();
    console.log('\n✅ Campaign completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Campaign failed:', error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);
