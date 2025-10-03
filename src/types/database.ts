// 데이터베이스 타입 정의

export interface Admin {
  id: string
  admin_code: string
  admin_name: string
  is_active: boolean
  created_at: string
}

export interface Company {
  id: string
  name: string
  name_en?: string
  description?: string
  website?: string
  sort_order: number
  is_active: boolean
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface TechnologyCategory {
  id: string
  name: string
  name_en?: string
  description?: string
  sort_order: number
  is_active: boolean
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface Technology {
  id: string
  title: string
  title_en?: string
  company_id: string
  category_id: string
  description?: string
  description_en?: string
  specifications?: Record<string, unknown>
  features?: string[]
  links?: Array<{
    type: 'website' | 'pdf' | 'video' | 'document'
    url: string
    title: string
  }>
  status: 'active' | 'development' | 'discontinued'
  release_date?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface ChangeLog {
  id: string
  table_name: string
  record_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  field_name?: string
  old_value?: string
  new_value?: string
  admin_id?: string
  admin_name?: string
  created_at: string
}

// 조인된 데이터 타입
export interface TechnologyWithRelations extends Technology {
  company?: Company
  category?: TechnologyCategory
}

// 비교 테이블을 위한 타입
export interface ComparisonTableRow {
  company: Company
  technologies: Record<string, Technology | null> // category_id를 키로 하는 기술 정보
}

// 폼 데이터 타입
export interface TechnologyFormData {
  title: string
  title_en?: string
  company_id: string
  category_id: string
  description?: string
  description_en?: string
  specifications?: Record<string, unknown>
  features?: string[]
  links?: Array<{
    type: 'website' | 'pdf' | 'video' | 'document'
    url: string
    title: string
  }>
  status: 'active' | 'development' | 'discontinued'
  release_date?: string
}