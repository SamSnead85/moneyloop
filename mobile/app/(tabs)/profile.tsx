import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Profile {
    email: string;
    full_name: string;
    subscription_tier: string;
}

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(data);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Account Settings', route: '/settings/account' },
        { icon: 'notifications-outline', label: 'Notifications', route: '/settings/notifications' },
        { icon: 'people-outline', label: 'Household Members', route: '/settings/members' },
        { icon: 'card-outline', label: 'Subscription', route: '/settings/subscription' },
        { icon: 'shield-outline', label: 'Security', route: '/settings/security' },
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/settings/help' },
    ];

    return (
        <View style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile?.full_name?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>
                        {profile?.subscription_tier?.toUpperCase() || 'FREE'}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menu}>
                {menuItems.map((item) => (
                    <TouchableOpacity key={item.label} style={styles.menuItem}>
                        <Ionicons name={item.icon as any} size={22} color="#7dd3a8" />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#4b5563" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color="#f87171" />
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>MoneyLoop v1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#08080c',
        padding: 16,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#7dd3a8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontFamily: 'Inter-Bold',
        fontSize: 32,
        color: '#08080c',
    },
    name: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 20,
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    tierBadge: {
        backgroundColor: 'rgba(125, 211, 168, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tierText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        color: '#7dd3a8',
    },
    menu: {
        backgroundColor: '#0f0f12',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1a1a1f',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1f',
    },
    menuLabel: {
        flex: 1,
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#fff',
        marginLeft: 12,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    signOutText: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#f87171',
    },
    version: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#4b5563',
        textAlign: 'center',
        marginTop: 24,
    },
});
