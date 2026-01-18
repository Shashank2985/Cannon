/**
 * Cannon Chat Screen - LLM Chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function CannonChatScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const { messages: history } = await api.getChatHistory();
            setMessages(history || []);
        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const { response } = await api.sendChatMessage(userMessage);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.content}</Text>
        </View>
    );

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cannon</Text>
                    <Text style={styles.subtitle}>Your Lookmaxxing Coach</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask Cannon anything..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
                        <Ionicons name={loading ? 'hourglass' : 'send'} size={24} color="#000000" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    title: { ...typography.h2, color: '#FFFFFF' },
    subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
    messageList: { padding: spacing.lg },
    messageBubble: { maxWidth: '80%', padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#FFFFFF' },
    assistantBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)' },
    messageText: { ...typography.body, color: '#FFFFFF' },
    userMessageText: { color: '#000000' },
    inputContainer: { flexDirection: 'row', padding: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.md, padding: spacing.md, color: '#FFFFFF', maxHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
});

