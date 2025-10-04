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
  type?: 'digital' | 'autonomous'
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
  company_id: string
  category_id?: string | null  // nullable로 변경 (옵션, 레거시 데이터 지원용)
  description?: string
  link1?: string
  link1_title?: string
  link2?: string
  link2_title?: string
  link3?: string
  link3_title?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

// 기술-카테고리 매핑 테이블
export interface TechnologyCategoryMapping {
  id: string
  technology_id: string
  category_id: string
  created_at: string
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
  categories?: TechnologyCategory[]  // 여러 카테고리 지원
}

// 비교 테이블을 위한 타입 (복수 기술 지원)
export interface ComparisonTableRow {
  company: Company
  technologies: Record<string, Technology[]> // category_id를 키로 하는 기술 배열
}

// 폼 데이터 타입
export interface TechnologyFormData {
  title: string
  company_id: string
  category_ids: string[]  // 여러 카테고리 선택 가능
  description?: string
  link1?: string
  link1_title?: string
  link2?: string
  link2_title?: string
  link3?: string
  link3_title?: string
}