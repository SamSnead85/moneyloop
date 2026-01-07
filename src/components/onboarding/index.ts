export { OnboardingWizard } from './OnboardingWizard';
export { WizardProgress } from './WizardProgress';
export { DataConsentModal } from './DataConsentModal';

// Step exports
export { PathSelector } from './steps/PathSelector';
export { BankConnectionStep } from './steps/BankConnectionStep';
export { AIAnalysisStep } from './steps/AIAnalysisStep';
export { ExpenseReviewStep } from './steps/ExpenseReviewStep';
export { IncomeEntryStep } from './steps/IncomeEntryStep';
export { ExpenseQuestionnaireStep } from './steps/ExpenseQuestionnaireStep';
export { FileUploadStep } from './steps/FileUploadStep';
export { CompletionStep } from './steps/CompletionStep';

// Types
export type {
    OnboardingPath,
    OnboardingState,
    DetectedExpense,
    ManualExpense,
    IncomeStream,
} from './OnboardingWizard';
