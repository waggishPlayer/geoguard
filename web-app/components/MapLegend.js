'use client'

export default function MapLegend() {
  const legendItems = [
    { color: 'bg-red-600', label: 'Critical Risk' },
    { color: 'bg-orange-500', label: 'High Risk' },
    { color: 'bg-yellow-500', label: 'Medium Risk' },
    { color: 'bg-green-500', label: 'Low Risk' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-bold mb-2">Risk Levels</h3>
      <div className="space-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`}></div>
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

