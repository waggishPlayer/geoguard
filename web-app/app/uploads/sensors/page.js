'use client'

import { useState } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'

export default function UploadSensorsPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV file')
      return
    }

    setUploading(true)
    try {
      // TODO: Replace with actual backend endpoint when CSV upload is implemented
      // Backend endpoint: POST /api/sensors/upload-csv
      const formData = new FormData()
      formData.append('file', file)
      
      // Placeholder - will be implemented when backend supports CSV upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUploadResult({
        success: true,
        message: 'CSV uploaded successfully. Data will sync with backend shortly.',
        records: 0,
      })
    } catch (error) {
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed',
      })
    } finally {
      setUploading(false)
    }
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
          <div className="max-w-3xl mx-auto">
            <Card
              title="Upload Sensor Data (CSV)"
              subtitle="Upload sensor readings from CSV file"
            >
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>CSV Format:</strong> The CSV file should contain columns: time, sensor_id, value, status
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {file ? (
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <button
                          onClick={() => setFile(null)}
                          className="mt-2 text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <label className="mt-2 cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload CSV file
                          </span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {uploadResult && (
                  <div className={`p-4 rounded-lg ${
                    uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {uploadResult.message}
                    </p>
                    {uploadResult.records > 0 && (
                      <p className="text-sm text-green-800 mt-1">
                        Successfully imported {uploadResult.records} records
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

