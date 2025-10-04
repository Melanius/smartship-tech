'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'
import TechnologyForm from '@/components/TechnologyForm'

interface Technology {
  id: string
  title: string
  description: string | null
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
  technology_category: {
    name: string
  }
}

export default function ManagementPage() {
  const { isAdmin, admin } = useAdmin()
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [showNewTechForm, setShowNewTechForm] = useState(false)

  // 필터 상태
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 기업별 색상 정의
  const getCompanyColors = (companyName: string) => {
    const colors = {
      '한화': { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-700/10' },
      'HD현대': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-700/10' },
      '삼성중공업': { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-700/10' },
      '콩스버그': { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-700/10' },
      '한국선급': { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-700/10' },
      'DNV': { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-700/10' },
    }

    return colors[companyName as keyof typeof colors] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      ring: 'ring-gray-700/10'
    }
  }

  // 동적 필터 옵션 생성
  const availableCompanies = useMemo(() => {
    const companies = technologies
      .filter(tech => tech.company)
      .map(tech => tech.company.name)
    return [...new Set(companies)].sort()
  }, [technologies])

  const availableCategories = useMemo(() => {
    const categories = technologies
      .filter(tech => tech.technology_category)
      .map(tech => tech.technology_category.name)
    return [...new Set(categories)].sort()
  }, [technologies])

  // 필터링된 기술 목록
  const filteredTechnologies = useMemo(() => {
    return technologies.filter(tech => {
      const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(tech.company.name)
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(tech.technology_category.name)
      return companyMatch && categoryMatch
    })
  }, [technologies, selectedCompanies, selectedCategories])

  // 필터 핸들러
  const handleCompanyFilter = (companyName: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyName)
        ? prev.filter(c => c !== companyName)
        : [...prev, companyName]
    )
  }

  const handleCategoryFilter = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const clearAllFilters = () => {
    setSelectedCompanies([])
    setSelectedCategories([])
  }

  useEffect(() => {
    loadTechnologies()
  }, [])

  const loadTechnologies = async () => {
    try {
      const { data, error } = await supabase
        .from('technologies')
        .select(`
          *,
          company:companies(name),
          technology_category:technology_categories(name),
          creator:admins!created_by(admin_name),
          updater:admins!updated_by(admin_name)
        `)
        .order('title')

      if (error) throw error
      setTechnologies(data || [])
    } catch (error) {
      console.error('기술 정보 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (tech: Technology) => {
    if (!isAdmin) return
    setEditingTech(tech)
  }

  const handleFormSuccess = () => {
    loadTechnologies()
    setEditingTech(null)
    setShowNewTechForm(false)
  }

  const handleFormClose = () => {
    setEditingTech(null)
    setShowNewTechForm(false)
  }

  const handleDelete = async (techId: string, techName: string) => {
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
  }

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

          {/* 기술 카테고리 필터 */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-hanwha-text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
              </svg>
              기술 카테고리별 필터
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => {
                const isSelected = selectedCategories.includes(category)
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gray-100 text-gray-800 border-gray-400 ring-2 ring-gray-400 ring-opacity-20'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-gray-600' : 'bg-gray-400'}`} />
                    {category}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTechnologies.map((tech) => {
          const companyColors = getCompanyColors(tech.company.name)

          return (
            <div key={tech.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {tech.title}
                  </h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${companyColors.bg} ${companyColors.text} ${companyColors.ring}`}>
                    {tech.company?.name || '미지정'}
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                    {tech.technology_category?.name || '미분류'}
                  </span>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <p className="text-sm text-gray-600">
                  {tech.description || '설명이 없습니다.'}
                </p>

                {/* 메타데이터 표시 */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span>마지막 수정: {new Date(tech.updated_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '')}</span>
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

      {filteredTechnologies.length === 0 && technologies.length > 0 && (
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
    </div>
  );
}