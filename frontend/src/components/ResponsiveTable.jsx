/**
 * Componente de tabla responsiva que muestra:
 * - Tabla en desktop/tablet
 * - Cards en móvil
 */
export default function ResponsiveTable({ headers, rows, renderRow, emptyMessage = 'No hay datos' }) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop/Tablet - Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                {renderRow(row).map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile - Cards */}
      <div className="sm:hidden space-y-3">
        {rows.map((row, i) => {
          const cells = renderRow(row)
          return (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
            >
              {headers.map((header, j) => (
                <div key={j} className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-600">{header}</span>
                  <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                    {cells[j]}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}
