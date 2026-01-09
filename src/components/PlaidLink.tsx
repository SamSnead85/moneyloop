'use client';

import { useCallback, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from '@/components/ui';
import { Building2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface PlaidLinkButtonProps {
    onSuccess?: () => void;
    className?: string;
    children?: React.ReactNode;
}

// Demo accounts to simulate when Plaid is not configured
const DEMO_ACCOUNTS = {
    institution: 'Bank of America',
    accounts: [
        { id: 'demo-checking-1', name: 'BoA Core Checking', type: 'depository', subtype: 'checking', balance: 12847.32 },
        { id: 'demo-savings-1', name: 'BoA Savings', type: 'depository', subtype: 'savings', balance: 44802.18 },
        { id: 'demo-credit-1', name: 'BoA Cash Rewards Visa', type: 'credit', subtype: 'credit card', balance: -2341.56 },
    ],
};

export function PlaidLinkButton({ onSuccess, className, children }: PlaidLinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showDemoOption, setShowDemoOption] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    // Demo mode: Simulate connecting Bank of America
    const connectDemoBank = useCallback(() => {
        setIsConnecting(true);

        // Simulate network delay
        setTimeout(() => {
            // Store demo accounts in localStorage
            if (typeof window !== 'undefined') {
                const existingAccounts = JSON.parse(localStorage.getItem('moneyloop_demo_accounts') || '[]');
                const newAccounts = DEMO_ACCOUNTS.accounts.map(acc => ({
                    ...acc,
                    institution: DEMO_ACCOUNTS.institution,
                    connected_at: new Date().toISOString(),
                }));
                localStorage.setItem('moneyloop_demo_accounts', JSON.stringify([...existingAccounts, ...newAccounts]));
            }

            setConnectionResult({
                success: true,
                message: `Connected ${DEMO_ACCOUNTS.institution} with ${DEMO_ACCOUNTS.accounts.length} account(s)!`,
            });
            setIsConnecting(false);
            onSuccess?.();
        }, 2000);
    }, [onSuccess]);

    // Fetch link token when component mounts or user clicks
    const fetchLinkToken = useCallback(async () => {
        setIsLoading(true);
        setShowDemoOption(false);
        try {
            const response = await fetch('/api/plaid/create-link-token', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.link_token) {
                setLinkToken(data.link_token);
                return data.link_token;
            } else {
                throw new Error(data.error || 'Failed to get link token');
            }
        } catch (error) {
            console.error('Error fetching link token:', error);
            // Show demo option when Plaid fails
            setShowDemoOption(true);
            setConnectionResult({
                success: false,
                message: 'Plaid not configured. Use demo mode to preview.',
            });
        } finally {
            setIsLoading(false);
        }
        return null;
    }, []);

    // Handle successful Plaid Link connection
    const handleSuccess: PlaidLinkOnSuccess = useCallback(
        async (public_token, metadata) => {
            setIsConnecting(true);
            try {
                const response = await fetch('/api/plaid/exchange-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_token, metadata }),
                });

                const data = await response.json();

                if (data.success) {
                    setConnectionResult({
                        success: true,
                        message: `Connected ${data.institution_name} with ${data.accounts_connected} account(s)!`,
                    });
                    onSuccess?.();
                } else {
                    throw new Error(data.error || 'Failed to connect');
                }
            } catch (error) {
                console.error('Error exchanging token:', error);
                setConnectionResult({
                    success: false,
                    message: 'Failed to complete connection. Please try again.',
                });
            } finally {
                setIsConnecting(false);
            }
        },
        [onSuccess]
    );

    // Plaid Link configuration
    const config: PlaidLinkOptions = {
        token: linkToken,
        onSuccess: handleSuccess,
        onExit: (err) => {
            if (err) {
                console.error('Plaid Link exit with error:', err);
            }
        },
    };

    const { open, ready } = usePlaidLink(config);

    // Handle button click
    const handleClick = async () => {
        if (linkToken && ready) {
            open();
        } else {
            const token = await fetchLinkToken();
            if (token) {
                // Token is set, need to wait for usePlaidLink to be ready
                // The open function will be available on next render
                setTimeout(() => open(), 100);
            }
        }
    };

    // Show demo option after Plaid fails
    if (showDemoOption && !connectionResult?.success) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-amber-400">
                        Plaid API not configured
                    </span>
                </div>
                <Button
                    onClick={connectDemoBank}
                    disabled={isConnecting}
                    className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ${className}`}
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting Demo Account...
                        </>
                    ) : (
                        <>
                            <Building2 className="w-4 h-4" />
                            Connect Demo Bank of America
                        </>
                    )}
                </Button>
                <p className="text-center text-xs text-white/40">
                    This will simulate a Bank of America connection with sample data
                </p>
            </div>
        );
    }

    if (connectionResult) {
        return (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${connectionResult.success
                ? 'bg-[#7dd3a8]/10 border border-[#7dd3a8]/20'
                : 'bg-red-500/10 border border-red-500/20'
                }`}>
                <CheckCircle className={`w-5 h-5 ${connectionResult.success ? 'text-[#7dd3a8]' : 'text-red-400'
                    }`} />
                <span className={`text-sm ${connectionResult.success ? 'text-[#7dd3a8]' : 'text-red-400'
                    }`}>
                    {connectionResult.message}
                </span>
                {connectionResult.success && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setConnectionResult(null);
                            setLinkToken(null);
                            setShowDemoOption(false);
                        }}
                        className="ml-auto text-xs"
                    >
                        Connect Another
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading || isConnecting}
            className={className}
        >
            {isLoading || isConnecting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isConnecting ? 'Connecting...' : 'Initializing...'}
                </>
            ) : (
                <>
                    <Building2 className="w-4 h-4" />
                    {children || 'Connect Bank Account'}
                </>
            )}
        </Button>
    );
}

export default PlaidLinkButton;
