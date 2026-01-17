/**
 * Root Navigator - Auth flow control
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/dark';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import FeaturesIntroScreen from '../screens/onboarding/FeaturesIntroScreen';
import FaceScanScreen from '../screens/scan/FaceScanScreen';
import BlurredResultScreen from '../screens/scan/BlurredResultScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
    const { user, isLoading, isAuthenticated, isPaid } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                // Auth screens
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : !user?.onboarding?.completed ? (
                // Onboarding flow
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="FeaturesIntro" component={FeaturesIntroScreen} />
                </>
            ) : !user?.first_scan_completed ? (
                // First scan flow
                <>
                    <Stack.Screen name="FaceScan" component={FaceScanScreen} />
                    <Stack.Screen name="BlurredResult" component={BlurredResultScreen} />
                    <Stack.Screen name="Payment" component={PaymentScreen} />
                </>
            ) : !isPaid ? (
                // Blocked until payment
                <>
                    <Stack.Screen name="BlurredResult" component={BlurredResultScreen} />
                    <Stack.Screen name="Payment" component={PaymentScreen} />
                </>
            ) : (
                // Main app
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen name="FaceScan" component={FaceScanScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default RootNavigator;
