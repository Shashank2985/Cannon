/**
 * Tab Navigator - Bottom tabs for main app
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/dark';
import { useNavigation } from '@react-navigation/native';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import CannonChatScreen from '../screens/chat/CannonChatScreen';
import ForumsScreen from '../screens/forums/ForumsScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function ScanButton() {
    const navigation = useNavigation<any>();

    return (
        <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('FaceScan')}
        >
            <Ionicons name="add" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
    );
}

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Chat"
                component={CannonChatScreen}
                options={{
                    tabBarLabel: 'Cannon',
                    tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Scan"
                component={View}
                options={{
                    tabBarButton: () => <ScanButton />,
                }}
            />
            <Tab.Screen
                name="Forums"
                component={ForumsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Rank"
                component={LeaderboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 85,
        paddingBottom: spacing.md,
        paddingTop: spacing.sm,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    scanButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
