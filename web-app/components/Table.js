'use client'

export default function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition' : ''}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

