interface Category {
  name: string
  type?: 'digital' | 'autonomous'
}

interface CategoryBadgeProps {
  category: Category
  className?: string
}

export default function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const isDigital = category.type === 'digital'
  const isAutonomous = category.type === 'autonomous'

  const colorClasses = isDigital
    ? 'bg-purple-50 text-purple-700 ring-purple-700/10'
    : isAutonomous
    ? 'bg-sky-50 text-sky-700 ring-sky-700/10'
    : 'bg-gray-50 text-gray-700 ring-gray-700/10'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClasses} ${className}`}
    >
      {category.name}
    </span>
  )
}
