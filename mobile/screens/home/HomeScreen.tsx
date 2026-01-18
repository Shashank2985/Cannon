/**
 * Home Screen - Main dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [progress, setProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [eventsRes, progressRes] = await Promise.all([
                api.getEvents(),
                api.getCourseProgress(),
            ]);
            setEvents(eventsRes.events || []);
            setProgress(progressRes.progress || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openTikTok = (link: string) => {
        Linking.openURL(link);
    };

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back</Text>
                        <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle" size={40} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Live Events Carousel */}
                <Text style={styles.sectionTitle}>🔴 Live Events</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                    {events.slice(0, 5).map((event, i) => (
                        <TouchableOpacity key={i} style={styles.eventCard} onPress={() => openTikTok(event.tiktok_link)}>
                            <View style={styles.eventBadge}><Text style={styles.eventBadgeText}>LIVE</Text></View>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventTime}>{new Date(event.scheduled_at).toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Current Progress */}
                <Text style={styles.sectionTitle}>📚 Your Courses</Text>
                {progress.length > 0 ? (
                    <View>
                        {progress.map((p, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.progressCard}
                                onPress={() => navigation.navigate('CourseDetail', { courseId: p.course_id })}
                            >
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressTitle}>Course Progress</Text>
                                    <Text style={styles.progressPercent}>{Math.round(p.progress_percentage)}%</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${p.progress_percentage}%` }]} />
                                </View>
                                <Text style={styles.cardCaption}>{p.course_title || 'Continue Learning'}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('CourseList')}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.secondaryButtonText}>Start another course</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.emptyCard}
                        onPress={() => navigation.navigate('CourseList')}
                    >
                        <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                        <Text style={styles.emptyText}>Start a course</Text>
                    </TouchableOpacity>
                )}

                {/* Calendar Preview */}
                <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
                <View style={styles.calendarCard}>
                    {events.slice(0, 3).map((event, i) => (
                        <View key={i} style={styles.calendarItem}>
                            <Text style={styles.calendarDate}>{new Date(event.scheduled_at).toLocaleDateString()}</Text>
                            <Text style={styles.calendarTitle}>{event.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FaceScan')}>
                        <Ionicons name="scan" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>New Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Chat')}>
                        <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Rank')}>
                        <Ionicons name="trophy" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>Rank</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: 60 },
    greeting: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
    userName: { ...typography.h2, color: '#FFFFFF' },
    sectionTitle: { ...typography.h3, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md, color: '#FFFFFF' },
    carousel: { paddingLeft: spacing.lg },
    eventCard: { width: 200, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, marginRight: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    eventBadge: { backgroundColor: '#FF4757', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
    eventBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    eventTitle: { ...typography.body, marginTop: spacing.sm, color: '#FFFFFF' },
    eventTime: { ...typography.caption, marginTop: spacing.xs, color: 'rgba(255,255,255,0.6)' },
    progressCard: { marginHorizontal: spacing.lg, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    progressTitle: { ...typography.body, color: '#FFFFFF' },
    progressPercent: { ...typography.body, color: '#FFFFFF', fontWeight: '700' },
    progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: spacing.sm },
    progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
    cardCaption: { ...typography.caption, marginTop: 8, color: 'rgba(255,255,255,0.6)' },
    emptyCard: { marginHorizontal: spacing.lg, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
    emptyText: { ...typography.bodySmall, marginTop: spacing.sm, color: 'rgba(255,255,255,0.7)' },
    calendarCard: { marginHorizontal: spacing.lg, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    calendarItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    calendarDate: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
    calendarTitle: { ...typography.bodySmall, color: '#FFFFFF' },
    actionsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.xxl },
    actionCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    actionText: { ...typography.caption, marginTop: spacing.xs, color: 'rgba(255,255,255,0.7)' },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: borderRadius.md, borderStyle: 'dashed' },
    secondaryButtonText: { ...typography.button, color: '#FFFFFF', marginLeft: spacing.sm }
});

