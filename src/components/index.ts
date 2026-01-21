/**
 * Components Index
 * 
 * Central export point for all UI components.
 */

// Error Handling
export { ErrorBoundary, AsyncErrorBoundary, APIError, createErrorResponse, withRetry } from './error/ErrorBoundary';

// UI States
export {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonChart,
    SkeletonDashboard,
    EmptyState,
    EmptyTransactions,
    EmptyBudgets,
    EmptyGoals,
    EmptySearch,
    EmptyInbox,
    ErrorState,
    OfflineState,
    NotFoundState,
    LoadingSpinner,
    LoadingOverlay,
    PageLoader,
} from './ui-states/UIStates';

// Dashboard
export * from './dashboard/DashboardWidgets';

// Charts
export * from './charts/FinancialCharts';

// AI
export * from './ai/AgentDashboard';

// Automation
export * from './automation/RuleBuilder';
