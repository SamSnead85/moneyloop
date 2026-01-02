import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | MoneyLoop',
    description: 'MoneyLoop terms of service and user agreement',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050508]">
            {/* Header */}
            <header className="border-b border-white/[0.03]">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] mb-6">
                        <FileText className="w-8 h-8 text-white/40" />
                    </div>
                    <h1 className="text-4xl font-medium mb-4">Terms of Service</h1>
                    <p className="text-white/40">Last updated: January 1, 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-12 text-white/60 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using MoneyLoop ("Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p>
                            MoneyLoop is a financial aggregation and tracking platform that allows you to connect your
                            financial accounts and view your complete financial picture in one place. We provide read-only
                            access to your financial information and do not have the ability to move money or make transactions
                            on your behalf.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration</h2>
                        <p>
                            To use certain features of the Service, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information</li>
                            <li>Keep your password secure and confidential</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
                        <p>
                            Some features of the Service require a paid subscription. By subscribing, you agree to:
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Pay all fees associated with your chosen plan</li>
                            <li>Automatic renewal unless you cancel before the renewal date</li>
                            <li>Our right to change pricing with 30 days notice</li>
                        </ul>
                        <p className="mt-4">
                            You may cancel your subscription at any time. Cancellation will take effect at the end of your
                            current billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Use Restrictions</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Use the Service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to any part of the Service</li>
                            <li>Interfere with the proper functioning of the Service</li>
                            <li>Share your account credentials with others</li>
                            <li>Use automated systems to access the Service without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">6. Financial Information Disclaimer</h2>
                        <p>
                            The information provided through MoneyLoop is for informational purposes only and should not be
                            considered financial, investment, tax, or legal advice. We are not a financial advisor, and you
                            should consult with qualified professionals before making financial decisions.
                        </p>
                        <p className="mt-4">
                            While we strive for accuracy, we do not guarantee that the financial data displayed is accurate,
                            complete, or current. Account balances and transactions are provided by third-party data sources
                            and may be delayed or contain errors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">7. Privacy</h2>
                        <p>
                            Your privacy is important to us. Please review our{' '}
                            <Link href="/privacy" className="text-white underline">Privacy Policy</Link> to understand how
                            we collect, use, and protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, MoneyLoop shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages arising out of your use of the Service. Our total
                            liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. We will notify you of material changes
                            by email or through the Service. Your continued use of the Service after such modifications
                            constitutes your acceptance of the updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
                        <p>
                            We may terminate or suspend your account at any time for violation of these terms. You may
                            terminate your account at any time by contacting us or using the account deletion feature.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">11. Contact</h2>
                        <p>
                            For questions about these Terms, please contact us at{' '}
                            <a href="mailto:legal@moneyloop.ai" className="text-white underline">legal@moneyloop.ai</a>.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.03] py-8 mt-16">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-white/30">
                    <span>© 2026 MoneyLoop</span>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
