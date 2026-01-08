// Original exports (legacy)
export { OnboardingWizard } from './OnboardingWizard';
export { WizardProgress } from './WizardProgress';
export { DataConsentModal } from './DataConsentModal';
export { LifeBuilder } from './LifeBuilder';

// Premium exports (new)
export { PremiumOnboardingWizard } from './PremiumOnboardingWizard';
export { FinancialSnapshot } from './FinancialSnapshot';

// Original step exports (legacy)
export { PathSelector } from './steps/PathSelector';
export { BankConnectionStep } from './steps/BankConnectionStep';
export { AIAnalysisStep } from './steps/AIAnalysisStep';
export { ExpenseReviewStep } from './steps/ExpenseReviewStep';
export { IncomeEntryStep } from './steps/IncomeEntryStep';
export { ExpenseQuestionnaireStep } from './steps/ExpenseQuestionnaireStep';
export { FileUploadStep } from './steps/FileUploadStep';
export { CompletionStep } from './steps/CompletionStep';

// Premium step exports (new)
export { PremiumPathSelector } from './steps/PremiumPathSelector';
export { PremiumIncomeEntry } from './steps/PremiumIncomeEntry';
export { PremiumExpenseQuestionnaire } from './steps/PremiumExpenseQuestionnaire';
export { PremiumCompletionStep } from './steps/PremiumCompletionStep';

// Types
export type {
    OnboardingPath,
    OnboardingState,
    DetectedExpense,
    ManualExpense,
    IncomeStream,
} from './OnboardingWizard';
