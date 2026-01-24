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
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/dark';

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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header Section - Separated from content */}
                <View style={styles.headerSection}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>Welcome back</Text>
                            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.profileIconContainer}>
                                <Ionicons name="person" size={28} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Card - Live Events + Courses Combined */}
                <View style={styles.mainCard}>
                    {/* Live Events Section */}
                    <TouchableOpacity
                        style={styles.liveEventsHeader}
                        activeOpacity={0.8}
                    >
                        <View style={styles.sectionTitleRow}>
                            <View style={styles.sectionIconBox}>
                                <Ionicons name="calendar" size={20} color={colors.primaryLight} />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Live Events</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {events.length > 0 ? `${events.length} events available` : 'No live events'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    {/* Course Progress Items */}
                    {progress.map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.courseItem}
                            onPress={() => navigation.navigate('CourseDetail', { courseId: p.course_id })}
                            activeOpacity={0.8}
                        >
                            <View style={styles.courseIconBox}>
                                <Ionicons
                                    name={i % 2 === 0 ? "book" : "water"}
                                    size={20}
                                    color={colors.primaryLight}
                                />
                            </View>
                            <View style={styles.courseContent}>
                                <View style={styles.courseTextRow}>
                                    <Text style={styles.courseTitle} numberOfLines={1}>
                                        {p.course_title || 'Course'}
                                    </Text>
                                    <Text style={styles.coursePercent}>{Math.round(p.progress_percentage)}%</Text>
                                </View>
                                <View style={styles.progressBarSmall}>
                                    <View style={[styles.progressFillSmall, { width: `${p.progress_percentage}%` }]} />
                                </View>
                                <View style={styles.continueRow}>
                                    <Text style={styles.continueText}>Continue</Text>
                                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.6)" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Empty state for courses if none */}
                    {progress.length === 0 && (
                        <TouchableOpacity
                            style={styles.courseItem}
                            onPress={() => navigation.navigate('CourseList')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.courseIconBox}>
                                <Ionicons name="book" size={20} color={colors.primaryLight} />
                            </View>
                            <View style={styles.courseContent}>
                                <Text style={styles.courseTitle}>No courses started</Text>
                                <Text style={styles.sectionSubtitle}>Tap to browse courses</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Start another course button */}
                    <TouchableOpacity
                        style={styles.addCourseButton}
                        onPress={() => navigation.navigate('CourseList')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={18} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.addCourseText}>Start another course</Text>
                    </TouchableOpacity>
                </View>

                {/* Upcoming Events Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionCardHeader}>
                        <Text style={styles.cardSectionTitle}>Upcoming Events</Text>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                    </View>

                    {events.length > 0 ? (
                        events.slice(0, 3).map((event, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.eventListItem}
                                onPress={() => openTikTok(event.tiktok_link)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.eventListTitle} numberOfLines={1}>{event.title}</Text>
                                <Text style={styles.eventListDate}>
                                    {new Date(event.scheduled_at).toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateSmall}>
                            <Text style={styles.emptyStateText}>No upcoming events</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions Card */}
                <View style={styles.sectionCard}>
                    <Text style={styles.cardSectionTitle}>Quick Actions</Text>

                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('FaceScan')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="scan-outline" size={28} color={colors.primaryLight} />
                            <Text style={styles.quickActionText}>New Scan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('Chat')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chatbubble-outline" size={28} color={colors.primaryLight} />
                            <Text style={styles.quickActionText}>AI Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('Rank')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="trophy-outline" size={28} color={colors.primaryLight} />
                            <Text style={styles.quickActionText}>Rankings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },

    // Header Section
    headerSection: {
        paddingHorizontal: spacing.lg,
        paddingTop: 56,
        paddingBottom: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
        fontFamily: 'Matter-Regular',
    },
    userName: {
        fontSize: 26,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Matter-Medium',
    },
    profileButton: {
        padding: 4,
    },
    profileIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },

    // Main Card
    mainCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
    },

    // Live Events Header
    liveEventsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sectionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Matter-Medium',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        fontFamily: 'Matter-Regular',
    },

    // Course Items
    courseItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        gap: spacing.sm,
    },
    courseIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    courseContent: {
        flex: 1,
    },
    courseTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    courseTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFFFFF',
        flex: 1,
        marginRight: spacing.sm,
        fontFamily: 'Matter-Medium',
    },
    coursePercent: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Matter-Medium',
    },
    progressBarSmall: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFillSmall: {
        height: '100%',
        backgroundColor: colors.primaryLight,
        borderRadius: 2,
    },
    continueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    continueText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Matter-Regular',
    },

    // Add Course Button
    addCourseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        margin: spacing.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: borderRadius.lg,
        borderStyle: 'dashed',
        gap: spacing.xs,
    },
    addCourseText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Matter-Medium',
    },

    // Section Cards (Upcoming Events, Quick Actions)
    sectionCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: spacing.md,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Matter-Medium',
    },

    // Event List Items
    eventListItem: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginTop: spacing.xs,
    },
    eventListTitle: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        marginBottom: 2,
        fontFamily: 'Matter-Medium',
    },
    eventListDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Matter-Regular',
    },

    // Empty State
    emptyStateSmall: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Matter-Regular',
    },

    // Quick Actions
    quickActionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    quickActionText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.sm,
        fontFamily: 'Matter-Medium',
    },
});
