/**
 * Channel Chat Screen - Discord-like chat interface
 * Messages appear in chronological order with auto-scroll to bottom
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

interface Message {
    id: string;
    channel_id: string;
    user_id: string;
    user_email: string;
    content: string;
    created_at: string;
    is_admin: boolean;
}

export default function ChannelChatScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { channelId, channelName, isAdminOnly } = route.params;
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const isAdmin = (user as any)?.is_admin || false;
    const canPost = !isAdminOnly || isAdmin;

    useFocusEffect(
        useCallback(() => {
            loadMessages();
            // Poll for new messages every 5 seconds
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }, [channelId])
    );

    const loadMessages = async () => {
        try {
            const data = await api.getChannelMessages(channelId);
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || sending) return;
        setSending(true);
        try {
            const result = await api.sendChannelMessage(channelId, messageText.trim());
            if (result.message) {
                setMessages(prev => [...prev, result.message]);
            }
            setMessageText('');
            // Scroll to bottom after sending
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showHeader = !prevMessage || prevMessage.user_id !== item.user_id;

        return (
            <View style={styles.messageContainer}>
                {showHeader && (
                    <View style={styles.messageHeader}>
                        <Text style={[styles.userName, item.is_admin && styles.adminName]}>
                            {item.user_email}
                            {item.is_admin && <Text style={styles.adminBadge}> ADMIN</Text>}
                        </Text>
                        <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
                    </View>
                )}
                <Text style={styles.messageContent}>{item.content}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.channelName}># {channelName}</Text>
                        {isAdminOnly && <Text style={styles.adminOnlyTag}>Admin Only</Text>}
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Be the first to say something!</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />

                {/* Input Bar */}
                {canPost ? (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Message #${channelName}`}
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={sending || !messageText.trim()}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <Ionicons name="send" size={20} color="#000" />
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.readOnlyBar}>
                        <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.readOnlyText}>Only admins can post in this channel</Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    keyboardView: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: 60,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    backButton: { padding: spacing.xs },
    headerCenter: { flex: 1, alignItems: 'center' },
    channelName: { ...typography.h3, color: '#FFFFFF' },
    adminOnlyTag: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    messagesList: { padding: spacing.md, flexGrow: 1 },
    messageContainer: { marginBottom: spacing.sm },
    messageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    userName: { ...typography.bodySmall, fontWeight: '700', color: '#FFFFFF' },
    adminName: { color: '#FFD700' },
    adminBadge: { fontSize: 10, color: '#FFD700', fontWeight: '500' },
    messageTime: { ...typography.caption, color: 'rgba(255,255,255,0.4)', marginLeft: spacing.sm, fontSize: 10 },
    messageContent: { ...typography.body, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    emptyText: { ...typography.body, color: 'rgba(255,255,255,0.5)', marginTop: spacing.md },
    emptySubtext: { ...typography.caption, color: 'rgba(255,255,255,0.3)' },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'flex-end'
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        color: '#FFFFFF',
        maxHeight: 100,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sendButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.3)' },
    readOnlyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        gap: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    readOnlyText: { ...typography.bodySmall, color: 'rgba(255,255,255,0.5)' },
});
