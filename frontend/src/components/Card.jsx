export default function Card({
  children,
  className = '',
  hoverable = false,
  noPadding = false,
  onClick = null,
}) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-100
        ${noPadding ? '' : 'p-6'}
        ${hoverable || onClick ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
