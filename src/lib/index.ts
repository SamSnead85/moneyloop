/**
 * MoneyLoop Library Exports
 * 
 * Central barrel file for commonly used library modules.
 * Import specific modules directly for full access.
 */

// Categories
export { categorizeTransaction, bulkCategorize, getCategoryInsights } from './categories/smart-categorizer';

// Credit & Debt
export { estimateCreditScore, calculateAvalanchePayoff, calculateSnowballPayoff } from './credit/credit-manager';

// AI Chat
export { processMessage, detectIntent, createConversation } from './chat/ai-chat';

// Compliance & Privacy
export { recordConsent, requestDataExport, getPrivacySettings } from './compliance/privacy-manager';

// Database & Query
export { buildQuery, executeQuery, batchInsert, batchUpdate } from './database/query-optimizer';

// Performance & Caching
export { lazyLoad, debounce, throttle, paginate, memoize } from './performance/cache-layer';

// Notifications
export { createNotification, getUserNotifications, markAsRead } from './notifications/notification-service';

// Developer API
export { generateAPIKey, validateAPIKey, checkRateLimit } from './api/developer-api';

// Goals
export { createGoal, updateGoalProgress, calculateProjection } from './goals/goal-automation';
