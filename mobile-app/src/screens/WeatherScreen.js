import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { weatherService } from '../services/weather'
import WeatherCharts from '../components/WeatherCharts'
import { COLORS } from '../utils/constants'

export default function WeatherScreen() {
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadWeather()
    }, [])

    const loadWeather = async () => {
        try {
            setLoading(true)
            const data = await weatherService.getCurrentWeather()
            setWeatherData(data)
        } catch (error) {
            console.error('Failed to load weather', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadWeather()
        setRefreshing(false)
    }

    if (loading && !weatherData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading weather data...</Text>
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Current Weather Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.title}>📍 Demo Mine Weather</Text>
                <Text style={styles.subtitle}>11°06'08"N 79°09'23"E</Text>

                <View style={styles.currentConditions}>
                    <Text style={styles.tempLarge}>{weatherData?.temp || '--'}</Text>
                    <Text style={styles.description}>{weatherData?.description || 'Loading...'}</Text>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>💧 Humidity</Text>
                        <Text style={styles.detailValue}>{weatherData?.humidity || '--'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>💨 Wind</Text>
                        <Text style={styles.detailValue}>{weatherData?.wind || '--'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>🌧️ Rain</Text>
                        <Text style={styles.detailValue}>{weatherData?.rain || '--'}</Text>
                    </View>
                </View>
            </View>

            {/* Weather Charts */}
            <WeatherCharts weatherData={weatherData} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background
    },
    loadingText: {
        color: COLORS.text,
        marginTop: 12
    },
    summaryCard: {
        backgroundColor: COLORS.cardBackground,
        margin: 16,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20
    },
    currentConditions: {
        alignItems: 'center',
        marginBottom: 20
    },
    tempLarge: {
        fontSize: 64,
        fontWeight: 'bold',
        color: COLORS.text
    },
    description: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textTransform: 'capitalize'
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },
    detailItem: {
        alignItems: 'center'
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text
    }
})
