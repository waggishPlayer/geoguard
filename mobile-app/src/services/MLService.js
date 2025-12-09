/**
 * ML Service Client for Mobile App
 * Calls the Python FastAPI ML service for predictions
 */

const ML_SERVICE_URL = 'http://192.168.43.1:8000'; // Default hotspot gateway

class MLService {
  constructor() {
    this.baseUrl = ML_SERVICE_URL;
    this.isAvailable = false;
  }

  /**
   * Set custom ML service URL
   */
  setServiceUrl(url) {
    this.baseUrl = url;
  }

  /**
   * Check if ML service is available
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      this.isAvailable = data.status === 'healthy' || data.status === 'online';
      return this.isAvailable;
    } catch (error) {
      console.warn('ML service not available:', error.message);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Get risk prediction from ML model
   * @param {Object} params - Prediction parameters
   * @returns {Promise<Object>} Prediction result
   */
  async predict(params) {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`ML prediction failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        prediction: data,
        source: 'ML_MODEL',
      };
    } catch (error) {
      console.warn('ML prediction error:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'FALLBACK',
      };
    }
  }

  /**
   * Get predictions for entire grid
   * @param {Array} gridCells - Array of grid cell data
   * @param {Object} weatherData - Current weather conditions
   * @returns {Promise<Array>} Enhanced grid with ML predictions
   */
  async predictGrid(gridCells, weatherData) {
    try {
      // Batch predict for all cells
      const payload = {
        cells: gridCells.map(cell => ({
          lat: cell.lat,
          lon: cell.lon,
          mine_proximity: cell.mine_proximity,
          static_risk: cell.static_risk,
          sensor_influence: cell.sensor_influence,
        })),
        weather: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          rainfall_24h: weatherData.rainfall_24h,
          rainfall_72h: weatherData.rainfall_72h,
          wind_speed: weatherData.wind_speed,
        },
      };

      const response = await fetch(`${this.baseUrl}/predict-grid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 15000,
      });

      if (!response.ok) {
        throw new Error(`Grid prediction failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Merge ML predictions with original grid
      return gridCells.map((cell, index) => ({
        ...cell,
        ml_risk_score: data.predictions?.[index]?.risk_score ?? cell.risk_score,
        ml_confidence: data.predictions?.[index]?.confidence ?? 0.5,
        ml_available: true,
      }));
    } catch (error) {
      console.warn('Grid prediction error:', error.message);
      // Return original grid with ML unavailable flag
      return gridCells.map(cell => ({
        ...cell,
        ml_risk_score: cell.risk_score,
        ml_confidence: 0,
        ml_available: false,
      }));
    }
  }
}

// Export singleton instance
export default new MLService();
