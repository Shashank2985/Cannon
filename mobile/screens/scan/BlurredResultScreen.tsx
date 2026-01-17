/**
 * Blurred Result Screen - Paywall
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import api from '../../services/api';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function BlurredResultScreen() {
    const navigation = useNavigation<any>();
    const [scan, setScan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScan();
    }, []);

    const loadScan = async () => {
        try {
            const result = await api.getLatestScan();
            setScan(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const overallScore = scan?.analysis?.overall_score || scan?.analysis?.metrics?.overall_score || '?';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Scan Complete!</Text>

            <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Your Score</Text>
                <Text style={styles.score}>{overallScore}</Text>
                <Text style={styles.scoreMax}>/10</Text>
            </View>

            <View style={styles.lockedSection}>
                <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    <Text style={styles.lockedText}>Detailed Metrics</Text>
                </View>
                <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    <Text style={styles.lockedText}>Improvement Suggestions</Text>
                </View>
                <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    <Text style={styles.lockedText}>Course Recommendations</Text>
                </View>
                <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    <Text style={styles.lockedText}>Progress Tracking</Text>
                </View>
            </View>

            <View style={styles.unlockCard}>
                <Ionicons name="star" size={32} color={colors.warning} />
                <Text style={styles.unlockTitle}>Unlock Full Results</Text>
                <Text style={styles.unlockDesc}>Get access to detailed analysis, personalized courses, live events, and progress tracking</Text>

                <TouchableOpacity style={styles.unlockButton} onPress={() => navigation.navigate('Payment')}>
                    <Text style={styles.unlockButtonText}>Subscribe Now</Text>
                </TouchableOpacity>

                <Text style={styles.price}>$9.99/month</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingTop: 60 },
    title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xl },
    scoreCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
    scoreLabel: { ...typography.bodySmall },
    score: { fontSize: 80, fontWeight: '800', color: colors.primary, lineHeight: 90 },
    scoreMax: { ...typography.h3, color: colors.textMuted },
    lockedSection: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
    lockedItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: 0.6 },
    lockedText: { ...typography.body },
    unlockCard: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
    unlockTitle: { ...typography.h2, marginTop: spacing.md },
    unlockDesc: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.sm },
    unlockButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
    unlockButtonText: { ...typography.button },
    price: { ...typography.caption, marginTop: spacing.sm },
});
