import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Plaid client configuration
// In production, use 'production' environment
const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
            'PLAID-SECRET': process.env.PLAID_SECRET || '',
        },
    },
});

export const plaidClient = new PlaidApi(configuration);

// Default Plaid products to request
export const PLAID_PRODUCTS: Products[] = [
    Products.Transactions,
    Products.Auth,
    Products.Identity,
];

// Supported countries
export const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us];

// Helper to create link token
export async function createLinkToken(userId: string) {
    const response = await plaidClient.linkTokenCreate({
        user: {
            client_user_id: userId,
        },
        client_name: 'MoneyLoop',
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
    });

    return response.data;
}

// Helper to exchange public token for access token
export async function exchangePublicToken(publicToken: string) {
    const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });

    return response.data;
}

// Helper to get accounts
export async function getAccounts(accessToken: string) {
    const response = await plaidClient.accountsGet({
        access_token: accessToken,
    });

    return response.data;
}

// Helper to get transactions
export async function getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
) {
    const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
    });

    return response.data;
}

// Helper to get institution info
export async function getInstitution(institutionId: string) {
    const response = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: PLAID_COUNTRY_CODES,
    });

    return response.data;
}
