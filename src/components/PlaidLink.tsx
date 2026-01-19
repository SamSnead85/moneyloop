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

export function PlaidLinkButton({ onSuccess, className, children }: PlaidLinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    // Fetch link token when component mounts or user clicks
    const fetchLinkToken = useCallback(async () => {
        setIsLoading(true);
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
            setConnectionResult({
                success: false,
                message: 'Unable to connect to banking service. Please try again later.',
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
        // Reset any previous error state
        if (connectionResult && !connectionResult.success) {
            setConnectionResult(null);
        }

        if (linkToken && ready) {
            open();
        } else {
            const token = await fetchLinkToken();
            if (token) {
                setTimeout(() => open(), 100);
            }
        }
    };

    if (connectionResult) {
        return (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${connectionResult.success
                ? 'bg-[#34d399]/10 border border-[#34d399]/20'
                : 'bg-red-500/10 border border-red-500/20'
                }`}>
                {connectionResult.success ? (
                    <CheckCircle className="w-5 h-5 text-[#34d399]" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm ${connectionResult.success ? 'text-[#34d399]' : 'text-red-400'}`}>
                    {connectionResult.message}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setConnectionResult(null);
                        setLinkToken(null);
                    }}
                    className="ml-auto text-xs"
                >
                    {connectionResult.success ? 'Connect Another' : 'Try Again'}
                </Button>
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
