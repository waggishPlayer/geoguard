import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit'
import { COLORS } from '../utils/constants'

const screenWidth = Dimensions.get('window').width

const WeatherCharts = ({ weatherData }) => {
    if (!weatherData || !weatherData.forecast || weatherData.forecast.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noData}>Weather data unavailable</Text>
            </View>
        )
    }

    const forecast = weatherData.forecast

    // Chart 1: Temperature Trend (Line Chart)
    const tempData = {
        labels: forecast.map(f => f.day),
        datasets: [
            {
                data: forecast.map(f => f.tempMax),
                color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, // Orange for max
                strokeWidth: 2
            },
            {
                data: forecast.map(f => f.tempMin),
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for min
                strokeWidth: 2
            }
        ],
        legend: ['Max Temp', 'Min Temp']
    }

    // Chart 2: Precipitation Bar Chart
    const precipData = {
        labels: forecast.map(f => f.day),
        datasets: [
            {
                data: forecast.map(f => f.precipitation || 0)
            }
        ]
    }

    // Chart 3: Current Conditions (Progress/Radial Chart)
    const currentData = {
        labels: ['Humidity', 'Wind'],
        data: [
            (weatherData.humidityValue || 0) / 100,
            Math.min((weatherData.windValue || 0) / 20, 1) // Normalize to 0-1 (max 20 m/s)
        ],
        colors: [COLORS.primary, COLORS.success]
    }

    const chartConfig = {
        backgroundColor: COLORS.background,
        backgroundGradientFrom: COLORS.cardBackground,
        backgroundGradientTo: COLORS.cardBackground,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary
        }
    }

    return (
        <View style={styles.container}>
            {/* Chart 1: Temperature Trend */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>📈 7-Day Temperature Forecast</Text>
                <LineChart
                    data={tempData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    fromZero
                />
            </View>

            {/* Chart 2: Precipitation */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>🌧️ Precipitation Forecast (mm)</Text>
                <BarChart
                    data={precipData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`
                    }}
                    style={styles.chart}
                    fromZero
                />
            </View>

            {/* Chart 3: Current Conditions */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>💨 Current Conditions</Text>
                <ProgressChart
                    data={currentData}
                    width={screenWidth - 40}
                    height={220}
                    strokeWidth={16}
                    radius={32}
                    chartConfig={chartConfig}
                    hideLegend={false}
                    style={styles.chart}
                />
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                        <Text style={styles.legendText}>Humidity: {weatherData.humidity}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                        <Text style={styles.legendText}>Wind: {weatherData.wind}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 20
    },
    chartCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6
    },
    legendText: {
        color: COLORS.text,
        fontSize: 14
    },
    noData: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        padding: 20
    }
})

export default WeatherCharts
