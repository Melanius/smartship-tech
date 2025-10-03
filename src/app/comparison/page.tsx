'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'

interface Company {
  id: string
  name: string
  description: string | null
}

interface TechnologyCategory {
  id: string
  name: string
  description: string | null
}

interface Technology {
  id: string
  title: string
  description: string | null
  company_id: string
  category_id: string
  specifications: Record<string, unknown> | null
  links: Record<string, unknown> | null
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [companiesRes, categoriesRes, technologiesRes] = await Promise.all([
        supabase.from('companies').select('*').order('sort_order'),
        supabase.from('technology_categories').select('*').order('sort_order'),
        supabase.from('technologies').select('*')
      ])

      if (companiesRes.data) setCompanies(companiesRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (technologiesRes.data) setTechnologies(technologiesRes.data)
    } catch (error) {
      console.error('데이터 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTechnology = (categoryId: string, companyId: string) => {
    return technologies.find(
      t => t.company_id === companyId && t.category_id === categoryId
    )
  }

  const handleCellClick = (categoryId: string, companyId: string) => {
    if (!isAdmin) return
    const cellId = `${categoryId}-${companyId}`
    setEditingCell(cellId)
    const tech = getTechnology(categoryId, companyId)
    setNewTechName(tech?.title || '')
  }

  const handleSaveTechnology = async (categoryId: string, companyId: string) => {
    if (!isAdmin || !admin) return

    try {
      const existingTech = getTechnology(categoryId, companyId)

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

  const reorderCompanies = async (sourceId: string, targetId: string) => {
    const sourceIndex = companies.findIndex(c => c.id === sourceId)
    const targetIndex = companies.findIndex(c => c.id === targetId)

    if (sourceIndex === -1 || targetIndex === -1) return

    // 새로운 순서 배열 생성
    const newCompanies = [...companies]
    const [movedItem] = newCompanies.splice(sourceIndex, 1)
    newCompanies.splice(targetIndex, 0, movedItem)

    // sort_order 업데이트
    const updates = newCompanies.map((company, index) => ({
      id: company.id,
      sort_order: index + 1
    }))

    // 데이터베이스 업데이트
    for (const update of updates) {
      await supabase
        .from('companies')
        .update({ sort_order: update.sort_order, updated_by: admin?.id })
        .eq('id', update.id)
    }

    // 변경 로그 기록
    await supabase.from('change_logs').insert({
      table_name: 'companies',
      record_id: sourceId,
      operation: 'UPDATE',
      admin_id: admin?.id,
      description: `기업 순서 변경: ${companies.find(c => c.id === sourceId)?.name}`
    })

    await loadData()
  }

  const reorderCategories = async (sourceId: string, targetId: string) => {
    const sourceIndex = categories.findIndex(c => c.id === sourceId)
    const targetIndex = categories.findIndex(c => c.id === targetId)

    if (sourceIndex === -1 || targetIndex === -1) return

    // 새로운 순서 배열 생성
    const newCategories = [...categories]
    const [movedItem] = newCategories.splice(sourceIndex, 1)
    newCategories.splice(targetIndex, 0, movedItem)

    // sort_order 업데이트
    const updates = newCategories.map((category, index) => ({
      id: category.id,
      sort_order: index + 1
    }))

    // 데이터베이스 업데이트
    for (const update of updates) {
      await supabase
        .from('technology_categories')
        .update({ sort_order: update.sort_order, updated_by: admin?.id })
        .eq('id', update.id)
    }

    // 변경 로그 기록
    await supabase.from('change_logs').insert({
      table_name: 'technology_categories',
      record_id: sourceId,
      operation: 'UPDATE',
      admin_id: admin?.id,
      description: `카테고리 순서 변경: ${categories.find(c => c.id === sourceId)?.name}`
    })

    await loadData()
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
              <p className="text-hanwha-text-secondary mt-1">조선사별 스마트십 기술 현황</p>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2 bg-hanwha-primary-subtle/30 px-4 py-2 rounded-lg">
                <svg className="w-4 h-4 text-hanwha-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-sm font-medium text-hanwha-primary">
                  셀 클릭으로 기술 정보 편집 가능
                </span>
              </div>
            )}
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
                                <span className="text-xs text-hanwha-text-muted">기업</span>
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
                {categories.map((category, index) => (
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
                      const tech = getTechnology(category.id, company.id)
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
                              className={`min-h-[32px] flex items-center ${
                                isAdmin ? 'cursor-pointer hover:bg-blue-50 rounded' : ''
                              }`}
                              onClick={() => handleCellClick(category.id, company.id)}
                            >
                              {tech ? (
                                <span className="text-blue-600 font-medium">
                                  {tech.title}
                                </span>
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
    </div>
  )
}