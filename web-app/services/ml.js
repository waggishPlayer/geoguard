import api from './api'

const placeholder = (message = 'ML not integrated yet — placeholder only') => ({
  ok: false,
  implemented: false,
  message,
  data: {},
})

const handleMlRequest = async (requestFn) => {
  try {
    const response = await requestFn()
    return response.data
  } catch (error) {
    if (error.response?.data) {
      return error.response.data
    }
    console.error('ML service unavailable:', error)
    return placeholder('Unable to reach ML gateway')
  }
}

export const mlService = {
  async predict(slopeId, sensorData) {
    return handleMlRequest(() =>
      api.post('/ml/predict', { slopeId, sensorData })
    )
  },

  async forecast(slopeId) {
    return handleMlRequest(() =>
      api.post('/ml/forecast', { slopeId })
    )
  },

  async detect(image) {
    const formData = new FormData()
    if (image instanceof File) {
      formData.append('image', image)
    } else if (image) {
      formData.append('image_url', image)
    }

    return handleMlRequest(() =>
      api.post('/ml/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },

  async explain(slopeId, predictionId) {
    return handleMlRequest(() =>
      api.get(`/ml/explain/${predictionId}`, { params: { slopeId } })
    )
  },

  async getPredictions() {
    return handleMlRequest(() => api.get('/ml/predictions'))
  },
}
