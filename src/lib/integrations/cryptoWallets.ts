'use server';

// Crypto Wallet Integration for tracking cryptocurrency holdings
// Supports: Ethereum, Bitcoin, Coinbase, and other major wallets

export type CryptoNetwork = 'ethereum' | 'bitcoin' | 'solana' | 'polygon';
export type CryptoExchange = 'coinbase' | 'binance' | 'kraken';

interface CryptoHolding {
    symbol: string;
    name: string;
    amount: number;
    valueUsd: number;
    wallet: string;
    network?: CryptoNetwork;
}

interface WalletBalance {
    address: string;
    network: CryptoNetwork;
    holdings: CryptoHolding[];
    totalValueUsd: number;
}

interface CryptoTransaction {
    hash: string;
    from: string;
    to: string;
    value: number;
    symbol: string;
    timestamp: string;
    valueUsd: number;
    type: 'send' | 'receive' | 'swap' | 'nft';
}

// Get current crypto prices
async function getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    const ids = symbols.map(s => s.toLowerCase()).join(',');
    const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const [id, value] of Object.entries(data)) {
        prices[id.toUpperCase()] = (value as { usd: number }).usd;
    }

    return prices;
}

// Get Ethereum wallet balance using public API
export async function getEthereumBalance(
    address: string
): Promise<WalletBalance> {
    const apiKey = process.env.ETHERSCAN_API_KEY;

    // Get ETH balance
    const ethResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    const ethData = await ethResponse.json();
    const ethBalance = parseFloat(ethData.result) / 1e18; // Convert from Wei

    // Get ERC-20 token balances
    const tokenResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );
    const tokenData = await tokenResponse.json();

    // Aggregate token balances
    const tokenBalances: Record<string, { amount: number; symbol: string; name: string }> = {};

    for (const tx of tokenData.result?.slice(0, 100) || []) {
        const symbol = tx.tokenSymbol;
        if (!tokenBalances[symbol]) {
            tokenBalances[symbol] = {
                amount: 0,
                symbol,
                name: tx.tokenName,
            };
        }

        const value = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
        if (tx.to.toLowerCase() === address.toLowerCase()) {
            tokenBalances[symbol].amount += value;
        } else {
            tokenBalances[symbol].amount -= value;
        }
    }

    // Get prices
    const symbols = ['ethereum', ...Object.keys(tokenBalances).map(s => s.toLowerCase())];
    const prices = await getCryptoPrices(symbols);

    // Build holdings
    const holdings: CryptoHolding[] = [
        {
            symbol: 'ETH',
            name: 'Ethereum',
            amount: ethBalance,
            valueUsd: ethBalance * (prices['ETHEREUM'] || 0),
            wallet: address,
            network: 'ethereum',
        },
    ];

    for (const [symbol, data] of Object.entries(tokenBalances)) {
        if (data.amount > 0) {
            holdings.push({
                symbol,
                name: data.name,
                amount: data.amount,
                valueUsd: data.amount * (prices[symbol] || 0),
                wallet: address,
                network: 'ethereum',
            });
        }
    }

    const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0);

    return {
        address,
        network: 'ethereum',
        holdings,
        totalValueUsd,
    };
}

// Get Bitcoin wallet balance
export async function getBitcoinBalance(
    address: string
): Promise<WalletBalance> {
    const response = await fetch(
        `https://blockchain.info/balance?active=${address}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin balance');
    }

    const data = await response.json();
    const satoshis = data[address]?.final_balance || 0;
    const btcAmount = satoshis / 1e8;

    const prices = await getCryptoPrices(['bitcoin']);
    const valueUsd = btcAmount * (prices['BITCOIN'] || 0);

    return {
        address,
        network: 'bitcoin',
        holdings: [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                amount: btcAmount,
                valueUsd,
                wallet: address,
                network: 'bitcoin',
            },
        ],
        totalValueUsd: valueUsd,
    };
}

// Coinbase OAuth integration
export async function getCoinbasePortfolio(
    accessToken: string
): Promise<WalletBalance[]> {
    const response = await fetch('https://api.coinbase.com/v2/accounts', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'CB-VERSION': '2023-01-01',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Coinbase accounts');
    }

    const data = await response.json();
    const wallets: WalletBalance[] = [];

    for (const account of data.data || []) {
        const amount = parseFloat(account.balance.amount);
        if (amount > 0) {
            const holdings: CryptoHolding[] = [
                {
                    symbol: account.currency.code,
                    name: account.currency.name,
                    amount,
                    valueUsd: parseFloat(account.native_balance.amount),
                    wallet: 'coinbase',
                },
            ];

            wallets.push({
                address: account.id,
                network: 'ethereum', // Simplified
                holdings,
                totalValueUsd: parseFloat(account.native_balance.amount),
            });
        }
    }

    return wallets;
}

// Get recent transactions for tax reporting
export async function getRecentTransactions(
    address: string,
    network: CryptoNetwork
): Promise<CryptoTransaction[]> {
    if (network !== 'ethereum') {
        // Only Ethereum implemented for now
        return [];
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;
    const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );

    const data = await response.json();
    const transactions: CryptoTransaction[] = [];

    for (const tx of data.result?.slice(0, 50) || []) {
        const value = parseFloat(tx.value) / 1e18;
        if (value === 0) continue; // Skip contract interactions with 0 value

        transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value,
            symbol: 'ETH',
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            valueUsd: 0, // Would need historical price
            type: tx.to.toLowerCase() === address.toLowerCase() ? 'receive' : 'send',
        });
    }

    return transactions;
}

// Aggregate all crypto holdings
export async function aggregateCryptoHoldings(
    walletAddresses: { address: string; network: CryptoNetwork }[],
    exchanges: { exchange: CryptoExchange; accessToken: string }[] = []
): Promise<{
    totalValueUsd: number;
    holdings: CryptoHolding[];
    wallets: WalletBalance[];
}> {
    const wallets: WalletBalance[] = [];

    for (const { address, network } of walletAddresses) {
        try {
            let balance: WalletBalance;

            if (network === 'ethereum') {
                balance = await getEthereumBalance(address);
            } else if (network === 'bitcoin') {
                balance = await getBitcoinBalance(address);
            } else {
                continue;
            }

            wallets.push(balance);
        } catch (error) {
            console.error(`Failed to get balance for ${address}:`, error);
        }
    }

    // Add exchange holdings
    for (const { exchange, accessToken } of exchanges) {
        try {
            if (exchange === 'coinbase') {
                const coinbaseWallets = await getCoinbasePortfolio(accessToken);
                wallets.push(...coinbaseWallets);
            }
        } catch (error) {
            console.error(`Failed to get ${exchange} holdings:`, error);
        }
    }

    // Aggregate all holdings
    const allHoldings: CryptoHolding[] = wallets.flatMap(w => w.holdings);
    const totalValueUsd = allHoldings.reduce((sum, h) => sum + h.valueUsd, 0);

    return {
        totalValueUsd,
        holdings: allHoldings,
        wallets,
    };
}
