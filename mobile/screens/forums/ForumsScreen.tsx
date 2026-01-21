/**
 * Forums Screen - Discord-like channels
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function ForumsScreen() {
    const navigation = useNavigation<any>();
    const [forums, setForums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadForums();
        }, [])
    );

    const loadForums = async () => {
        try {
            setLoading(true);
            const { forums: data } = await api.getForums();
            setForums(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('jawline')) return 'fitness';
        if (lower.includes('skin')) return 'sparkles';
        if (lower.includes('weight') || lower.includes('fat')) return 'body';
        if (lower.includes('announce')) return 'megaphone';
        return 'chatbubbles';
    };

    const renderForum = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.forumCard}
            onPress={() => navigation.navigate('ChannelChat', {
                channelId: item.id,
                channelName: item.name,
                isAdminOnly: item.is_admin_only
            })}
        >
            <View style={styles.forumIcon}>
                <Ionicons name={getIcon(item.name)} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.forumInfo}>
                <Text style={styles.forumName}># {item.name}</Text>
                <Text style={styles.forumDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Channels</Text>
                <Text style={styles.subtitle}>Join the conversation</Text>
            </View>

            <FlatList
                data={forums}
                renderItem={renderForum}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title: { ...typography.h2, color: '#FFFFFF' },
    subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
    list: { padding: spacing.lg },
    forumCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    forumIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    forumInfo: { flex: 1, marginLeft: spacing.md },
    forumName: { ...typography.body, fontWeight: '600', color: '#FFFFFF' },
    forumDesc: { ...typography.caption, marginTop: 2, color: 'rgba(255,255,255,0.6)' },
    forumMeta: { alignItems: 'center' },
    threadCount: { ...typography.h3, color: '#FFFFFF' },
    threadLabel: { ...typography.caption, color: 'rgba(255,255,255,0.5)' },
    separator: { height: spacing.md },
});

