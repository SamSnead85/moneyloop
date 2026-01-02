import Link from 'next/link';
import { Shield, Lock, Eye, Server, Trash2, Download, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | MoneyLoop',
    description: 'How MoneyLoop protects your financial data and privacy',
};

export default function PrivacyPage() {
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-6">
                        <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-medium mb-4">Privacy Policy</h1>
                    <p className="text-white/40">Last updated: January 1, 2026</p>
                </div>

                {/* Our Commitment */}
                <section className="mb-16 p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Our Commitment to You</h2>
                    <p className="text-white/70 text-lg leading-relaxed">
                        <strong className="text-white">We will never sell your data. Ever.</strong> Your financial information is yours alone.
                        We do not share, sell, rent, or trade your personal or financial data with any third parties for marketing,
                        advertising, or any other commercial purposes. This is not what we do. We exist to protect your data from
                        those who would misuse it.
                    </p>
                </section>

                {/* Key Points */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-8">Key Privacy Principles</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: 'Bank-Level Encryption',
                                description: 'All data is encrypted using 256-bit AES encryption, the same standard used by major financial institutions.',
                            },
                            {
                                icon: Eye,
                                title: 'Read-Only Access',
                                description: 'We only request read-only access to your financial accounts. We cannot move money or make transactions on your behalf.',
                            },
                            {
                                icon: Server,
                                title: 'Secure Infrastructure',
                                description: 'Your data is stored in SOC 2 Type II certified data centers with continuous monitoring and security audits.',
                            },
                            {
                                icon: Trash2,
                                title: 'Data Deletion',
                                description: 'You can delete your account and all associated data at any time. When you delete, we delete—permanently.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                <item.icon className="w-6 h-6 text-white/40 mb-4" />
                                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Detailed Sections */}
                <div className="space-y-12 text-white/60 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
                        <ul className="space-y-3 list-disc list-inside">
                            <li><strong className="text-white/80">Account Information:</strong> Email address and password (encrypted) for authentication.</li>
                            <li><strong className="text-white/80">Financial Data:</strong> Account balances, transactions, and holdings from connected accounts (read-only).</li>
                            <li><strong className="text-white/80">Usage Data:</strong> How you interact with our service to improve your experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
                        <ul className="space-y-3 list-disc list-inside">
                            <li>To provide you with a unified view of your financial accounts</li>
                            <li>To help you identify savings opportunities and optimize your finances</li>
                            <li>To send you important updates about your account and our service</li>
                            <li>To improve our service based on aggregated, anonymized usage patterns</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">What We Will Never Do</h2>
                        <ul className="space-y-3 list-disc list-inside">
                            <li className="text-emerald-400/80">Sell your personal or financial data to third parties</li>
                            <li className="text-emerald-400/80">Share your data with advertisers or data brokers</li>
                            <li className="text-emerald-400/80">Use your data for targeted advertising</li>
                            <li className="text-emerald-400/80">Access your accounts for any purpose other than displaying information to you</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
                        <ul className="space-y-3 list-disc list-inside">
                            <li><strong className="text-white/80">Access:</strong> Request a copy of all data we have about you</li>
                            <li><strong className="text-white/80">Correction:</strong> Update or correct your personal information</li>
                            <li><strong className="text-white/80">Deletion:</strong> Delete your account and all associated data</li>
                            <li><strong className="text-white/80">Export:</strong> Download your data in a portable format</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
                        <p>
                            We use trusted third-party services to power certain features:
                        </p>
                        <ul className="space-y-3 list-disc list-inside mt-4">
                            <li><strong className="text-white/80">Plaid:</strong> Secure bank account connections (they are also bound by strict privacy requirements)</li>
                            <li><strong className="text-white/80">Stripe:</strong> Payment processing (they never share your payment details with us)</li>
                            <li><strong className="text-white/80">Supabase:</strong> Authentication and data storage (SOC 2 Type II certified)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or how we handle your data,
                            please contact us at <a href="mailto:privacy@moneyloop.ai" className="text-white underline">privacy@moneyloop.ai</a>.
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
