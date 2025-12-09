// Offline-first mock ML service to avoid backend dependency
export const mlService = {
  async predict(slopeId, sensorData = {}) {
    console.log('[mlService] Mock predict', { slopeId, sensorData })
    return {
      ok: true,
      implemented: false,
      message: 'Mock prediction (offline mode)',
      data: {
        risk_score: 0.42,
        probability: 0.42,
        factors: {
          rainfall: 0.3,
          displacement: 0.25,
          pore_pressure: 0.2,
          seismic: 0.1,
          weather: 0.15,
        },
      },
    }
  },

  async forecast(slopeId) {
    console.log('[mlService] Mock forecast', { slopeId })
    return {
      ok: true,
      implemented: false,
      message: 'Mock forecast (offline mode)',
      data: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        risk: 0.35 + Math.random() * 0.2,
        rain_mm: Math.random() * 10,
      })),
    }
  },

  async detect(imageUri) {
    console.log('[mlService] Mock detect', imageUri)
    return {
      ok: true,
      implemented: false,
      message: 'Mock crack detection (offline mode)',
      data: {
        crack_probability: 0.18,
        risk_assessment: 'Low',
        notes: 'Offline mock response - no backend required',
      },
    }
  },

  async explain() {
    return { ok: true, implemented: false, message: 'Mock explain (offline mode)' }
  },

  async getPredictions() {
    return { ok: true, implemented: false, message: 'Mock predictions list (offline mode)', data: [] }
  },
}

