/**
 * Leaderboard Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function LeaderboardScreen() {
    const [entries, setEntries] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const [leaderboard, rank] = await Promise.all([
                api.getLeaderboard(),
                api.getMyRank(),
            ]);
            setEntries(leaderboard.entries || []);
            setMyRank(rank);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return { name: 'trophy', color: '#FFD700' };
        if (rank === 2) return { name: 'medal', color: '#C0C0C0' };
        if (rank === 3) return { name: 'medal', color: '#CD7F32' };
        return null;
    };

    const renderEntry = ({ item, index }: { item: any; index: number }) => {
        const icon = getRankIcon(item.rank);
        return (
            <View style={[styles.entryCard, index < 3 && styles.topThree]}>
                <View style={styles.rankContainer}>
                    {icon ? (
                        <Ionicons name={icon.name as any} size={24} color={icon.color} />
                    ) : (
                        <Text style={styles.rankNumber}>{item.rank}</Text>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user_email}</Text>
                    <Text style={styles.userLevel}>Level {item.level?.toFixed(1)}</Text>
                </View>
                <View style={styles.stats}>
                    <Text style={styles.score}>{Math.round(item.score)}</Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Leaderboard</Text>
                <Text style={styles.subtitle}>Top performers</Text>
            </View>

            {myRank && (
                <View style={styles.myRankCard}>
                    <Text style={styles.myRankLabel}>Your Rank</Text>
                    <Text style={styles.myRankValue}>#{myRank.rank || '?'} / {myRank.total_users}</Text>
                    <View style={styles.myStats}>
                        <View style={styles.myStat}>
                            <Text style={styles.myStatValue}>{myRank.level?.toFixed(1) || '0'}</Text>
                            <Text style={styles.myStatLabel}>Level</Text>
                        </View>
                        <View style={styles.myStat}>
                            <Text style={styles.myStatValue}>{myRank.streak_days || 0}</Text>
                            <Text style={styles.myStatLabel}>Streak</Text>
                        </View>
                        <View style={styles.myStat}>
                            <Text style={styles.myStatValue}>{myRank.improvement_percentage?.toFixed(0) || 0}%</Text>
                            <Text style={styles.myStatLabel}>Improve</Text>
                        </View>
                    </View>
                </View>
            )}

            <FlatList
                data={entries}
                renderItem={renderEntry}
                keyExtractor={(item) => item.user_id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title: { ...typography.h2 },
    subtitle: { ...typography.caption },
    myRankCard: { marginHorizontal: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
    myRankLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
    myRankValue: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
    myStats: { flexDirection: 'row', marginTop: spacing.md, justifyContent: 'space-around' },
    myStat: { alignItems: 'center' },
    myStatValue: { ...typography.h3, color: colors.textPrimary },
    myStatLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
    list: { padding: spacing.lg, paddingTop: 0 },
    entryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
    topThree: { borderWidth: 1, borderColor: colors.primary },
    rankContainer: { width: 40, alignItems: 'center' },
    rankNumber: { ...typography.h3, color: colors.textMuted },
    userInfo: { flex: 1, marginLeft: spacing.md },
    userName: { ...typography.body },
    userLevel: { ...typography.caption },
    stats: { alignItems: 'flex-end' },
    score: { ...typography.h3, color: colors.primary },
    scoreLabel: { ...typography.caption },
});
