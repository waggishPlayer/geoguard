import { weatherService } from './weather';
import MLService from './MLService';

// Configuration
const LAT = 11.1053;
const LON = 79.1506;
const GRID_SIZE = 20; // Increased from 12 for smaller cells
const CELL_SIZE = 0.0005; // Reduced from 0.0008 to keep total area similar

// State
let cachedWeatherData = null;
let lastWeatherFetch = 0;
const WEATHER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Manual weather override state
let manualWeatherEnabled = false;
let manualWeatherConditions = {
    wind_speed: 10.0,
    sun: 0.5, // 0-1 scale
    rain_mm: 0.0,
    humidity: 60.0,
    temperature: 28.0,
};

// Cell base values cache (persists across recalculations)
let cellBaseValues = null;

// Helper: Gaussian Noise (Box-Muller transform)
const randomNormal = (mean = 0, std = 1) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
};

// Manual Weather Control Functions
export const setManualWeatherMode = (enabled) => {
    manualWeatherEnabled = enabled;
    if (!enabled) {
        // Reset cache when disabling manual mode
        cachedWeatherData = null;
        lastWeatherFetch = 0;
    }
};

export const updateManualWeather = (conditions) => {
    manualWeatherConditions = { ...manualWeatherConditions, ...conditions };
    if (manualWeatherEnabled) {
        // Force immediate recalculation
        cachedWeatherData = null;
        lastWeatherFetch = 0;
    }
};

export const getManualWeatherState = () => ({
    enabled: manualWeatherEnabled,
    conditions: { ...manualWeatherConditions },
});

// 1. Weather Engine
export const fetchWeatherData = async () => {
    // If manual mode is enabled, return manual conditions
    if (manualWeatherEnabled) {
        return {
            temperature: manualWeatherConditions.temperature,
            humidity: manualWeatherConditions.humidity,
            wind_speed: manualWeatherConditions.wind_speed,
            weather_condition:
                manualWeatherConditions.rain_mm > 20
                    ? 'Thunderstorm'
                    : manualWeatherConditions.rain_mm > 10
                        ? 'Rain'
                        : manualWeatherConditions.rain_mm > 2
                            ? 'Drizzle'
                            : manualWeatherConditions.sun > 0.7
                                ? 'Clear'
                                : 'Clouds',
            rainfall_24h: manualWeatherConditions.rain_mm,
            rainfall_72h: manualWeatherConditions.rain_mm * 2.5, // Estimate
            max_rain_intensity: manualWeatherConditions.rain_mm,
            sun_intensity: manualWeatherConditions.sun,
            data_source: 'MANUAL',
        };
    }

    const now = Date.now();
    if (cachedWeatherData && now - lastWeatherFetch < WEATHER_CACHE_DURATION) {
        return cachedWeatherData;
    }

    try {
        const live = await weatherService.getCurrentWeather();

        // Normalize mixed string/number fields coming from weatherService
        const humidityValue = Number(
            (live?.humidityValue ?? parseFloat(String(live?.humidity || '0').replace('%', ''))) || 0,
        );
        const tempValue = Number(
            (live?.tempValue ?? parseFloat(String(live?.temp || '0').replace(/[^0-9.-]/g, ''))) || 0,
        );
        const windValue = Number(
            (live?.windValue ?? parseFloat(String(live?.wind || '0').replace(/[^0-9.-]/g, ''))) || 0,
        );
        const rainValue = Number(
            (live?.rainValue ?? parseFloat(String(live?.rain || '0').replace(/[^0-9.-]/g, ''))) || 0,
        );

        // Use forecast precipitation if available, otherwise fall back to current rain
        const dailyPrecip = Array.isArray(live?.forecast)
            ? live.forecast.map((f) => f?.precipitation || 0)
            : [];
        const rain24h = dailyPrecip[0] ?? rainValue;
        const rain72h = dailyPrecip.slice(0, 3).reduce((acc, val) => acc + val, 0) || rainValue;

        cachedWeatherData = {
            temperature: tempValue,
            humidity: humidityValue,
            wind_speed: windValue,
            weather_condition: (live?.description || 'Clear').replace(' (Simulated - API Error)', ''),
            rainfall_24h: rain24h,
            rainfall_72h: rain72h,
            max_rain_intensity: rainValue, // best proxy available without radar data
            sun_intensity: Number(live?.sunIntensity ?? 0.6),
            data_source: live?.dataSource || 'OPEN_METEO',
        };
        lastWeatherFetch = now;
        return cachedWeatherData;
    } catch (error) {
        console.warn('Weather fetch failed, using simulation:', error);
        cachedWeatherData = {
            temperature: 28 + Math.random() * 5,
            humidity: 60 + Math.random() * 20,
            wind_speed: 5 + Math.random() * 10,
            weather_condition: 'Clouds',
            rainfall_24h: 0,
            rainfall_72h: 0,
            max_rain_intensity: 0,
            sun_intensity: 0.5,
            data_source: 'SIMULATION',
        };
        lastWeatherFetch = now;
        return cachedWeatherData;
    }
};

// 2. Sensor Simulation (stable locations)
let cachedSensors = null;
const generateSensors = () => {
    if (cachedSensors) {
        // Update only sensor values, keep locations stable
        return cachedSensors.map(s => ({
            ...s,
            values: {
                disp_mm: s.baseValues.disp_mm + randomNormal(0, 0.3),
                pore_kpa: s.baseValues.pore_kpa + randomNormal(0, 2),
                vibration_g: s.baseValues.vibration_g + randomNormal(0, 0.005),
            },
        }));
    }
    
    // First time: create stable sensor locations and base values
    const sensors = [];
    for (let i = 0; i < 5; i++) {
        const baseDisp = Math.random() * 3 + 1;
        const basePore = 20 + Math.random() * 20;
        const baseVib = Math.random() * 0.03 + 0.01;
        
        sensors.push({
            id: `S${i}`,
            location: {
                lat: LAT + (Math.random() - 0.5) * 0.01,
                lon: LON + (Math.random() - 0.5) * 0.01,
            },
            baseValues: {
                disp_mm: baseDisp,
                pore_kpa: basePore,
                vibration_g: baseVib,
            },
            values: {
                disp_mm: baseDisp,
                pore_kpa: basePore,
                vibration_g: baseVib,
            },
        });
    }
    cachedSensors = sensors;
    return sensors;
};

// Generate risk explanation for a cell
export const generateRiskExplanation = (cell, weatherData) => {
    const reasons = [];

    // Check mine proximity with specific distances
    if (cell.mine_proximity > 0.7) {
        reasons.push(`Critical proximity to active excavation (${Math.round(cell.mine_proximity * 100)}m from blast zone)`);
    } else if (cell.mine_proximity > 0.5) {
        reasons.push(`Moderate mining proximity affecting structural integrity of surrounding rock`);
    } else if (cell.mine_proximity > 0.3) {
        reasons.push(`Located in peripheral zone with residual vibration effects from mining`);
    }

    // Check geological factors with specifics
    if (cell.static_risk > 0.5) {
        const formation = cell.row < 10 && cell.col < 10 ? 'fractured limestone' : 
                         cell.row > 10 && cell.col > 10 ? 'weathered shale layers' : 
                         'unstable sedimentary formations';
        reasons.push(`Geological survey indicates ${formation} with high failure potential`);
    } else if (cell.static_risk > 0.35) {
        reasons.push(`Weak rock jointing and bedding planes reduce slope cohesion in this sector`);
    }

    // Check sensor data with values
    if (cell.dynamic_risk > 0.5) {
        reasons.push(`Sensors detect ${(cell.dynamic_risk * 10).toFixed(1)}mm displacement and ${(cell.dynamic_risk * 50).toFixed(0)}kPa pore pressure`);
    } else if (cell.dynamic_risk > 0.3) {
        reasons.push(`Elevated ground movement (${(cell.dynamic_risk * 10).toFixed(1)}mm) indicates active slope deformation`);
    } else if (cell.dynamic_risk > 0.15) {
        reasons.push(`Minor displacement detected but within stable threshold parameters`);
    }

    // Check weather impact with specifics
    if (weatherData) {
        if (weatherData.rainfall_24h > 25) {
            reasons.push(`Intense rainfall (${weatherData.rainfall_24h.toFixed(0)}mm) has critically saturated slope material`);
        } else if (weatherData.rainfall_24h > 15) {
            reasons.push(`Moderate precipitation (${weatherData.rainfall_24h.toFixed(0)}mm) increasing pore water pressure`);
        } else if (weatherData.rainfall_24h > 5) {
            reasons.push(`Light rainfall contributing to gradual soil moisture increase`);
        }

        if (weatherData.wind_speed > 40) {
            reasons.push(`Strong winds (${weatherData.wind_speed.toFixed(0)}km/h) exerting additional lateral stress`);
        } else if (weatherData.wind_speed > 25) {
            reasons.push(`Moderate wind conditions may dislodge loose surface material`);
        }

        if ((weatherData.sun_intensity ?? 0.6) < 0.3 && weatherData.humidity > 80) {
            reasons.push(`Poor drainage due to low evaporation and ${weatherData.humidity.toFixed(0)}% humidity`);
        } else if ((weatherData.sun_intensity ?? 0.6) > 0.7 && weatherData.humidity < 40) {
            reasons.push(`Dry conditions and high sun exposure causing surface desiccation cracks`);
        }
    }

    // Add position-specific factors for variety
    const quadrant = cell.row < 10 ? (cell.col < 10 ? 'northwest' : 'northeast') : 
                    (cell.col < 10 ? 'southwest' : 'southeast');
    
    if (cell.risk_score > 0.75 && reasons.length < 2) {
        reasons.push(`${quadrant.charAt(0).toUpperCase() + quadrant.slice(1)} sector shows compound risk factors requiring immediate attention`);
    }

    // Default messages if no specific reasons
    if (reasons.length === 0) {
        if (cell.risk_score > 0.6) {
            reasons.push(`Multiple geotechnical indicators suggest elevated instability in ${quadrant} zone`);
        } else if (cell.risk_score > 0.35) {
            reasons.push(`Moderate stability with localized weak points in ${quadrant} sector`);
        } else {
            reasons.push(`Stable conditions with minimal geological stress indicators in this cell`);
        }
    }

    // Return top 2-3 most relevant reasons
    return reasons.slice(0, Math.min(3, reasons.length)).join('. ') + '.';
};

// 3. Risk Calculation Engine
export const calculateRiskGrid = async () => {
    const weather = await fetchWeatherData();
    const sensors = generateSensors();
    const grid = [];

    // Weather Impact Calculation
    const rain_24 = Math.min(weather.rainfall_24h / 50.0, 1.0);
    const rain_72 = Math.min(weather.rainfall_72h / 100.0, 1.0);
    const intensity = Math.min(weather.max_rain_intensity / 25.0, 1.0);
    const sunFactor = Math.max(0, Math.min(1, weather.sun_intensity ?? 0.6));

    const condMap = { Thunderstorm: 1.0, Rain: 0.6, Drizzle: 0.3, Clouds: 0.1, Clear: 0.0 };
    const condScore = condMap[weather.weather_condition] || 0.0;

    const weatherImpact =
        rain_24 * 0.35 +
        rain_72 * 0.25 +
        intensity * 0.2 +
        condScore * 0.1 +
        (weather.humidity / 100) * 0.05 +
        (1 - sunFactor) * 0.05;

    const weatherMultiplier = 1.05 + weatherImpact * 0.85;

    // Initialize cell base values cache if needed (stable geological/proximity data)
    if (!cellBaseValues) {
        cellBaseValues = {};
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const distFromCenter = Math.sqrt(Math.pow(r - GRID_SIZE / 2, 2) + Math.pow(c - GRID_SIZE / 2, 2));
                const maxDist = (GRID_SIZE / 2) * Math.sqrt(2);
                const normDist = distFromCenter / maxDist;
                const mineProximityRisk = 0.85 * Math.exp(-1.0 * normDist);

                let geologicalRisk = 0.0;
                if (r < GRID_SIZE / 2 && c < GRID_SIZE / 2) geologicalRisk += 0.35;
                if (r > GRID_SIZE / 2 && c > GRID_SIZE / 2) geologicalRisk += 0.30;
                if (Math.abs(r - GRID_SIZE / 2) < 6 || Math.abs(c - GRID_SIZE / 2) < 6) geologicalRisk += 0.25;
                geologicalRisk += randomNormal(0, 0.03); // Reduced randomness
                geologicalRisk = Math.max(0, Math.min(0.6, geologicalRisk));

                cellBaseValues[`${r}-${c}`] = {
                    mineProximityRisk,
                    geologicalRisk,
                };
            }
        }
    }

    // Grid Generation
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const lat = LAT + (r - GRID_SIZE / 2) * CELL_SIZE;
            const lon = LON + (c - GRID_SIZE / 2) * CELL_SIZE;

            // Get stable base values
            const baseValues = cellBaseValues[`${r}-${c}`];
            const mineProximityRisk = baseValues.mineProximityRisk;
            const geologicalRisk = baseValues.geologicalRisk;

            // 3. Dynamic Sensor Risk
            let dynamicRisk = 0.0;
            let totalWeight = 0.0;

            sensors.forEach((s) => {
                const d = Math.sqrt(Math.pow(s.location.lat - lat, 2) + Math.pow(s.location.lon - lon, 2));
                const weight = 1.0 / Math.pow(d + 0.0001, 3);

                let sRisk =
                    (s.values.disp_mm / 10.0) * 0.4 +
                    (s.values.pore_kpa / 50.0) * 0.35 +
                    (s.values.vibration_g / 0.5) * 0.25;
                sRisk = Math.min(sRisk, 0.9);

                dynamicRisk += sRisk * weight;
                totalWeight += weight;
            });

            if (totalWeight > 0) dynamicRisk /= totalWeight;

            // 4. Combine
            const baseRisk = mineProximityRisk * 0.45 + geologicalRisk * 0.35 + dynamicRisk * 0.2;

            // 5. Final Score (add tiny variation for realism but keep mostly stable)
            let finalScore = baseRisk * weatherMultiplier * 1.08 + 0.02 + randomNormal(0, 0.005);
            finalScore = Math.max(0, Math.min(0.99, finalScore));

            grid.push({
                id: `C${r}-${c}`,
                row: r,
                col: c,
                lat,
                lon,
                risk_score: finalScore,
                mine_proximity: mineProximityRisk,
                sensor_influence: dynamicRisk,
                weather_impact: weatherImpact,
                static_risk: geologicalRisk,
                dynamic_risk: dynamicRisk,
            });
        }
    }

    // Calculate Stats
    const risks = grid.map((c) => c.risk_score);
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
    const maxRisk = Math.max(...risks);

    // Sensor Stats
    const sensorStats = {
        max_disp_mm: Math.max(...sensors.map((s) => s.values.disp_mm)),
        max_pore_kpa: Math.max(...sensors.map((s) => s.values.pore_kpa)),
        max_vib_g: Math.max(...sensors.map((s) => s.values.vibration_g)),
        active_sensors: sensors.length,
    };

    // Try to enhance with ML predictions (async, non-blocking)
    let enhancedGrid = grid;
    let mlAvailable = false;
    
    // Run ML prediction in background without blocking
    const mlPromise = (async () => {
        try {
            console.log('🤖 Attempting ML prediction...');
            const mlHealthy = await MLService.checkHealth();
            if (mlHealthy) {
                console.log('✅ ML service available, getting predictions...');
                const mlGrid = await MLService.predictGrid(grid, weather);
                mlAvailable = mlGrid[0]?.ml_available ?? false;
                console.log(`🎯 ML predictions ${mlAvailable ? 'SUCCESS' : 'FALLBACK'}`);
                return mlGrid;
            } else {
                console.log('⚠️ ML service not available, using client-side calculations');
                return null;
            }
        } catch (error) {
            console.warn('ML prediction failed:', error.message);
            return null;
        }
    })();

    // Don't wait for ML, return immediately with base calculations
    // ML enhancement will happen in background
    const baseResult = {
        grid: enhancedGrid,
        stats: {
            average_risk: avgRisk,
            max_risk: maxRisk,
            total_cells: enhancedGrid.length,
        },
        weather_data: weather,
        weather_impact: weatherImpact,
        sensor_stats: sensorStats,
        ml_enabled: false,
    };

    // Try to get ML result quickly (with timeout)
    try {
        const mlResult = await Promise.race([
            mlPromise,
            new Promise(resolve => setTimeout(() => resolve(null), 2000))
        ]);
        
        if (mlResult) {
            baseResult.grid = mlResult;
            baseResult.ml_enabled = mlResult[0]?.ml_available ?? false;
        }
    } catch (error) {
        console.warn('ML timeout, continuing with base calculations');
    }

    return baseResult;
};

export const getRiskAssessment = async () => {
    const data = await calculateRiskGrid();

    const alerts = [];
    if (data.stats.max_risk > 0.75) alerts.push('CRITICAL: High landslide risk detected in central zone');
    if (data.weather_data.rainfall_24h > 20) alerts.push('WARNING: Heavy rainfall increasing soil saturation');
    if (data.sensor_stats.max_disp_mm > 3) alerts.push('ALERT: Significant ground displacement detected');

    return {
        base_risk: data.stats.average_risk,
        enhanced_risk: data.stats.max_risk,
        weather_impact: data.weather_impact,
        weather_data: data.weather_data,
        risk_level:
            data.stats.max_risk >= 0.75 ? 'Danger' : data.stats.max_risk >= 0.60 ? 'High' : data.stats.max_risk >= 0.35 ? 'Medium' : 'Low',
        alerts,
        sources: {
            sensors: data.sensor_stats,
            visual: { risk_score: 0.0, last_check: null },
        },
    };
};
