/**
 * Payment Screen - Stripe Checkout
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

const FEATURES = [
    'Full facial analysis with 50+ metrics',
    'Personalized improvement plans',
    'Access to all courses',
    'Join TikTok Live events',
    'Track your progress over time',
    'Climb the leaderboard',
    'Chat with Cannon AI',
    'Community forums access',
];

export default function PaymentScreen() {
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const returnUrl = Linking.createURL('/payment-success');
            const cancelUrl = Linking.createURL('/payment-cancel');

            const { checkout_url } = await api.createCheckoutSession(returnUrl, cancelUrl);

            const result = await WebBrowser.openBrowserAsync(checkout_url);

            if (result.type === 'cancel') {
                // User closed browser, check if payment completed
                await refreshUser();
            }
        } catch (error) {
            Alert.alert('Error', 'Could not start checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="diamond" size={48} color={colors.primary} />
                <Text style={styles.title}>Cannon Premium</Text>
                <Text style={styles.subtitle}>Unlock your full potential</Text>
            </View>

            <View style={styles.features}>
                {FEATURES.map((feature, i) => (
                    <View key={i} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.priceCard}>
                <Text style={styles.price}>$9.99</Text>
                <Text style={styles.priceLabel}>/month</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubscribe} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Subscribe Now'}</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>Cancel anytime. No commitment.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    title: { ...typography.h1, marginTop: spacing.md },
    subtitle: { ...typography.bodySmall },
    features: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    featureText: { ...typography.body },
    priceCard: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: spacing.xl },
    price: { fontSize: 48, fontWeight: '800', color: colors.textPrimary },
    priceLabel: { ...typography.h3, color: colors.textMuted },
    button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.xl },
    buttonText: { ...typography.button },
    disclaimer: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
});
