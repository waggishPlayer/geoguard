const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/env');

const ML_SERVICE_URL = config.mlServiceUrl;

/**
 * Call ML service endpoint
 */
const callMLService = async (method, endpoint, data = null, isFormData = false) => {
  try {
    const url = `${ML_SERVICE_URL}${endpoint}`;
    let response;

    if (isFormData && data) {
      // For file uploads
      response = await axios({
        method,
        url,
        data,
        headers: data.getHeaders(),
        timeout: 30000 // 30 seconds for ML processing
      });
    } else {
      response = await axios({
        method,
        url,
        data,
        timeout: 30000
      });
    }

    return response.data;
  } catch (error) {
    console.error(`ML Service error (${endpoint}):`, error.message);
    
    // If ML service is not available, return placeholder
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return {
        ok: false,
        implemented: false,
        message: 'ML service unavailable — ensure Python ML service is running',
        error: error.message
      };
    }

    // If ML service returned an error response
    if (error.response) {
      return error.response.data || {
        ok: false,
        implemented: false,
        message: error.response.statusText || 'ML service error',
        error: error.response.data?.detail || error.message
      };
    }

    throw error;
  }
};

/**
 * Predict risk score using XGBoost model
 */
const predict = async ({ slopeId, sensorData = {} }) => {
  try {
    const payload = {
      slopeId,
      sensorData
    };

    const result = await callMLService('POST', '/predict', payload);
    return result;
  } catch (error) {
    console.error('ML predict error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'ML prediction failed',
      error: error.message
    };
  }
};

/**
 * Detect cracks in uploaded image
 */
const detect = async ({ file, imageUrl }) => {
  try {
    if (file) {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const result = await callMLService('POST', '/detect', formData, true);
      return result;
    } else if (imageUrl) {
      const payload = { image_url: imageUrl };
      const result = await callMLService('POST', '/detect', payload);
      return result;
    } else {
      return {
        ok: false,
        implemented: false,
        message: 'Either file or image_url must be provided'
      };
    }
  } catch (error) {
    console.error('ML detect error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'ML detection failed',
      error: error.message
    };
  }
};

/**
 * Generate 72-hour risk forecast
 */
const forecast = async ({ slopeId }) => {
  try {
    const payload = { slopeId };
    const result = await callMLService('POST', '/forecast', payload);
    return result;
  } catch (error) {
    console.error('ML forecast error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'ML forecast failed',
      error: error.message
    };
  }
};

/**
 * Explain a prediction using SHAP values
 */
const explain = async ({ predictionId, slopeId }) => {
  try {
    const endpoint = `/explain/${predictionId}${slopeId ? `?slopeId=${slopeId}` : ''}`;
    const result = await callMLService('GET', endpoint);
    return result;
  } catch (error) {
    console.error('ML explain error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'ML explanation failed',
      error: error.message
    };
  }
};

/**
 * List all predictions (placeholder - not implemented in ML service yet)
 */
const listPredictions = async () => {
  // This would require storing predictions in database
  // For now, return placeholder
  return {
    ok: false,
    implemented: false,
    message: 'List predictions not yet implemented',
    data: {
      predictions: []
    }
  };
};

/**
 * Get current risk assessment from fusion engine
 */
const getCurrentRisk = async () => {
  try {
    const result = await callMLService('GET', '/risk/current');
    return result;
  } catch (error) {
    console.error('ML getCurrentRisk error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'Failed to get current risk assessment',
      error: error.message
    };
  }
};

/**
 * Get risk grid for heatmap
 */
const getRiskGrid = async () => {
  try {
    const result = await callMLService('GET', '/risk/grid');
    return result;
  } catch (error) {
    console.error('ML getRiskGrid error:', error);
    return {
      ok: false,
      implemented: false,
      message: 'Failed to get risk grid',
      error: error.message
    };
  }
};

module.exports = {
  predict,
  detect,
  forecast,
  explain,
  listPredictions,
  getCurrentRisk,
  getRiskGrid
};

