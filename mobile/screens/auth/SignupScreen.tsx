/**
 * Signup Screen
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';

export default function SignupScreen() {
    const navigation = useNavigation<any>();
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
        } catch (error: any) {
            Alert.alert('Signup Failed', error.response?.data?.detail || 'Could not create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.content}>
                <Text style={styles.logo}>CANNON</Text>
                <Text style={styles.subtitle}>Create Your Account</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={colors.textMuted}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkHighlight}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
    logo: { fontSize: 48, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: 8 },
    subtitle: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
    form: { gap: spacing.md },
    input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
    button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    buttonText: { ...typography.button },
    linkText: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.xl },
    linkHighlight: { color: colors.primary, fontWeight: '600' },
});
