/**
 * Model selector for AIMLAPI - chooses best model based on task type
 * AIMLAPI provides access to 300+ models - use the best one for each task!
 */

export type TaskType = 
  | 'social-post'      // Social media posts
  | 'agent-report'    // EOD, Intake, Grant reports
  | 'ad-copy'          // Ad generation
  | 'qa-verification'  // QA checks
  | 'email-content'    // Email content
  | 'general';         // General use

/**
 * Get the best AIMLAPI model for a specific task
 */
export function getBestModelForTask(taskType: TaskType): string {
  // Use custom model if set, otherwise use task-specific best model
  const customModel = process.env.AIMLAPI_MODEL;
  if (customModel) {
    return customModel;
  }

  // Task-specific model selection
  switch (taskType) {
    case 'social-post':
      // Creative, fast models for social media
      return 'gpt-4-turbo'; // Fast, creative, great for posts
    
    case 'agent-report':
      // Structured, thorough models for reports
      return 'claude-3-opus'; // Best quality for structured content
    
    case 'ad-copy':
      // Creative, persuasive models for ads
      return 'claude-3-opus'; // Most creative and persuasive
    
    case 'qa-verification':
      // Fast, reliable models for verification
      return 'gpt-4-turbo'; // Fast and reliable
    
    case 'email-content':
      // Professional tone models
      return 'claude-3-opus'; // Best professional tone
    
    case 'general':
    default:
      // Balanced default
      return 'gpt-4-turbo'; // Good balance of speed and quality
  }
}

/**
 * Model recommendations by use case
 */
export const MODEL_RECOMMENDATIONS = {
  // Best Quality (slower, most expensive)
  bestQuality: 'claude-3-opus',
  
  // Best Speed (faster, cheaper)
  bestSpeed: 'gpt-4-turbo',
  
  // Best Balance
  bestBalance: 'claude-3-sonnet',
  
  // Creative Content
  creative: 'claude-3-opus',
  
  // Structured Reports
  structured: 'claude-3-opus',
  
  // Fast Tasks
  fast: 'gpt-4-turbo',
  
  // Professional Content
  professional: 'claude-3-opus',
};

