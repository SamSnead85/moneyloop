import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Account {
    id: string;
    name: string;
    institution: string;
    type: string;
    balance: number;
}

export default function AccountsScreen() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadAccounts = async () => {
        const { data } = await supabase
            .from('accounts')
            .select('*')
            .order('balance', { ascending: false });

        setAccounts(data || []);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccounts();
        setRefreshing(false);
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const getTypeIcon = (type: string): string => {
        switch (type) {
            case 'checking': return 'card-outline';
            case 'savings': return 'wallet-outline';
            case 'credit': return 'card-outline';
            case 'investment': return 'trending-up-outline';
            default: return 'cash-outline';
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7dd3a8" />
            }
        >
            {/* Total Balance */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total Balance</Text>
                <Text style={styles.totalValue}>
                    ${totalBalance.toLocaleString()}
                </Text>
                <Text style={styles.accountCount}>{accounts.length} accounts</Text>
            </View>

            {/* Account List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connected Accounts</Text>

                {accounts.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="wallet-outline" size={48} color="#3f3f46" />
                        <Text style={styles.emptyText}>No accounts linked yet</Text>
                    </View>
                ) : (
                    accounts.map((account) => (
                        <View key={account.id} style={styles.accountCard}>
                            <View style={styles.accountIcon}>
                                <Ionicons name={getTypeIcon(account.type) as any} size={24} color="#7dd3a8" />
                            </View>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>{account.name}</Text>
                                <Text style={styles.accountInstitution}>{account.institution}</Text>
                            </View>
                            <Text style={[
                                styles.accountBalance,
                                account.balance < 0 && styles.negativeBalance,
                            ]}>
                                ${Math.abs(account.balance).toLocaleString()}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#08080c',
        padding: 16,
    },
    totalCard: {
        backgroundColor: '#0f0f12',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a1a1f',
    },
    totalLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    totalValue: {
        fontFamily: 'JetBrainsMono',
        fontSize: 36,
        color: '#fff',
        fontWeight: '700',
    },
    accountCount: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6b7280',
        marginTop: 12,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f12',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#1a1a1f',
    },
    accountIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(125, 211, 168, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#fff',
        marginBottom: 2,
    },
    accountInstitution: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#6b7280',
    },
    accountBalance: {
        fontFamily: 'JetBrainsMono',
        fontSize: 16,
        color: '#7dd3a8',
        fontWeight: '600',
    },
    negativeBalance: {
        color: '#f87171',
    },
});
