import axios from 'axios'

// Demo Mine Coordinates (11°06'08"N 79°09'23"E)
const LAT = 11.1022
const LNG = 79.1564

export const weatherService = {
    async getCurrentWeather() {
        try {
            console.log('[Weather Service] Fetching weather data...')

            // Using Open-Meteo API - Completely FREE, No API key needed
            // Docs: https://open-meteo.com/en/docs  
            const response = await axios.get(
                `https://api.open-meteo.com/v1/forecast`,
                {
                    params: {
                        latitude: LAT,
                        longitude: LNG,
                        current: 'temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m',
                        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
                        timezone: 'auto'
                    },
                    timeout: 15000, // 15 second timeout
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'GeoGuard-Mobile/1.0'
                    }
                }
            )

            console.log('[Weather Service] API Response:', JSON.stringify(response.data).substring(0, 200))

            const current = response.data.current
            const daily = response.data.daily || {}

            if (!current || !current.temperature_2m) {
                throw new Error('Invalid API response structure')
            }

            const weatherData = {
                temp: `${Math.round(current.temperature_2m)}°C`,
                tempValue: Math.round(current.temperature_2m),
                humidity: `${current.relative_humidity_2m}%`,
                humidityValue: current.relative_humidity_2m,
                wind: `${current.wind_speed_10m} m/s`,
                windValue: current.wind_speed_10m,
                rain: `${current.rain || 0} mm`,
                rainValue: current.rain || 0,
                precipitation: `${current.precipitation || 0} mm`,
                description: current.rain > 0 ? 'Rainy' : 'Clear',
                dataSource: 'OPEN_METEO',
                forecast: daily.time ? daily.time.slice(0, 7).map((time, index) => ({
                    day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
                    date: time,
                    tempMax: Math.round(daily.temperature_2m_max[index]),
                    tempMin: Math.round(daily.temperature_2m_min[index]),
                    temp: `${Math.round(daily.temperature_2m_max[index])}°C`,
                    precipitation: daily.precipitation_sum[index],
                    rain: daily.precipitation_sum[index] > 0,
                    icon: daily.precipitation_sum[index] > 2 ? 'rain' : daily.precipitation_sum[index] > 0 ? 'cloud' : 'sun'
                })) : []
            }

            console.log('[Weather Service] Successfully parsed weather data')
            return weatherData

        } catch (error) {
            // Silent fallback on network errors (expected on emulator)
            console.log('[Weather Service] Using simulation data (network unavailable)')

            // Fallback to realistic simulation data if API fails
            return {
                temp: '28°C',
                tempValue: 28,
                humidity: '65%',
                humidityValue: 65,
                wind: '3.5 m/s',
                windValue: 3.5,
                rain: '0 mm',
                rainValue: 0,
                precipitation: '0 mm',
                description: 'Clear (Simulated - API Error)',
                dataSource: 'SIMULATION',
                forecast: Array.from({ length: 7 }, (_, i) => ({
                    day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
                    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                    tempMax: 28 + Math.floor(Math.random() * 5),
                    tempMin: 20 + Math.floor(Math.random() * 3),
                    temp: `${28 + Math.floor(Math.random() * 5)}°C`,
                    precipitation: Math.random() * 10,
                    rain: Math.random() > 0.7,
                    icon: Math.random() > 0.7 ? 'rain' : 'sun'
                }))
            }
        }
    }
}
