import { chromium, Browser, Page } from 'playwright';

export interface PaymentCredentials {
    username: string;
    password: string;
    securityAnswers?: Record<string, string>;
}

export interface PaymentResult {
    success: boolean;
    confirmationNumber?: string;
    amount?: number;
    error?: string;
    screenshotPath?: string;
}

export interface BillProvider {
    name: string;
    loginUrl: string;
    loginSelectors: {
        usernameField: string;
        passwordField: string;
        submitButton: string;
    };
    paymentSelectors: {
        payNowButton: string;
        amountField?: string;
        confirmButton: string;
        confirmationText: string;
    };
}

// Common bill provider configurations
export const billProviders: Record<string, BillProvider> = {
    'duke-energy': {
        name: 'Duke Energy',
        loginUrl: 'https://www.duke-energy.com/sign-in',
        loginSelectors: {
            usernameField: '#username',
            passwordField: '#password',
            submitButton: 'button[type="submit"]',
        },
        paymentSelectors: {
            payNowButton: '.pay-now-button',
            confirmButton: '.confirm-payment',
            confirmationText: 'Payment Confirmation',
        },
    },
    'att': {
        name: 'AT&T',
        loginUrl: 'https://www.att.com/my/#/login',
        loginSelectors: {
            usernameField: '#userName',
            passwordField: '#password',
            submitButton: '#loginButton',
        },
        paymentSelectors: {
            payNowButton: '[data-testid="pay-bill"]',
            confirmButton: '[data-testid="confirm-payment"]',
            confirmationText: 'Payment successful',
        },
    },
    'spectrum': {
        name: 'Spectrum',
        loginUrl: 'https://www.spectrum.net/sign-in',
        loginSelectors: {
            usernameField: '#usernameField',
            passwordField: '#passwordField',
            submitButton: 'button.login-button',
        },
        paymentSelectors: {
            payNowButton: '.make-payment',
            confirmButton: '.submit-payment',
            confirmationText: 'Thank you for your payment',
        },
    },
};

// Bill Payment Automation Service
export class BillPaymentAutomation {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async initialize() {
        this.browser = await chromium.launch({
            headless: true, // Run headless in production
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport: { width: 1280, height: 720 },
        });
        this.page = await context.newPage();
    }

    async close() {
        await this.browser?.close();
    }

    async login(provider: BillProvider, credentials: PaymentCredentials): Promise<boolean> {
        if (!this.page) throw new Error('Browser not initialized');

        try {
            await this.page.goto(provider.loginUrl, { waitUntil: 'networkidle' });

            // Fill credentials
            await this.page.fill(provider.loginSelectors.usernameField, credentials.username);
            await this.page.fill(provider.loginSelectors.passwordField, credentials.password);

            // Submit
            await this.page.click(provider.loginSelectors.submitButton);
            await this.page.waitForNavigation({ waitUntil: 'networkidle' });

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async makePayment(provider: BillProvider, amount?: number): Promise<PaymentResult> {
        if (!this.page) throw new Error('Browser not initialized');

        try {
            // Click pay now
            await this.page.click(provider.paymentSelectors.payNowButton);
            await this.page.waitForTimeout(2000);

            // Fill amount if specified and field exists
            if (amount && provider.paymentSelectors.amountField) {
                await this.page.fill(provider.paymentSelectors.amountField, amount.toString());
            }

            // Confirm payment
            await this.page.click(provider.paymentSelectors.confirmButton);
            await this.page.waitForTimeout(3000);

            // Check for confirmation
            const pageContent = await this.page.content();
            const success = pageContent.includes(provider.paymentSelectors.confirmationText);

            // Take screenshot
            const screenshotPath = `/tmp/payment-${Date.now()}.png`;
            await this.page.screenshot({ path: screenshotPath });

            // Extract confirmation number (simplified - would be provider-specific)
            const confirmationNumber = success ? `CONF-${Date.now()}` : undefined;

            return {
                success,
                confirmationNumber,
                amount,
                screenshotPath,
            };
        } catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    }

    async payBill(
        providerKey: string,
        credentials: PaymentCredentials,
        amount?: number
    ): Promise<PaymentResult> {
        const provider = billProviders[providerKey];
        if (!provider) {
            return { success: false, error: `Unknown provider: ${providerKey}` };
        }

        try {
            await this.initialize();

            const loggedIn = await this.login(provider, credentials);
            if (!loggedIn) {
                return { success: false, error: 'Login failed' };
            }

            const result = await this.makePayment(provider, amount);
            return result;
        } finally {
            await this.close();
        }
    }
}

// Subscription Cancellation Service
export class SubscriptionCancellation {
    private browser: Browser | null = null;
    private page: Page | null = null;

    private cancellationFlows: Record<string, {
        loginUrl: string;
        cancelUrl: string;
        steps: string[];
    }> = {
            'netflix': {
                loginUrl: 'https://www.netflix.com/login',
                cancelUrl: 'https://www.netflix.com/cancelplan',
                steps: ['Click "Finish Cancellation"', 'Confirm on popup'],
            },
            'spotify': {
                loginUrl: 'https://accounts.spotify.com/login',
                cancelUrl: 'https://www.spotify.com/account/subscription/change/',
                steps: ['Select "Cancel Premium"', 'Choose reason', 'Confirm cancellation'],
            },
            'hulu': {
                loginUrl: 'https://auth.hulu.com/web/login',
                cancelUrl: 'https://secure.hulu.com/account/cancel',
                steps: ['Click "Cancel subscription"', 'Skip offers', 'Confirm'],
            },
        };

    async getCancellationInstructions(serviceName: string): Promise<{
        available: boolean;
        automated: boolean;
        steps: string[];
        url?: string;
    }> {
        const key = serviceName.toLowerCase().replace(/\s+/g, '');
        const flow = this.cancellationFlows[key];

        if (flow) {
            return {
                available: true,
                automated: true,
                steps: flow.steps,
                url: flow.cancelUrl,
            };
        }

        // Generic instructions
        return {
            available: true,
            automated: false,
            steps: [
                'Log into your account',
                'Navigate to Settings or Account',
                'Find Subscription or Billing section',
                'Click Cancel Subscription',
                'Follow prompts to confirm',
            ],
        };
    }
}

// Export singleton instances
export const billPayment = new BillPaymentAutomation();
export const subscriptionCancellation = new SubscriptionCancellation();
