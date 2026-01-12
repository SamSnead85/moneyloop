import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
    netWorth: number;
    openTasks: number;
    income: number;
    expenses: number;
}

export default function DashboardScreen() {
    const [stats, setStats] = useState<DashboardStats>({
        netWorth: 0,
        openTasks: 0,
        income: 0,
        expenses: 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        // Fetch account balances for net worth
        const { data: accounts } = await supabase
            .from('accounts')
            .select('balance');

        const netWorth = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

        // Fetch open tasks
        const { count: openTasks } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');

        setStats(prev => ({
            ...prev,
            netWorth,
            openTasks: openTasks || 0,
        }));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7dd3a8" />
            }
        >
            {/* Net Worth Card */}
            <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>Net Worth</Text>
                <Text style={styles.heroValue}>{formatCurrency(stats.netWorth)}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
                        <Text style={{ fontSize: 20 }}>📋</Text>
                    </View>
                    <Text style={styles.statValue}>{stats.openTasks}</Text>
                    <Text style={styles.statLabel}>Open Tasks</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
                        <Text style={{ fontSize: 20 }}>💰</Text>
                    </View>
                    <Text style={[styles.statValue, { color: '#34d399' }]}>
                        {formatCurrency(stats.income)}
                    </Text>
                    <Text style={styles.statLabel}>Income</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
                        <Text style={{ fontSize: 20 }}>📉</Text>
                    </View>
                    <Text style={[styles.statValue, { color: '#f87171' }]}>
                        {formatCurrency(stats.expenses)}
                    </Text>
                    <Text style={styles.statLabel}>Expenses</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>➕</Text>
                        <Text style={styles.actionLabel}>Add Task</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>💳</Text>
                        <Text style={styles.actionLabel}>Add Expense</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>🏦</Text>
                        <Text style={styles.actionLabel}>Link Account</Text>
                    </View>
                </View>
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
    heroCard: {
        backgroundColor: '#0f0f12',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1a1a1f',
    },
    heroLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    heroValue: {
        fontFamily: 'JetBrainsMono',
        fontSize: 36,
        color: '#fff',
        fontWeight: '700',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#0f0f12',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a1a1f',
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontFamily: 'JetBrainsMono',
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 2,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: '#6b7280',
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
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#0f0f12',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a1a1f',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    actionLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#9ca3af',
    },
});
