/**
 * Profile Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [scans, setScans] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [scanHistory, rank] = await Promise.all([
                api.getScanHistory(),
                api.getMyRank(),
            ]);
            setScans(scanHistory.scans || []);
            setMyRank(rank);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color={colors.textMuted} />
                </View>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.profile?.current_level?.toFixed(1) || '?'}</Text>
                    <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>#{myRank?.rank || '?'}</Text>
                    <Text style={styles.statLabel}>Rank</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{scans.length}</Text>
                    <Text style={styles.statLabel}>Scans</Text>
                </View>
            </View>

            {/* Scan History */}
            <Text style={styles.sectionTitle}>Scan History</Text>
            <View style={styles.scanList}>
                {scans.map((scan, i) => (
                    <View key={i} style={styles.scanItem}>
                        <Ionicons name="scan" size={20} color={colors.primary} />
                        <View style={styles.scanInfo}>
                            <Text style={styles.scanDate}>{new Date(scan.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.scanScore}>{scan.overall_score?.toFixed(1) || '?'}</Text>
                    </View>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out" size={20} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { alignItems: 'center', paddingTop: 80, paddingBottom: spacing.xl },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
    email: { ...typography.body, marginTop: spacing.md },
    statsCard: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
    statLabel: { ...typography.caption, marginTop: 4 },
    divider: { width: 1, backgroundColor: colors.border },
    sectionTitle: { ...typography.h3, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
    scanList: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md },
    scanItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    scanInfo: { flex: 1, marginLeft: spacing.md },
    scanDate: { ...typography.bodySmall },
    scanScore: { ...typography.h3, color: colors.primary },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.xxl, gap: spacing.sm },
    logoutText: { ...typography.body, color: colors.error },
});
