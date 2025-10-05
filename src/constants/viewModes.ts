export const VIEW_MODES = {
  CARD: 'card',
  TABLE: 'table'
} as const

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES]

export const SORT_COLUMNS = {
  TITLE: 'title',
  COMPANY: 'company',
  UPDATED_AT: 'updated_at'
} as const

export type SortColumn = typeof SORT_COLUMNS[keyof typeof SORT_COLUMNS]

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS]

export const LOCAL_STORAGE_KEYS = {
  VIEW_MODE: 'managementViewMode'
} as const
