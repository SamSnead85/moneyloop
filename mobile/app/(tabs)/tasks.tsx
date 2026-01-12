import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Task {
    id: string;
    title: string;
    type: string;
    priority: 'signal' | 'noise';
    status: string;
    due_date: string | null;
    amount: number | null;
    claimed_by: string | null;
}

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'all' | 'open' | 'mine'>('open');
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = async () => {
        let query = supabase
            .from('tasks')
            .select('*')
            .order('due_date', { ascending: true });

        if (filter === 'open') {
            query = query.eq('status', 'open');
        }

        const { data } = await query;
        setTasks(data || []);
    };

    const claimTask = async (taskId: string) => {
        await supabase.rpc('claim_task', { task_id: taskId });
        loadTasks();
    };

    const completeTask = async (taskId: string) => {
        await supabase.rpc('complete_task', { task_id: taskId });
        loadTasks();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTasks();
        setRefreshing(false);
    };

    useEffect(() => {
        loadTasks();
    }, [filter]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bill': return 'card-outline';
            case 'goal': return 'flag-outline';
            case 'reminder': return 'alarm-outline';
            default: return 'checkbox-outline';
        }
    };

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={styles.filters}>
                {(['all', 'open', 'mine'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Task List */}
            <ScrollView
                style={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7dd3a8" />
                }
            >
                {tasks.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="checkbox-outline" size={48} color="#3f3f46" />
                        <Text style={styles.emptyText}>No tasks found</Text>
                    </View>
                ) : (
                    tasks.map((task) => (
                        <View
                            key={task.id}
                            style={[
                                styles.taskCard,
                                task.priority === 'signal' && styles.signalCard,
                            ]}
                        >
                            <View style={styles.taskHeader}>
                                <View style={styles.taskIconContainer}>
                                    <Ionicons
                                        name={getTypeIcon(task.type) as any}
                                        size={20}
                                        color={task.priority === 'signal' ? '#fbbf24' : '#6b7280'}
                                    />
                                </View>
                                <View style={styles.taskInfo}>
                                    {task.priority === 'signal' && (
                                        <View style={styles.signalBadge}>
                                            <Text style={styles.signalText}>SIGNAL</Text>
                                        </View>
                                    )}
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <View style={styles.taskMeta}>
                                        {task.due_date && (
                                            <Text style={styles.taskDate}>{formatDate(task.due_date)}</Text>
                                        )}
                                        {task.amount && (
                                            <Text style={styles.taskAmount}>
                                                ${task.amount.toLocaleString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={styles.taskActions}>
                                {task.status === 'open' && !task.claimed_by && (
                                    <TouchableOpacity
                                        style={styles.claimButton}
                                        onPress={() => claimTask(task.id)}
                                    >
                                        <Ionicons name="hand-left-outline" size={16} color="#3b82f6" />
                                        <Text style={styles.claimText}>Claim</Text>
                                    </TouchableOpacity>
                                )}
                                {task.claimed_by && task.status !== 'completed' && (
                                    <TouchableOpacity
                                        style={styles.completeButton}
                                        onPress={() => completeTask(task.id)}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                                        <Text style={styles.completeText}>Complete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#08080c',
    },
    filters: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a1f',
    },
    filterButtonActive: {
        backgroundColor: '#7dd3a8',
    },
    filterText: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: '#9ca3af',
    },
    filterTextActive: {
        color: '#08080c',
    },
    list: {
        flex: 1,
        paddingHorizontal: 16,
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6b7280',
        marginTop: 12,
    },
    taskCard: {
        backgroundColor: '#0f0f12',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1a1a1f',
    },
    signalCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#fbbf24',
    },
    taskHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    taskIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#1a1a1f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskInfo: {
        flex: 1,
    },
    signalBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    signalText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 9,
        color: '#fbbf24',
    },
    taskTitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#fff',
        marginBottom: 4,
    },
    taskMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    taskDate: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#6b7280',
    },
    taskAmount: {
        fontFamily: 'JetBrainsMono',
        fontSize: 12,
        color: '#9ca3af',
    },
    taskActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 8,
    },
    claimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    claimText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#3b82f6',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    completeText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#10b981',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#7dd3a8',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7dd3a8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
