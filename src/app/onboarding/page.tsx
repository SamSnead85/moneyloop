import { PremiumOnboardingWizard } from '@/components/onboarding/PremiumOnboardingWizard';

export const metadata = {
    title: 'Get Started | MoneyLoop',
    description: 'Set up your financial command center in minutes',
};

export default function OnboardingPage() {
    return <PremiumOnboardingWizard />;
}
