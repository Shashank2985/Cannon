/**
 * Profile Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const [scans, setScans] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const scanHistory = await api.getScanHistory().catch(() => ({ scans: [] }));
            setScans(scanHistory.scans || []);
            const rank = await api.getMyRank().catch(() => null);
            setMyRank(rank);
        } catch (error) {
            console.error(error);
        }
    };

    const safeNumber = (val: any, fallback: string = '-'): string => {
        const num = parseFloat(val);
        return isNaN(num) ? fallback : num.toFixed(1);
    };

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color="rgba(255,255,255,0.6)" />
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{safeNumber(user?.profile?.current_level)}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{myRank?.rank !== null ? `#${myRank?.rank}` : '-'}</Text>
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
                    {scans.length > 0 ? scans.map((scan, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.scanItem}
                            onPress={() => navigation.navigate('ScanDetail', { scanId: scan.id })}
                        >
                            <Ionicons name="scan" size={20} color="#FFFFFF" />
                            <View style={styles.scanInfo}>
                                <Text style={styles.scanDate}>{new Date(scan.created_at).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.scanScore}>{safeNumber(scan.overall_score)}</Text>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    )) : (
                        <Text style={styles.emptyText}>No scans yet. Start your first scan!</Text>
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out" size={20} color="#FF4757" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', paddingTop: 80, paddingBottom: spacing.xl },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    email: { ...typography.body, marginTop: spacing.md, color: '#FFFFFF' },
    statsCard: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: '#FFFFFF', borderRadius: borderRadius.lg, padding: spacing.lg },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 28, fontFamily: 'Matter-Medium', fontWeight: '500', color: '#000000' },
    statLabel: { ...typography.caption, marginTop: 4, color: 'rgba(0,0,0,0.5)' },
    divider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
    sectionTitle: { ...typography.h3, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md, color: '#FFFFFF' },
    scanList: { marginHorizontal: spacing.lg, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    scanItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    scanInfo: { flex: 1, marginLeft: spacing.md },
    scanDate: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
    scanScore: { ...typography.h3, color: '#FFFFFF', marginRight: spacing.sm },
    emptyText: { ...typography.bodySmall, color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: spacing.lg },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.xxl, gap: spacing.sm },
    logoutText: { ...typography.body, color: '#FF4757' },
});

