export interface CompanyColors {
  bg: string
  text: string
  ring: string
}

const COMPANY_COLOR_MAP: Record<string, CompanyColors> = {
  '한화': { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-700/10' },
  'HD현대': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-700/10' },
  '삼성중공업': { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-700/10' },
  '콩스버그': { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-700/10' },
  '한국선급': { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-700/10' },
  'DNV': { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-700/10' },
}

const DEFAULT_COLORS: CompanyColors = {
  bg: 'bg-gray-50',
  text: 'text-gray-700',
  ring: 'ring-gray-700/10'
}

export function getCompanyColors(companyName: string): CompanyColors {
  return COMPANY_COLOR_MAP[companyName] || DEFAULT_COLORS
}
