/**
 * Face Scan Screen - Capture 3 photos with Figma design
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../../theme/dark';
import AnalyzingScreen from './AnalyzingScreen';

const PHOTO_STEPS = [
    { key: 'front', label: 'Front View', instruction: 'Look straight at the camera' },
    { key: 'left', label: 'Left Profile', instruction: 'Turn your head to show left side' },
    { key: 'right', label: 'Right Profile', instruction: 'Turn your head to show right side' },
];

export default function FaceScanScreen() {
    const navigation = useNavigation<any>();
    const { isPaid, refreshUser } = useAuth();
    const cameraRef = useRef<CameraView>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [photos, setPhotos] = useState<{ [key: string]: string }>({});
    const [analyzing, setAnalyzing] = useState<boolean>(false);
    const [analysisStep, setAnalysisStep] = useState<number>(0);

    React.useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePhoto = async () => {
        if (!cameraRef.current) return;

        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (!photo) return;

        const step = PHOTO_STEPS[currentStep];
        setPhotos((prev) => ({ ...prev, [step.key]: photo.uri }));

        if (currentStep < PHOTO_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // All photos taken, start analysis
            await uploadPhotos({ ...photos, [step.key]: photo.uri });
        }
    };

    const uploadPhotos = async (allPhotos: { [key: string]: string }) => {
        setAnalyzing(true);
        setAnalysisStep(0);

        try {
            const front = { uri: allPhotos.front, type: 'image/jpeg', name: 'front.jpg' };
            const left = { uri: allPhotos.left, type: 'image/jpeg', name: 'left.jpg' };
            const right = { uri: allPhotos.right, type: 'image/jpeg', name: 'right.jpg' };

            // Step 1: Analysing features
            setAnalysisStep(0);
            const uploadResult = await api.uploadScanImages(front, left, right);

            // Step 2: Calculating potential
            setAnalysisStep(1);
            await api.analyzeScan(uploadResult.scan_id);

            // Step 3: Generating transformation
            setAnalysisStep(2);
            await refreshUser();

            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Route based on payment status
            if (isPaid) {
                navigation.navigate('FullResult');
            } else {
                navigation.navigate('BlurredResult');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to analyze photos');
            setAnalyzing(false);
        }
    };

    // Show analyzing screen during processing
    if (analyzing) {
        return <AnalyzingScreen currentStep={analysisStep} />;
    }

    if (hasPermission === null) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
                <Text style={styles.text}>Requesting camera permission...</Text>
            </LinearGradient>
        );
    }
    if (hasPermission === false) {
        return (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
                <Text style={styles.text}>Camera permission required</Text>
            </LinearGradient>
        );
    }

    const step = PHOTO_STEPS[currentStep];

    return (
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{step.label}</Text>
                <Text style={styles.instruction}>{step.instruction}</Text>
                <View style={styles.progress}>
                    {PHOTO_STEPS.map((_, i) => (
                        <View key={i} style={[styles.progressDot, i <= currentStep && styles.progressDotActive]} />
                    ))}
                </View>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing={"front" as any}>
                    <View style={styles.overlay}>
                        <View style={styles.faceGuide} />
                    </View>
                </CameraView>
            </View>

            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#000000" />
            </TouchableOpacity>

            <Text style={styles.hint}>Photo {currentStep + 1} of 3</Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: spacing.lg, alignItems: 'center' },
    title: { ...typography.h2, color: '#FFFFFF' },
    instruction: { ...typography.bodySmall, marginTop: spacing.xs, color: 'rgba(255,255,255,0.7)' },
    progress: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
    progressDotActive: { backgroundColor: '#FFFFFF' },
    cameraContainer: { flex: 1, margin: spacing.lg, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' },
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    faceGuide: { width: 250, height: 320, borderRadius: 125, borderWidth: 2, borderColor: '#FFFFFF', borderStyle: 'dashed' },
    captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: spacing.lg },
    hint: { ...typography.bodySmall, textAlign: 'center', marginBottom: spacing.xl, color: 'rgba(255,255,255,0.7)' },
    text: { ...typography.body, textAlign: 'center', marginTop: 100, color: '#FFFFFF' },
});

