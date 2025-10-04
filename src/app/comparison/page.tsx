'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'
import CellEditModal from '@/components/CellEditModal'
import TechnologyForm from '@/components/TechnologyForm'

interface Company {
  id: string
  name: string
  description: string | null
}

interface TechnologyCategory {
  id: string
  name: string
  description: string | null
  type?: 'digital' | 'autonomous'
}

interface Admin {
  id: string
  admin_name: string
}

interface Technology {
  id: string
  title: string
  description: string | null
  company_id: string
  category_id: string
  link1: string | null
  link2: string | null
  link3: string | null
  link1_title: string | null
  link2_title: string | null
  link3_title: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  creator?: Admin
  updater?: Admin
}

export default function ComparisonPage() {
  const { isAdmin, admin } = useAdmin()
  const [companies, setCompanies] = useState<Company[]>([])
  const [categories, setCategories] = useState<TechnologyCategory[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [newTechName, setNewTechName] = useState('')

  // 구조 편집 모드 상태
  const [isStructureEditMode, setIsStructureEditMode] = useState(false)
  const [pendingChanges] = useState<Record<string, unknown>[]>([])
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editingCol, setEditingCol] = useState<string | null>(null)

  // 편집용 상태
  const [editingCompanyName, setEditingCompanyName] = useState('')
  const [editingCategoryName, setEditingCategoryName] = useState('')

  // 새 항목 추가를 위한 상태
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCompany, setIsAddingCompany] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  // 드래그 앤 드롭을 위한 상태
  const [draggedItem, setDraggedItem] = useState<{type: 'company' | 'category', id: string} | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{type: 'company' | 'category', id: string} | null>(null)

  // 툴팁을 위한 상태
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // 기술 상세 모달을 위한 상태
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null)
  const [isTechModalOpen, setIsTechModalOpen] = useState(false)

  // 셀 편집 모달을 위한 상태
  const [isCellEditModalOpen, setIsCellEditModalOpen] = useState(false)
  const [editingCellData, setEditingCellData] = useState<{categoryId: string, companyId: string} | null>(null)

  // 탭 선택 상태 (디지털 기술 / 자율운항 기술)
  const [selectedType, setSelectedType] = useState<'digital' | 'autonomous'>('digital')

  // 기술 수정을 위한 TechnologyForm 모달 상태
  const [editingTech, setEditingTech] = useState<Technology | null>(null)
  const [isTechFormOpen, setIsTechFormOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Promise.allSettled로 부분 실패 허용
      const results = await Promise.allSettled([
        supabase.from('companies').select('*').order('sort_order'),
        supabase.from('technology_categories').select('*').order('sort_order'),
        // 기술-카테고리 매핑과 JOIN하여 모든 카테고리 정보 가져오기
        supabase.from('technology_category_mapping').select(`
          category_id,
          technologies:technology_id (
            id,
            title,
            company_id,
            category_id,
            description,
            link1,
            link1_title,
            link2,
            link2_title,
            link3,
            link3_title,
            created_by,
            updated_by,
            created_at,
            updated_at
          )
        `)
      ])

      // 성공한 결과만 처리
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        setCompanies(results[0].value.data)
      } else if (results[0].status === 'rejected') {
        console.error('기업 데이터 로드 실패:', results[0].reason)
      }

      if (results[1].status === 'fulfilled' && results[1].value.data) {
        setCategories(results[1].value.data)
      } else if (results[1].status === 'rejected') {
        console.error('카테고리 데이터 로드 실패:', results[1].reason)
      }

      if (results[2].status === 'fulfilled' && results[2].value.data) {
        // mapping 데이터를 technologies 형식으로 변환
        const mappingData = results[2].value.data as any[]
        const techsWithCategories: Technology[] = []

        mappingData.forEach((mapping: any) => {
          if (mapping.technologies && typeof mapping.technologies === 'object') {
            // technologies가 객체인 경우 (단일 기술)
            const tech = {
              ...mapping.technologies,
              category_id: mapping.category_id  // 매핑의 category_id 사용
            }
            techsWithCategories.push(tech)
          }
        })

        setTechnologies(techsWithCategories)
      } else if (results[2].status === 'rejected') {
        console.error('기술 데이터 로드 실패:', results[2].reason)
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 선택된 타입에 따른 카테고리 필터링
  const filteredCategories = useMemo(() =>
    categories.filter(c => c.type === selectedType),
    [categories, selectedType]
  )

  // 복수 기술 지원: Map 인덱싱으로 O(1) 조회 성능 최적화
  const technologiesMap = useMemo(() => {
    const map = new Map<string, Technology[]>()
    technologies.forEach(tech => {
      const key = `${tech.company_id}-${tech.category_id}`
      const existing = map.get(key) || []
      map.set(key, [...existing, tech])
    })
    return map
  }, [technologies])

  const getTechnologies = useCallback((categoryId: string, companyId: string) => {
    const key = `${companyId}-${categoryId}`
    return technologiesMap.get(key) || []
  }, [technologiesMap])

  const handleTechClick = useCallback((tech: Technology) => {
    setSelectedTech(tech)
    setIsTechModalOpen(true)
  }, [])

  const handleCellClick = useCallback((categoryId: string, companyId: string) => {
    const techs = getTechnologies(categoryId, companyId)

    if (isAdmin && isStructureEditMode) {
      // 관리자 + 편집 모드: 셀 편집 모달 열기
      setEditingCellData({ categoryId, companyId })
      setIsCellEditModalOpen(true)
    } else if (!isAdmin) {
      // 일반 유저: 기술이 있으면 상세 모달 열기
      if (techs.length > 0) {
        handleTechClick(techs[0])
      }
    }
  }, [isAdmin, isStructureEditMode, getTechnologies, handleTechClick])

  const handleSaveTechnology = async (categoryId: string, companyId: string) => {
    if (!isAdmin || !admin) return

    try {
      const existingTechs = getTechnologies(categoryId, companyId)
      const existingTech = existingTechs[0]

      if (existingTech) {
        // 기존 기술 업데이트
        const { error } = await supabase
          .from('technologies')
          .update({ title: newTechName })
          .eq('id', existingTech.id)

        if (error) throw error
      } else if (newTechName.trim()) {
        // 새 기술 추가
        const { error } = await supabase
          .from('technologies')
          .insert({
            title: newTechName,
            company_id: companyId,
            category_id: categoryId
          })

        if (error) throw error
      }

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'technologies',
        operation: existingTech ? 'UPDATE' : 'INSERT',
        admin_id: admin.id,
        description: `${existingTech ? '수정' : '추가'}: ${newTechName}`
      })

      await loadData()
      setEditingCell(null)
      setNewTechName('')
    } catch (error) {
      console.error('기술 저장 중 오류:', error)
    }
  }

  const handleCancelTechEdit = () => {
    setEditingCell(null)
    setNewTechName('')
  }

  // 기업 추가 함수
  const handleAddCompany = async () => {
    if (!isAdmin || !admin || !newCompanyName.trim()) return

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompanyName.trim(),
          sort_order: companies.length + 1,
          created_by: admin.id
        })
        .select()
        .single()

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'companies',
        record_id: data.id,
        operation: 'INSERT',
        admin_id: admin.id,
        description: `기업 추가: ${newCompanyName}`
      })

      await loadData()
      setNewCompanyName('')
      setIsAddingCompany(false)
    } catch (error) {
      console.error('기업 추가 중 오류:', error)
    }
  }

  // 카테고리 추가 함수
  const handleAddCategory = async () => {
    if (!isAdmin || !admin || !newCategoryName.trim()) return

    try {
      const { data, error } = await supabase
        .from('technology_categories')
        .insert({
          name: newCategoryName.trim(),
          type: selectedType, // 현재 선택된 탭의 타입 사용
          sort_order: categories.length + 1,
          created_by: admin.id
        })
        .select()
        .single()

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'technology_categories',
        record_id: data.id,
        operation: 'INSERT',
        admin_id: admin.id,
        description: `카테고리 추가: ${newCategoryName}`
      })

      await loadData()
      setNewCategoryName('')
      setIsAddingCategory(false)
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error)
    }
  }

  // 기업 삭제 함수
  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!isAdmin || !admin) return

    const confirmed = window.confirm(`'${companyName}' 기업을 삭제하시겠습니까?\n관련된 모든 기술 데이터도 함께 삭제됩니다.`)
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'companies',
        record_id: companyId,
        operation: 'DELETE',
        admin_id: admin.id,
        description: `기업 삭제: ${companyName}`
      })

      await loadData()
    } catch (error) {
      console.error('기업 삭제 중 오류:', error)
    }
  }

  // 카테고리 삭제 함수
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!isAdmin || !admin) return

    const confirmed = window.confirm(`'${categoryName}' 카테고리를 삭제하시겠습니까?\n관련된 모든 기술 데이터도 함께 삭제됩니다.`)
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('technology_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'technology_categories',
        record_id: categoryId,
        operation: 'DELETE',
        admin_id: admin.id,
        description: `카테고리 삭제: ${categoryName}`
      })

      await loadData()
    } catch (error) {
      console.error('카테고리 삭제 중 오류:', error)
    }
  }

  // 편집 기능 함수들
  const handleStartEditCompany = (companyId: string, companyName: string) => {
    setEditingCol(companyId)
    setEditingCompanyName(companyName)
  }

  const handleStartEditCategory = (categoryId: string, categoryName: string) => {
    setEditingRow(categoryId)
    setEditingCategoryName(categoryName)
  }

  const handleSaveCompanyEdit = async () => {
    if (!isAdmin || !admin || !editingCol || !editingCompanyName.trim()) return

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: editingCompanyName.trim(),
          updated_by: admin.id
        })
        .eq('id', editingCol)

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'companies',
        record_id: editingCol,
        operation: 'UPDATE',
        admin_id: admin.id,
        description: `기업명 수정: ${editingCompanyName}`
      })

      await loadData()
      setEditingCol(null)
      setEditingCompanyName('')
    } catch (error) {
      console.error('기업명 수정 중 오류:', error)
    }
  }

  const handleSaveCategoryEdit = async () => {
    if (!isAdmin || !admin || !editingRow || !editingCategoryName.trim()) return

    try {
      const { error } = await supabase
        .from('technology_categories')
        .update({
          name: editingCategoryName.trim(),
          updated_by: admin.id
        })
        .eq('id', editingRow)

      if (error) throw error

      // 변경 로그 기록
      await supabase.from('change_logs').insert({
        table_name: 'technology_categories',
        record_id: editingRow,
        operation: 'UPDATE',
        admin_id: admin.id,
        description: `카테고리명 수정: ${editingCategoryName}`
      })

      await loadData()
      setEditingRow(null)
      setEditingCategoryName('')
    } catch (error) {
      console.error('카테고리명 수정 중 오류:', error)
    }
  }

  const handleCancelEditItem = () => {
    setEditingCol(null)
    setEditingRow(null)
    setEditingCompanyName('')
    setEditingCategoryName('')
  }

  // 순서 변경 함수들
  const handleDragStart = (e: React.DragEvent, type: 'company' | 'category', id: string) => {
    setDraggedItem({ type, id })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, type: 'company' | 'category', id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem({ type, id })
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = async (e: React.DragEvent, type: 'company' | 'category', targetId: string) => {
    e.preventDefault()

    if (!draggedItem || !isAdmin || !admin || draggedItem.type !== type) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const sourceId = draggedItem.id
    if (sourceId === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    try {
      if (type === 'company') {
        await reorderCompanies(sourceId, targetId)
      } else {
        await reorderCategories(sourceId, targetId)
      }
    } catch (error) {
      console.error('순서 변경 중 오류:', error)
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }

  // 제네릭 순서 재정렬 함수 - 코드 중복 제거
  const reorderItems = async <T extends { id: string; name: string }>(
    items: T[],
    sourceId: string,
    targetId: string,
    tableName: 'companies' | 'technology_categories',
    typeLabel: string
  ) => {
    const sourceIndex = items.findIndex(item => item.id === sourceId)
    const targetIndex = items.findIndex(item => item.id === targetId)

    if (sourceIndex === -1 || targetIndex === -1) return

    // 새로운 순서 배열 생성
    const newItems = [...items]
    const [movedItem] = newItems.splice(sourceIndex, 1)
    newItems.splice(targetIndex, 0, movedItem)

    // sort_order 업데이트
    const updates = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1
    }))

    // 데이터베이스 업데이트
    for (const update of updates) {
      await supabase
        .from(tableName)
        .update({ sort_order: update.sort_order, updated_by: admin?.id })
        .eq('id', update.id)
    }

    // 변경 로그 기록
    const sourceName = items.find(item => item.id === sourceId)?.name
    await supabase.from('change_logs').insert({
      table_name: tableName,
      record_id: sourceId,
      operation: 'UPDATE',
      admin_id: admin?.id,
      description: `${typeLabel} 순서 변경: ${sourceName}`
    })

    await loadData()
  }

  const reorderCompanies = (sourceId: string, targetId: string) =>
    reorderItems(companies, sourceId, targetId, 'companies', '기업')

  const reorderCategories = (sourceId: string, targetId: string) =>
    reorderItems(categories, sourceId, targetId, 'technology_categories', '카테고리')

  // 툴팁 핸들러 함수들
  const handleTechMouseEnter = (tech: Technology, event: React.MouseEvent) => {
    setHoveredTech(tech)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleTechMouseLeave = () => {
    setHoveredTech(null)
  }

  const handleTechMouseMove = (event: React.MouseEvent) => {
    if (hoveredTech) {
      setTooltipPosition({ x: event.clientX + 10, y: event.clientY - 10 })
    }
  }

  const handleCloseTechModal = () => {
    setSelectedTech(null)
    setIsTechModalOpen(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">로딩 중...</div>
  }

  return (
    <div className="executive-container space-y-8">
      <div className="executive-card p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-hanwha-text-primary">스마트십 기술 비교</h1>
            <p className="text-lg text-hanwha-text-secondary">
              주요 조선사와 기술 기업들의 스마트십 기술을 체계적으로 비교분석
            </p>
            <div className="flex items-center space-x-4 text-sm text-hanwha-text-muted">
              <span>• 기업 {companies.length}개</span>
              <span>• 기술 카테고리 {categories.length}개</span>
              <span>• 등록된 기술 {technologies.length}개</span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">
                관리자: {admin?.admin_name}
              </span>
            </div>

            <div className="flex items-center space-x-3 bg-hanwha-surface px-4 py-2 rounded-lg border border-hanwha-border shadow-sm">
              <label className="text-sm font-medium text-hanwha-text-secondary">편집 모드</label>
              <button
                onClick={() => setIsStructureEditMode(!isStructureEditMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                  isStructureEditMode
                    ? 'bg-hanwha-primary shadow-md'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    isStructureEditMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                isStructureEditMode
                  ? 'text-hanwha-primary'
                  : 'text-hanwha-text-muted'
              }`}>
                {isStructureEditMode ? 'ON' : 'OFF'}
              </span>
            </div>

            {pendingChanges.length > 0 && (
              <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-700">
                  {pendingChanges.length}개 변경사항
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="executive-table">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-hanwha-text-primary">기술 비교 매트릭스</h2>
              <p className="text-hanwha-text-secondary mt-1">기업별 스마트십 기술 현황</p>
            </div>
          </div>

          {/* 탭 UI */}
          <div className="flex gap-2 border-b border-hanwha-border">
            <button
              onClick={() => setSelectedType('digital')}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedType === 'digital'
                  ? 'text-hanwha-primary border-b-2 border-hanwha-primary bg-hanwha-primary-subtle/20'
                  : 'text-hanwha-text-secondary hover:text-hanwha-text-primary hover:bg-hanwha-surface'
              }`}
            >
              디지털 기술
            </button>
            <button
              onClick={() => setSelectedType('autonomous')}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedType === 'autonomous'
                  ? 'text-hanwha-primary border-b-2 border-hanwha-primary bg-hanwha-primary-subtle/20'
                  : 'text-hanwha-text-secondary hover:text-hanwha-text-primary hover:bg-hanwha-surface'
              }`}
            >
              자율운항 기술
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-hanwha-border shadow-sm">
            <table className="w-full border-collapse bg-hanwha-surface">
              <thead>
                <tr className="bg-gradient-to-r from-hanwha-primary-subtle to-hanwha-primary-subtle/50">
                  <th className="border-r border-hanwha-border p-4 text-left font-semibold bg-hanwha-primary-subtle/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-hanwha-primary rounded-full"></div>
                        <span className="text-hanwha-text-primary font-bold">기술 카테고리</span>
                      </div>
                      {isStructureEditMode && (
                        <>
                          {!isAddingCategory ? (
                            <button
                              onClick={() => setIsAddingCategory(true)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              title="카테고리 추가"
                            >
                              + 카테고리
                            </button>
                          ) : (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="카테고리명"
                                className="text-xs px-2 py-1 border rounded w-24"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddCategory()
                                  if (e.key === 'Escape') {
                                    setIsAddingCategory(false)
                                    setNewCategoryName('')
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={handleAddCategory}
                                className="text-xs bg-blue-500 text-white px-1 py-1 rounded"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setIsAddingCategory(false)
                                  setNewCategoryName('')
                                }}
                                className="text-xs bg-gray-500 text-white px-1 py-1 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </th>
                  {companies.map(company => (
                    <th
                      key={company.id}
                      className={`border-r border-hanwha-border p-4 text-left font-semibold transition-all duration-200 ${
                        isStructureEditMode ? 'cursor-move hover:bg-hanwha-primary-subtle/40' : ''
                      } ${
                        draggedItem?.type === 'company' && draggedItem?.id === company.id
                          ? 'opacity-50 bg-hanwha-primary-subtle/20'
                          : 'bg-gradient-to-b from-hanwha-primary-subtle/30 to-hanwha-primary-subtle/10'
                      } ${
                        dragOverItem?.type === 'company' && dragOverItem?.id === company.id
                          ? 'bg-hanwha-primary-light/20 border-hanwha-primary shadow-md'
                          : ''
                      }`}
                      draggable={isStructureEditMode && editingCol !== company.id}
                      onDragStart={isStructureEditMode && editingCol !== company.id ? (e) => handleDragStart(e, 'company', company.id) : undefined}
                      onDragOver={isStructureEditMode && editingCol !== company.id ? (e) => handleDragOver(e, 'company', company.id) : undefined}
                      onDragLeave={isStructureEditMode && editingCol !== company.id ? handleDragLeave : undefined}
                      onDrop={isStructureEditMode && editingCol !== company.id ? (e) => handleDrop(e, 'company', company.id) : undefined}
                    >
                      <div className="flex items-center justify-between">
                        {editingCol === company.id ? (
                          <div className="flex gap-1 w-full">
                            <input
                              type="text"
                              value={editingCompanyName}
                              onChange={(e) => setEditingCompanyName(e.target.value)}
                              className="text-xs px-2 py-1 border rounded flex-1"
                              placeholder="기업명"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCompanyEdit()
                                if (e.key === 'Escape') handleCancelEditItem()
                              }}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveCompanyEdit}
                              className="text-xs bg-green-500 text-white px-1 py-1 rounded"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEditItem}
                              className="text-xs bg-gray-500 text-white px-1 py-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              {isStructureEditMode && (
                                <svg className="w-3 h-3 text-hanwha-text-muted" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-hanwha-text-primary">{company.name}</span>
                              </div>
                            </div>
                            {isStructureEditMode && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStartEditCompany(company.id, company.name)}
                                  className="p-1 bg-hanwha-primary/10 text-hanwha-primary rounded-md hover:bg-hanwha-primary hover:text-white transition-all duration-200 shadow-sm"
                                  title="편집"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteCompany(company.id, company.name)}
                                  className="p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                                  title="삭제"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                  {isStructureEditMode && (
                    <th className="border border-gray-300 p-3 text-center">
                      {!isAddingCompany ? (
                        <button
                          onClick={() => setIsAddingCompany(true)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          title="기업 추가"
                        >
                          + 기업
                        </button>
                      ) : (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="기업명"
                            className="text-xs px-2 py-1 border rounded w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddCompany()
                              if (e.key === 'Escape') {
                                setIsAddingCompany(false)
                                setNewCompanyName('')
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleAddCompany}
                            className="text-xs bg-blue-500 text-white px-1 py-1 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingCompany(false)
                              setNewCompanyName('')
                            }}
                            className="text-xs bg-gray-500 text-white px-1 py-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`transition-all ${index % 2 === 1 ? "bg-muted/50" : ""} ${
                      isStructureEditMode ? 'cursor-move' : ''
                    } ${
                      draggedItem?.type === 'category' && draggedItem?.id === category.id
                        ? 'opacity-50 bg-gray-100'
                        : ''
                    } ${
                      dragOverItem?.type === 'category' && dragOverItem?.id === category.id
                        ? 'bg-blue-100 border-blue-300'
                        : ''
                    }`}
                    draggable={isStructureEditMode && editingRow !== category.id}
                    onDragStart={isStructureEditMode && editingRow !== category.id ? (e) => handleDragStart(e, 'category', category.id) : undefined}
                    onDragOver={isStructureEditMode && editingRow !== category.id ? (e) => handleDragOver(e, 'category', category.id) : undefined}
                    onDragLeave={isStructureEditMode && editingRow !== category.id ? handleDragLeave : undefined}
                    onDrop={isStructureEditMode && editingRow !== category.id ? (e) => handleDrop(e, 'category', category.id) : undefined}
                  >
                    <td className="border border-gray-300 p-3 font-medium">
                      <div className="flex items-center justify-between">
                        {editingRow === category.id ? (
                          <div className="flex gap-1 w-full">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="text-xs px-2 py-1 border rounded flex-1"
                              placeholder="카테고리명"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCategoryEdit()
                                if (e.key === 'Escape') handleCancelEditItem()
                              }}
                              autoFocus
                            />
                            <button
                              onClick={handleSaveCategoryEdit}
                              className="text-xs bg-green-500 text-white px-1 py-1 rounded"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEditItem}
                              className="text-xs bg-gray-500 text-white px-1 py-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              {isStructureEditMode && (
                                <span className="text-gray-400 text-xs">⋮⋮</span>
                              )}
                              <span>{category.name}</span>
                            </div>
                            {isStructureEditMode && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleStartEditCategory(category.id, category.name)}
                                  className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded hover:bg-blue-600"
                                  title="편집"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id, category.name)}
                                  className="text-xs bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600"
                                  title="삭제"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    {companies.map(company => {
                      const techs = getTechnologies(category.id, company.id)
                      const tech = techs[0]
                      const cellId = `${category.id}-${company.id}`
                      const isEditing = editingCell === cellId

                      return (
                        <td key={company.id} className="border border-gray-300 p-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTechName}
                                onChange={(e) => setNewTechName(e.target.value)}
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                placeholder="기술명 입력"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTechnology(category.id, company.id)
                                  } else if (e.key === 'Escape') {
                                    handleCancelTechEdit()
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveTechnology(category.id, company.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                저장
                              </button>
                              <button
                                onClick={handleCancelTechEdit}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`min-h-[32px] ${
                                isAdmin ? 'cursor-pointer hover:bg-blue-50 rounded' :
                                techs.length > 0 ? 'cursor-pointer hover:bg-gray-50 rounded' : ''
                              }`}
                              onClick={() => handleCellClick(category.id, company.id)}
                            >
                              {techs.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {techs.map((t, idx) => (
                                    <span
                                      key={t.id}
                                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors cursor-pointer text-sm"
                                      onMouseEnter={(e) => handleTechMouseEnter(t, e)}
                                      onMouseLeave={handleTechMouseLeave}
                                      onMouseMove={handleTechMouseMove}
                                    >
                                      {t.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  {isAdmin ? '+ 기술 추가' : '-'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {isAdmin ? (
          <div className="space-y-1">
            <div>✅ 관리자 모드: 편집 기능이 활성화되었습니다.</div>
            <div>💡 팁: 셀 클릭으로 편집, Enter로 저장, ESC로 취소</div>
            {isStructureEditMode && (
              <div>🔄 구조 편집 모드: 기업 열과 카테고리 행을 드래그해서 순서를 변경할 수 있습니다.</div>
            )}
          </div>
        ) : (
          <div>ℹ️ 관리자 인증 후 테이블 편집이 가능합니다.</div>
        )}
      </div>

      {/* 기술 상세 정보 툴팁 */}
      {hoveredTech && (
        <div
          className="fixed z-50 bg-white shadow-2xl rounded-xl border border-gray-200 p-4 max-w-md"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}
        >
          <div className="space-y-3">
            {/* 기술명 */}
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-bold text-lg text-hanwha-text-primary">
                {hoveredTech.title}
              </h3>
            </div>

            {/* 설명 */}
            {hoveredTech.description && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">설명</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {hoveredTech.description}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 기술 상세 정보 모달 (비로그인 유저용) */}
      {isTechModalOpen && selectedTech && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-hanwha-primary-subtle to-hanwha-primary-subtle/50 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-hanwha-primary rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-hanwha-text-primary">기술 상세 정보</h2>
                    <p className="text-sm text-hanwha-text-secondary">스마트십 기술 세부사항</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseTechModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-6">
              {/* 기술명 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-bold text-hanwha-text-primary mb-3">
                  {selectedTech.title}
                </h3>
                {/* 수정일 및 작성자 정보 */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {selectedTech.updated_at && (
                    <span>
                      마지막 수정: {new Date(selectedTech.updated_at).toLocaleDateString('ko-KR')}
                    </span>
                  )}
                  {(selectedTech.updater?.admin_name || selectedTech.creator?.admin_name) && (
                    <>
                      <span>|</span>
                      <span>
                        작성자: {selectedTech.updater?.admin_name || selectedTech.creator?.admin_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 설명 */}
              {selectedTech.description && (
                <div className="bg-hanwha-primary-subtle/10 p-4 rounded-xl">
                  <h4 className="font-bold text-lg text-hanwha-text-primary mb-2 flex items-center gap-2">
                    📋 기술 설명
                  </h4>
                  <p className="text-hanwha-text-secondary leading-relaxed whitespace-pre-wrap">
                    {selectedTech.description}
                  </p>
                </div>
              )}

              {/* 관련 링크 */}
              {(selectedTech.link1 || selectedTech.link2 || selectedTech.link3) && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-bold text-lg text-green-800 mb-3 flex items-center gap-2">
                    🔗 관련 링크
                  </h4>
                  <div className="space-y-2">
                    {selectedTech.link1 && (
                      <a
                        href={selectedTech.link1}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white p-3 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 text-lg">🌐</span>
                          <div>
                            <div className="font-medium text-green-800 group-hover:text-green-900">
                              {selectedTech.link1_title || '링크 1'}
                            </div>
                            <div className="text-sm text-green-600 truncate">{selectedTech.link1}</div>
                          </div>
                          <span className="text-green-500 group-hover:text-green-600 ml-auto">↗</span>
                        </div>
                      </a>
                    )}
                    {selectedTech.link2 && (
                      <a
                        href={selectedTech.link2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white p-3 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 text-lg">🌐</span>
                          <div>
                            <div className="font-medium text-green-800 group-hover:text-green-900">
                              {selectedTech.link2_title || '링크 2'}
                            </div>
                            <div className="text-sm text-green-600 truncate">{selectedTech.link2}</div>
                          </div>
                          <span className="text-green-500 group-hover:text-green-600 ml-auto">↗</span>
                        </div>
                      </a>
                    )}
                    {selectedTech.link3 && (
                      <a
                        href={selectedTech.link3}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white p-3 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 text-lg">🌐</span>
                          <div>
                            <div className="font-medium text-green-800 group-hover:text-green-900">
                              {selectedTech.link3_title || '링크 3'}
                            </div>
                            <div className="text-sm text-green-600 truncate">{selectedTech.link3}</div>
                          </div>
                          <span className="text-green-500 group-hover:text-green-600 ml-auto">↗</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseTechModal}
                  className="px-6 py-2 bg-hanwha-primary text-white rounded-lg hover:bg-hanwha-primary/90 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 셀 편집 모달 */}
      {editingCellData && (
        <CellEditModal
          isOpen={isCellEditModalOpen}
          onClose={() => {
            setIsCellEditModalOpen(false)
            setEditingCellData(null)
          }}
          categoryId={editingCellData.categoryId}
          companyId={editingCellData.companyId}
          existingTechs={getTechnologies(editingCellData.categoryId, editingCellData.companyId)}
          isEditMode={isStructureEditMode}
          onSave={loadData}
          onEditRequest={(tech) => {
            setEditingTech(tech)
            setIsTechFormOpen(true)
          }}
        />
      )}

      {/* 기술 수정 모달 */}
      {isTechFormOpen && (
        <TechnologyForm
          technology={editingTech}
          isOpen={isTechFormOpen}
          onClose={() => {
            setIsTechFormOpen(false)
            setEditingTech(null)
          }}
          onSuccess={() => {
            loadData()
            setIsTechFormOpen(false)
            setEditingTech(null)
          }}
          adminId={admin?.id}
        />
      )}
    </div>
  )
}