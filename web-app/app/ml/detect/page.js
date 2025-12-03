'use client'

import { useState } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { mlService } from '../../../services/ml'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import RiskIndicator from '../../../components/RiskIndicator'

export default function MLDetectPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [detection, setDetection] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setDetection(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDetect = async () => {
    if (!selectedFile) {
      alert('Please select an image file')
      return
    }

    setLoading(true)
    try {
      const result = await mlService.detect(selectedFile)
      setMlStatus(result)
      setDetection(result?.data || null)
    } catch (error) {
      console.error('Detection failed:', error)
      setMlStatus({
        ok: false,
        implemented: false,
        message: 'Unable to detect cracks in image',
      })
      setDetection(null)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (probability) => {
    if (probability > 0.8) return 'critical'
    if (probability > 0.6) return 'high'
    if (probability > 0.4) return 'medium'
    return 'low'
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              title="Crack Detection"
              subtitle="Upload an image to detect cracks and assess structural risk"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong>{' '}
                  {mlStatus?.message || 'Upload an image of a slope or structure to detect cracks using AI vision model.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: JPG, PNG, WebP. Max size: 10MB
                  </p>
                </div>

                {preview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                <button
                  onClick={handleDetect}
                  disabled={!selectedFile || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Detect Cracks'}
                </button>
              </div>
            </Card>

            {detection && (
              <>
                <Card title="Detection Results">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Crack Detected</p>
                        <p className="text-2xl font-bold">
                          {detection.detected ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-2xl font-bold">
                          {(detection.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Risk Assessment</p>
                      {detection.risk_assessment && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Risk Level:</span>
                            <RiskIndicator riskLevel={detection.risk_assessment.level} />
                          </div>
                          <p className="text-sm text-gray-700">
                            {detection.risk_assessment.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Crack Probability: {(detection.crack_probability * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {detection.source && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Image Info</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Filename:</span> {detection.source.filename}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Size:</span> {(detection.source.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {detection.detected && (
                  <Card title="Recommendations">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        Based on the detection results, we recommend:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {detection.risk_assessment?.level === 'critical' && (
                          <>
                            <li>Immediate site inspection required</li>
                            <li>Consider evacuation if risk is imminent</li>
                            <li>Notify safety team immediately</li>
                          </>
                        )}
                        {detection.risk_assessment?.level === 'high' && (
                          <>
                            <li>Schedule inspection within 24 hours</li>
                            <li>Monitor the area closely</li>
                            <li>Document findings for further analysis</li>
                          </>
                        )}
                        {detection.risk_assessment?.level === 'medium' && (
                          <>
                            <li>Schedule inspection within 48 hours</li>
                            <li>Continue regular monitoring</li>
                            <li>Track changes over time</li>
                          </>
                        )}
                        {detection.risk_assessment?.level === 'low' && (
                          <>
                            <li>No immediate action required</li>
                            <li>Continue routine inspections</li>
                            <li>Maintain regular monitoring schedule</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

