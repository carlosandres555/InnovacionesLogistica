export default function Card({
  children,
  className = '',
  hoverable = false,
  noPadding = false,
}) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-100
        ${noPadding ? '' : 'p-6'}
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
