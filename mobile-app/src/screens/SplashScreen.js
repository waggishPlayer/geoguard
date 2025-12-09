import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

export default function SplashScreen({ onFinish }) {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current
    const scaleAnim = useRef(new Animated.Value(0.8)).current

    useEffect(() => {
        // Sequential animations
        Animated.sequence([
            // Fade in and slide up
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true
                })
            ]),
            // Hold for a moment
            Animated.delay(1500),
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            })
        ]).start(() => {
            if (onFinish) onFinish()
        })
    }, [])

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#334155']}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                {/* Main Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>GeoGuard</Text>
                    <Text style={styles.subtitle}>Intelligent Mine Safety System</Text>
                </View>

                {/* Event Badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>SIH 2025</Text>
                </View>

                {/* Team Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.teamName}>Team Zenwaare</Text>
                    <View style={styles.divider} />
                    <Text style={styles.ministry}>Ministry of Mines</Text>
                    <Text style={styles.govtIndia}>Government of India</Text>
                </View>

                {/* Decorative Elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
            </Animated.View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 40
    },
    mainTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 2,
        textShadowColor: 'rgba(59, 130, 246, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 8,
        letterSpacing: 1
    },
    badge: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#3b82f6',
        marginBottom: 50
    },
    badgeText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3b82f6',
        letterSpacing: 2
    },
    infoContainer: {
        alignItems: 'center'
    },
    teamName: {
        fontSize: 22,
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: 12
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#475569',
        marginVertical: 12
    },
    ministry: {
        fontSize: 18,
        fontWeight: '500',
        color: '#cbd5e1',
        marginBottom: 4
    },
    govtIndia: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic'
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        top: -100,
        right: -100
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(147, 51, 234, 0.05)',
        bottom: -50,
        left: -50
    }
})
