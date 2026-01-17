/**
 * Dark Theme Configuration
 */

export const colors = {
    // Backgrounds
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceLight: '#252525',
    card: '#1E1E1E',

    // Primary accent
    primary: '#6C5CE7',
    primaryLight: '#8B7CF7',
    primaryDark: '#5A4BD1',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',

    // Status
    success: '#00D26A',
    warning: '#FFB800',
    error: '#FF4757',
    info: '#3498DB',

    // UI Elements
    border: '#2D2D2D',
    borderLight: '#3D3D3D',
    divider: '#252525',

    // Gradients
    gradientStart: '#6C5CE7',
    gradientEnd: '#A29BFE',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    blur: 'rgba(13, 13, 13, 0.9)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: colors.textPrimary,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: colors.textPrimary,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        color: colors.textMuted,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
