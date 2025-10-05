'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'
import TechnologyForm from '@/components/TechnologyForm'
import CompanyBadge from '@/components/CompanyBadge'
import CategoryBadge from '@/components/CategoryBadge'
import { getCompanyColors } from '@/utils/companyColors'
import { formatDateShort, formatDateLong } from '@/utils/dateFormat'
import { VIEW_MODES, SORT_COLUMNS, LOCAL_STORAGE_KEYS, type ViewMode, type SortColumn, type SortOrder } from '@/constants/viewModes'

interface Technology {
  id: string
  title: string
  description: string | null
  acronym: string | null
  acronym_full: string | null
  link1: string | null
  link1_title: string | null
  link2: string | null
  link2_title: string | null
  link3: string | null
  link3_title: string | null
  updated_at: string
  creator?: {
    admin_name: string
  }
  updater?: {
    admin_name: string
  }
  company: {
    name: string
  }
  categories: Array<{
    name: string
    type?: 'digital' | 'autonomous'
  }>
}

export default function ManagementPage() {
  const { isAdmin, admin } = useAdmin()
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [showNewTechForm, setShowNewTechForm] = useState(false)
  const [viewingTech, setViewingTech] = useState<Technology | null>(null)

  // 필터 상태
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 뷰 모드 상태
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.CARD)

  // 정렬 상태
  const [sortBy, setSortBy] = useState<SortColumn>(SORT_COLUMNS.TITLE)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // localStorage에서 뷰 모드 불러오기
  useEffect(() => {
    const savedViewMode = localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW_MODE) as ViewMode | null
    if (savedViewMode === VIEW_MODES.CARD || savedViewMode === VIEW_MODES.TABLE) {
      setViewMode(savedViewMode)
    }
  }, [])

  // 뷰 모드 변경 시 localStorage에 저장
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, mode)
  }, [])

  // 동적 필터 옵션 생성
  const availableCompanies = useMemo(() => {
    const companies = technologies
      .filter(tech => tech.company)
      .map(tech => tech.company.name)
    return [...new Set(companies)].sort()
  }, [technologies])

  const availableCategories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; type?: 'digital' | 'autonomous' }>()

    technologies
      .filter(tech => tech.categories && tech.categories.length > 0)
      .forEach(tech => {
        tech.categories.forEach(cat => {
          if (!categoryMap.has(cat.name)) {
            categoryMap.set(cat.name, { name: cat.name, type: cat.type })
          }
        })
      })

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [technologies])

  // 필터링된 기술 목록
  const filteredTechnologies = useMemo(() => {
    return technologies.filter(tech => {
      const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(tech.company?.name)
      const categoryMatch = selectedCategories.length === 0 ||
        tech.categories?.some(cat => selectedCategories.includes(cat.name))
      return companyMatch && categoryMatch
    })
  }, [technologies, selectedCompanies, selectedCategories])

  // 정렬된 기술 목록
  const sortedTechnologies = useMemo(() => {
    return [...filteredTechnologies].sort((a, b) => {
      let comparison = 0

      if (sortBy === SORT_COLUMNS.TITLE) {
        comparison = a.title.localeCompare(b.title)
      } else if (sortBy === SORT_COLUMNS.COMPANY) {
        comparison = a.company.name.localeCompare(b.company.name)
      } else if (sortBy === SORT_COLUMNS.UPDATED_AT) {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredTechnologies, sortBy, sortOrder])

  // 정렬 핸들러
  const handleSort = useCallback((column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }, [sortBy])

  // 필터 핸들러
  const handleCompanyFilter = useCallback((companyName: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyName)
        ? prev.filter(c => c !== companyName)
        : [...prev, companyName]
    )
  }, [])

  const handleCategoryFilter = useCallback((categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedCompanies([])
    setSelectedCategories([])
  }, [])

  useEffect(() => {
    loadTechnologies()
  }, [])

  const loadTechnologies = async () => {
    try {
      // 1. 기술-카테고리 매핑 데이터 로드
      const { data: mappingData, error: mappingError } = await supabase
        .from('technology_category_mapping')
        .select(`
          category_id,
          technology_categories:category_id (name, type),
          technologies:technology_id (
            id, title, description, acronym, acronym_full,
            link1, link1_title, link2, link2_title, link3, link3_title,
            company_id, created_by, updated_by, created_at, updated_at
          )
        `)

      if (mappingError) throw mappingError

      // 2. 회사 정보 로드
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')

      if (companiesError) throw companiesError

      // 3. 관리자 정보 로드
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('id, admin_name')

      if (adminsError) throw adminsError

      // 4. 데이터 변환: 기술별로 카테고리 그룹화
      const techMap = new Map<string, Technology>()

      interface MappingData {
        category_id: string
        technology_categories: { name: string; type?: 'digital' | 'autonomous' } | null
        technologies: {
          id: string
          title: string
          description: string | null
          acronym: string | null
          acronym_full: string | null
          link1: string | null
          link1_title: string | null
          link2: string | null
          link2_title: string | null
          link3: string | null
          link3_title: string | null
          company_id: string
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        } | null
      }

      mappingData?.forEach((mapping: MappingData) => {
        if (!mapping.technologies || typeof mapping.technologies !== 'object') return

        const tech = mapping.technologies
        const techId = tech.id

        if (!techMap.has(techId)) {
          const company = companiesData?.find(c => c.id === tech.company_id)
          const creator = adminsData?.find(a => a.id === tech.created_by)
          const updater = adminsData?.find(a => a.id === tech.updated_by)

          techMap.set(techId, {
            ...tech,
            company: { name: company?.name || '미지정' },
            categories: [],
            creator: creator ? { admin_name: creator.admin_name } : undefined,
            updater: updater ? { admin_name: updater.admin_name } : undefined
          })
        }

        // 카테고리 추가
        const existingTech = techMap.get(techId)!
        if (mapping.technology_categories) {
          existingTech.categories.push({
            name: mapping.technology_categories.name,
            type: mapping.technology_categories.type
          })
        }
      })

      const techsArray = Array.from(techMap.values()).sort((a, b) =>
        a.title.localeCompare(b.title)
      )

      setTechnologies(techsArray)
    } catch (error) {
      console.error('기술 정보 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = useCallback((tech: Technology) => {
    if (!isAdmin) return
    setEditingTech(tech)
  }, [isAdmin])

  const handleFormSuccess = useCallback(() => {
    loadTechnologies()
    setEditingTech(null)
    setShowNewTechForm(false)
  }, [])

  const handleFormClose = useCallback(() => {
    setEditingTech(null)
    setShowNewTechForm(false)
  }, [])

  const handleDelete = useCallback(async (techId: string, techName: string) => {
    if (!isAdmin || !admin) return

    if (!confirm(`"${techName}" 기술을 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase
        .from('technologies')
        .delete()
        .eq('id', techId)

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'technologies',
        operation: 'DELETE',
        admin_id: admin.id,
        description: `삭제: ${techName}`
      })

      await loadTechnologies()
    } catch (error) {
      console.error('기술 삭제 중 오류:', error)
    }
  }, [isAdmin, admin])

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">기능 관리</h1>
          <p className="text-muted-foreground">
            스마트십 기술 정보를 관리하고 편집하세요
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              편집 모드 (관리자: {admin?.admin_name})
            </div>
          )}
          <button
            onClick={() => setShowNewTechForm(true)}
            disabled={!isAdmin}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 ${
              isAdmin
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            새 기능 추가
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="executive-card p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 기업 필터 */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-hanwha-text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              기업별 필터
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableCompanies.map(company => {
                const companyColors = getCompanyColors(company)
                const isSelected = selectedCompanies.includes(company)
                return (
                  <button
                    key={company}
                    onClick={() => handleCompanyFilter(company)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      isSelected
                        ? `${companyColors.bg} ${companyColors.text} border-current ring-2 ring-current ring-opacity-20`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : 'bg-gray-400'}`} />
                    {company}
                    {isSelected && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 기술별 필터 */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-hanwha-text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
              </svg>
              기술별 필터
            </h3>
            <div className="space-y-3">
              {/* 디지털 기술 필터 */}
              <div>
                <div className="text-xs font-semibold text-purple-700 mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-400 mr-1.5"></span>
                  디지털 기술
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.filter(cat => cat.type === 'digital').map(category => {
                    const isSelected = selectedCategories.includes(category.name)
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryFilter(category.name)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          isSelected
                            ? 'bg-purple-100 text-purple-800 border-purple-400 ring-2 ring-purple-400 ring-opacity-20'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-600' : 'bg-gray-400'}`} />
                        {category.name}
                        {isSelected && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 자율운항 기술 필터 */}
              <div>
                <div className="text-xs font-semibold text-sky-700 mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-sky-400 mr-1.5"></span>
                  자율운항 기술
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.filter(cat => cat.type === 'autonomous').map(category => {
                    const isSelected = selectedCategories.includes(category.name)
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryFilter(category.name)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          isSelected
                            ? 'bg-sky-100 text-sky-800 border-sky-400 ring-2 ring-sky-400 ring-opacity-20'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-600' : 'bg-gray-400'}`} />
                        {category.name}
                        {isSelected && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 상태 및 초기화 */}
        <div className="flex items-center justify-between pt-4 border-t border-hanwha-border">
          <div className="text-sm text-hanwha-text-muted">
            {selectedCompanies.length > 0 || selectedCategories.length > 0 ? (
              <span>
                필터 적용됨:
                {selectedCompanies.length > 0 && <span className="ml-1">기업 {selectedCompanies.length}개</span>}
                {selectedCategories.length > 0 && <span className="ml-1">카테고리 {selectedCategories.length}개</span>}
                <span className="ml-2 font-medium">({filteredTechnologies.length}개 기술 표시)</span>
              </span>
            ) : (
              <span>전체 {technologies.length}개 기술 표시</span>
            )}
          </div>
          {(selectedCompanies.length > 0 || selectedCategories.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-hanwha-primary hover:text-hanwha-primary-light font-medium transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 뷰 모드 토글 */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => handleViewModeChange(VIEW_MODES.CARD)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === VIEW_MODES.CARD
                ? 'bg-hanwha-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            카드형
          </button>
          <button
            onClick={() => handleViewModeChange(VIEW_MODES.TABLE)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === VIEW_MODES.TABLE
                ? 'bg-hanwha-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            목록형
          </button>
        </div>
      </div>

      {/* 카드형 뷰 */}
      {viewMode === VIEW_MODES.CARD && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedTechnologies.map((tech) => {
          return (
            <div key={tech.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold leading-none tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setViewingTech(tech)}
                    >
                      {tech.title}
                    </h3>
                    {tech.acronym_full && (
                      <p className="text-xs text-gray-500 mt-1">
                        {tech.acronym_full}
                      </p>
                    )}
                  </div>
                  <CompanyBadge companyName={tech.company.name} />
                </div>
                <div className="flex justify-end flex-wrap gap-1">
                  {tech.categories && tech.categories.length > 0 ? (
                    tech.categories.map((cat, idx) => (
                      <CategoryBadge key={idx} category={cat} />
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                      미분류
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {tech.description || '설명이 없습니다.'}
                </p>

                {/* 메타데이터 표시 */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span>마지막 수정: {formatDateShort(tech.updated_at)}</span>
                  {(tech.updater?.admin_name || tech.creator?.admin_name) && (
                    <span> | 작성자: {tech.updater?.admin_name || tech.creator?.admin_name}</span>
                  )}
                </div>

                {(tech.link1 || tech.link2 || tech.link3) && (
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-gray-700">관련 링크:</div>
                    {tech.link1 && (
                      <div>
                        <a
                          href={tech.link1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {tech.link1_title || '링크 1'} →
                        </a>
                      </div>
                    )}
                    {tech.link2 && (
                      <div>
                        <a
                          href={tech.link2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {tech.link2_title || '링크 2'} →
                        </a>
                      </div>
                    )}
                    {tech.link3 && (
                      <div>
                        <a
                          href={tech.link3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {tech.link3_title || '링크 3'} →
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tech)}
                    disabled={!isAdmin}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-8 px-3 py-2 ${
                      isAdmin
                        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(tech.id, tech.title)}
                    disabled={!isAdmin}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-8 px-3 py-2 ${
                      isAdmin
                        ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* 새 기능 추가 카드 */}
        {isAdmin && (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center min-h-[200px]">
            <button
              onClick={() => setShowNewTechForm(true)}
              className="text-center space-y-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="text-2xl">+</div>
              <p className="text-sm font-medium">새 기능 추가</p>
            </button>
          </div>
        )}
        </div>
      )}

      {/* 테이블형 뷰 */}
      {viewMode === VIEW_MODES.TABLE && (
        <div className="executive-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(SORT_COLUMNS.TITLE)}
                  >
                    <div className="flex items-center gap-2">
                      기술명
                      {sortBy === SORT_COLUMNS.TITLE && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(SORT_COLUMNS.COMPANY)}
                  >
                    <div className="flex items-center gap-2">
                      기업
                      {sortBy === SORT_COLUMNS.COMPANY && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    기술 카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    설명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    링크
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(SORT_COLUMNS.UPDATED_AT)}
                  >
                    <div className="flex items-center gap-2">
                      수정일
                      {sortBy === SORT_COLUMNS.UPDATED_AT && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    작성자
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTechnologies.map((tech) => {
                  return (
                    <tr key={tech.id} className="hover:bg-gray-50 transition-colors">
                      {/* 기술명 */}
                      <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => setViewingTech(tech)}>
                        <div className="font-semibold text-blue-600 hover:text-blue-800">{tech.title}</div>
                        {tech.acronym_full && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {tech.acronym_full}
                          </div>
                        )}
                      </td>

                      {/* 기업 */}
                      <td className="px-4 py-3">
                        <CompanyBadge companyName={tech.company.name} />
                      </td>

                      {/* 기술 카테고리 */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tech.categories && tech.categories.length > 0 ? (
                            tech.categories.map((cat, idx) => (
                              <CategoryBadge key={idx} category={cat} />
                            ))
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                              미분류
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 설명 */}
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        <div className="line-clamp-2" title={tech.description || ''}>
                          {tech.description || '설명이 없습니다.'}
                        </div>
                      </td>

                      {/* 링크 */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {tech.link1 && (
                            <a
                              href={tech.link1}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title={tech.link1_title || '링크 1'}
                            >
                              🔗
                            </a>
                          )}
                          {tech.link2 && (
                            <a
                              href={tech.link2}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title={tech.link2_title || '링크 2'}
                            >
                              🔗
                            </a>
                          )}
                          {tech.link3 && (
                            <a
                              href={tech.link3}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title={tech.link3_title || '링크 3'}
                            >
                              🔗
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 수정일 */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateShort(tech.updated_at)}
                      </td>

                      {/* 작성자 */}
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                        {tech.updater?.admin_name || tech.creator?.admin_name || '-'}
                      </td>

                      {/* 작업 버튼 */}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(tech)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="편집"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(tech.id, tech.title)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedTechnologies.length === 0 && technologies.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg mb-2">필터 조건에 맞는 기술이 없습니다</p>
          <p className="text-sm">다른 필터 조건을 선택하거나 필터를 초기화해보세요</p>
        </div>
      )}

      {technologies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg mb-2">등록된 기술이 없습니다</p>
          <p className="text-sm">관리자로 로그인하여 새로운 기술을 추가해보세요</p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {isAdmin ? (
          <div className="space-y-1">
            <div>✅ 관리자 모드: 편집 기능이 활성화되었습니다.</div>
            <div>💡 기술 카드의 편집/삭제 버튼을 사용하여 관리할 수 있습니다.</div>
          </div>
        ) : (
          <div>ℹ️ 관리자 인증 후 기능 편집이 가능합니다.</div>
        )}
      </div>

      {/* 기술 폼 모달 */}
      <TechnologyForm
        technology={editingTech}
        isOpen={!!editingTech || showNewTechForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        adminId={admin?.id}
      />

      {/* 기술 상세 모달 */}
      {viewingTech && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewingTech(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{viewingTech.title}</h2>
                  {viewingTech.acronym_full && (
                    <p className="text-sm text-gray-600 mb-3">
                      {viewingTech.acronym_full}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <CompanyBadge companyName={viewingTech.company.name} className="px-3 py-1 text-sm" />
                    {viewingTech.categories && viewingTech.categories.length > 0 && (
                      viewingTech.categories.map((cat, idx) => (
                        <CategoryBadge key={idx} category={cat} className="px-3 py-1 text-sm" />
                      ))
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setViewingTech(null)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 대표 이미지 */}
              {(viewingTech as any).image_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">대표 이미지</h3>
                  <img
                    src={(viewingTech as any).image_url}
                    alt={viewingTech.title}
                    className="w-full max-w-2xl h-64 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}

              {/* 설명 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">기술 설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {viewingTech.description || '설명이 없습니다.'}
                </p>
              </div>

              {/* 관련 링크 */}
              {(viewingTech.link1 || viewingTech.link2 || viewingTech.link3) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">관련 링크</h3>
                  <div className="space-y-2">
                    {viewingTech.link1 && (
                      <a
                        href={viewingTech.link1}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {viewingTech.link1_title || '링크 1'}
                      </a>
                    )}
                    {viewingTech.link2 && (
                      <a
                        href={viewingTech.link2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {viewingTech.link2_title || '링크 2'}
                      </a>
                    )}
                    {viewingTech.link3 && (
                      <a
                        href={viewingTech.link3}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {viewingTech.link3_title || '링크 3'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 메타 정보 */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">최종 수정일:</span>
                    <span className="ml-2 text-gray-900">
                      {formatDateLong(viewingTech.updated_at)}
                    </span>
                  </div>
                  {(viewingTech.updater?.admin_name || viewingTech.creator?.admin_name) && (
                    <div>
                      <span className="text-gray-500">작성자:</span>
                      <span className="ml-2 text-gray-900">
                        {viewingTech.updater?.admin_name || viewingTech.creator?.admin_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setViewingTech(null)
                      handleEdit(viewingTech)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => {
                      setViewingTech(null)
                      handleDelete(viewingTech.id, viewingTech.title)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    삭제
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingTech(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}