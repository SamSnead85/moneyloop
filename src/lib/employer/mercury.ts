// Mercury Bank API Integration
// https://docs.mercury.com/reference

import { BankAccount } from './types';

// Mercury API Configuration
const MERCURY_API_URL = process.env.MERCURY_API_URL || 'https://api.mercury.com/api/v1';
const MERCURY_API_KEY = process.env.MERCURY_API_KEY || '';

// Types
export interface MercuryAccount {
    id: string;
    name: string;
    kind: 'checking' | 'savings' | 'mercury_credit';
    status: 'active' | 'closed' | 'pending';
    type: 'mercury' | 'external';
    legalBusinessName: string;
    currentBalance: number;
    availableBalance: number;
    routingNumber: string;
    accountNumber: string;
    createdAt: string;
}

export interface MercuryTransaction {
    id: string;
    amount: number;
    status: 'pending' | 'sent' | 'cancelled' | 'failed';
    note?: string;
    bankDescription?: string;
    counterpartyId?: string;
    counterpartyName?: string;
    counterpartyNickname?: string;
    createdAt: string;
    postedDate?: string;
    kind: 'externalTransfer' | 'internalTransfer' | 'outgoingPayment' | 'debitCardTransaction' | 'fee';
    externalMemo?: string;
}

export interface MercuryRecipient {
    id: string;
    name: string;
    nickname?: string;
    emails: string[];
    paymentMethod: 'ach' | 'wire' | 'domesticWire' | 'internationalWire' | 'check';
    electronicRoutingInfo?: {
        accountNumber: string;
        routingNumber: string;
        bankName?: string;
        accountType: 'checking' | 'savings';
    };
    address?: {
        address1: string;
        address2?: string;
        city: string;
        region: string; // State
        postalCode: string;
        country: string;
    };
    status: 'active' | 'deleted';
    createdAt: string;
}

export interface CreateRecipientRequest {
    name: string;
    emails?: string[];
    paymentMethod: 'ach' | 'check';
    electronicRoutingInfo?: {
        accountNumber: string;
        routingNumber: string;
        bankName?: string;
        accountType: 'checking' | 'savings';
    };
    address?: {
        address1: string;
        address2?: string;
        city: string;
        region: string;
        postalCode: string;
        country: string;
    };
}

export interface CreatePaymentRequest {
    recipientId: string;
    amount: number; // In cents
    paymentMethod: 'ach' | 'check';
    idempotencyKey: string;
    note?: string;
    externalMemo?: string; // Shows on recipient's statement
}

export interface MercuryPayment {
    id: string;
    recipientId: string;
    amount: number;
    status: 'pending' | 'sent' | 'cancelled' | 'failed';
    paymentMethod: 'ach' | 'check';
    estimatedDeliveryDate?: string;
    createdAt: string;
    note?: string;
    externalMemo?: string;
}

// API Client
class MercuryAPI {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string = MERCURY_API_KEY, baseUrl: string = MERCURY_API_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Mercury API error: ${response.status}`);
        }

        return response.json();
    }

    // Accounts
    async getAccounts(): Promise<{ accounts: MercuryAccount[] }> {
        return this.request('/accounts');
    }

    async getAccount(accountId: string): Promise<MercuryAccount> {
        return this.request(`/account/${accountId}`);
    }

    async getAccountBalance(accountId: string): Promise<{
        currentBalance: number;
        availableBalance: number
    }> {
        const account = await this.getAccount(accountId);
        return {
            currentBalance: account.currentBalance,
            availableBalance: account.availableBalance,
        };
    }

    // Transactions
    async getTransactions(
        accountId: string,
        options?: {
            limit?: number;
            offset?: number;
            start?: string; // ISO date
            end?: string; // ISO date
            status?: 'pending' | 'sent' | 'cancelled' | 'failed';
        }
    ): Promise<{ transactions: MercuryTransaction[] }> {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());
        if (options?.start) params.append('start', options.start);
        if (options?.end) params.append('end', options.end);
        if (options?.status) params.append('status', options.status);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/account/${accountId}/transactions${query}`);
    }

    // Recipients (for payroll)
    async getRecipients(): Promise<{ recipients: MercuryRecipient[] }> {
        return this.request('/recipients');
    }

    async getRecipient(recipientId: string): Promise<MercuryRecipient> {
        return this.request(`/recipients/${recipientId}`);
    }

    async createRecipient(data: CreateRecipientRequest): Promise<MercuryRecipient> {
        return this.request('/recipients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRecipient(
        recipientId: string,
        data: Partial<CreateRecipientRequest>
    ): Promise<MercuryRecipient> {
        return this.request(`/recipients/${recipientId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteRecipient(recipientId: string): Promise<void> {
        await this.request(`/recipients/${recipientId}`, {
            method: 'DELETE',
        });
    }

    // Payments (ACH)
    async createPayment(
        accountId: string,
        data: CreatePaymentRequest
    ): Promise<MercuryPayment> {
        return this.request(`/account/${accountId}/transactions`, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                amount: data.amount / 100, // Convert from cents to dollars
            }),
        });
    }

    async getPayment(
        accountId: string,
        transactionId: string
    ): Promise<MercuryPayment> {
        return this.request(`/account/${accountId}/transactions/${transactionId}`);
    }

    // Batch Payments (for payroll)
    async createBatchPayments(
        accountId: string,
        payments: CreatePaymentRequest[]
    ): Promise<{ payments: MercuryPayment[]; errors: { index: number; error: string }[] }> {
        const results: MercuryPayment[] = [];
        const errors: { index: number; error: string }[] = [];

        // Mercury doesn't have a native batch endpoint, so we process sequentially
        // In production, you might want to use Promise.allSettled for parallel processing
        for (let i = 0; i < payments.length; i++) {
            try {
                const payment = await this.createPayment(accountId, payments[i]);
                results.push(payment);
            } catch (error) {
                errors.push({
                    index: i,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return { payments: results, errors };
    }
}

// Singleton instance
let mercuryClient: MercuryAPI | null = null;

export function getMercuryClient(): MercuryAPI {
    if (!mercuryClient) {
        mercuryClient = new MercuryAPI();
    }
    return mercuryClient;
}

// Helper functions for payroll
export async function processPayrollPayments(
    accountId: string,
    employees: Array<{
        recipientId: string;
        name: string;
        amount: number; // In cents
        payPeriod: string;
    }>
): Promise<{
    successful: Array<{ employeeName: string; paymentId: string; amount: number }>;
    failed: Array<{ employeeName: string; error: string }>;
}> {
    const client = getMercuryClient();
    const successful: Array<{ employeeName: string; paymentId: string; amount: number }> = [];
    const failed: Array<{ employeeName: string; error: string }> = [];

    for (const employee of employees) {
        try {
            const payment = await client.createPayment(accountId, {
                recipientId: employee.recipientId,
                amount: employee.amount,
                paymentMethod: 'ach',
                idempotencyKey: `payroll-${employee.recipientId}-${employee.payPeriod}`,
                note: `Payroll for ${employee.payPeriod}`,
                externalMemo: `Payroll - ${employee.payPeriod}`,
            });

            successful.push({
                employeeName: employee.name,
                paymentId: payment.id,
                amount: employee.amount,
            });
        } catch (error) {
            failed.push({
                employeeName: employee.name,
                error: error instanceof Error ? error.message : 'Payment failed',
            });
        }
    }

    return { successful, failed };
}

export async function setupEmployeeAsRecipient(
    employee: {
        firstName: string;
        lastName: string;
        email: string;
        bankAccountNumber: string;
        bankRoutingNumber: string;
        bankAccountType: 'checking' | 'savings';
    }
): Promise<MercuryRecipient> {
    const client = getMercuryClient();

    return client.createRecipient({
        name: `${employee.firstName} ${employee.lastName}`,
        emails: [employee.email],
        paymentMethod: 'ach',
        electronicRoutingInfo: {
            accountNumber: employee.bankAccountNumber,
            routingNumber: employee.bankRoutingNumber,
            accountType: employee.bankAccountType,
        },
    });
}

export async function getAccountForPayroll(): Promise<{
    account: MercuryAccount | null;
    hasSufficientFunds: (amount: number) => boolean;
}> {
    const client = getMercuryClient();

    try {
        const { accounts } = await client.getAccounts();
        const checkingAccount = accounts.find(
            a => a.kind === 'checking' && a.status === 'active'
        );

        return {
            account: checkingAccount || null,
            hasSufficientFunds: (amount: number) =>
                checkingAccount ? checkingAccount.availableBalance >= amount : false,
        };
    } catch {
        return {
            account: null,
            hasSufficientFunds: () => false,
        };
    }
}

// Convert MoneyLoop bank account to Mercury format
export function toMercuryBankAccount(account: BankAccount): Partial<MercuryAccount> {
    return {
        id: account.mercuryAccountId,
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        kind: account.accountType,
        name: account.bankName,
    };
}

export default MercuryAPI;
