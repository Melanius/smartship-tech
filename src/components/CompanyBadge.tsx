import { getCompanyColors } from '@/utils/companyColors'

interface CompanyBadgeProps {
  companyName: string
  className?: string
}

export default function CompanyBadge({ companyName, className = '' }: CompanyBadgeProps) {
  const colors = getCompanyColors(companyName)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring} ${className}`}
    >
      {companyName || '미지정'}
    </span>
  )
}
