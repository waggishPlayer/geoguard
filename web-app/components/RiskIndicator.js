'use client'

export default function RiskIndicator({ riskLevel }) {
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(riskLevel)}`}
    >
      {riskLevel?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
}

