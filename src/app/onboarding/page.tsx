import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export const metadata = {
    title: 'Get Started | MoneyLoop',
    description: 'Set up your financial command center in minutes',
};

export default function OnboardingPage() {
    return <OnboardingWizard />;
}
