'use client'

import { useState, useEffect } from 'react'
import { sensorsService } from '../services/sensors'

export function useSensors(slopeId = null) {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSensors = async () => {
    try {
      const data = await sensorsService.getAll(slopeId)
      setSensors(data)
    } catch (err) {
      console.error('Failed to load sensors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSensors()
  }, [slopeId])

  return { sensors, loading, reload: loadSensors }
}
