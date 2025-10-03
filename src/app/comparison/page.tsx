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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">기술 비교</h1>
          <p className="text-muted-foreground">
            주요 조선사와 기술 기업들의 스마트십 기술을 비교해보세요
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              관리자: {admin?.admin_name}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">구조 편집:</label>
              <button
                onClick={() => setIsStructureEditMode(!isStructureEditMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isStructureEditMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isStructureEditMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isStructureEditMode ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {isStructureEditMode ? 'ON' : 'OFF'}
              </span>
            </div>
            {pendingChanges.length > 0 && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {pendingChanges.length}개 변경사항
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">비교 테이블</h2>
          {isAdmin && (
            <p className="text-sm text-green-600">
              💡 셀을 클릭하여 기술을 추가하거나 편집할 수 있습니다.
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 p-3 text-left font-medium">
                    <div className="flex items-center justify-between">
                      <span>기술 카테고리</span>
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
                      className={`border border-gray-300 p-3 text-left font-medium transition-all ${
                        isStructureEditMode ? 'cursor-move' : ''
                      } ${
                        draggedItem?.type === 'company' && draggedItem?.id === company.id
                          ? 'opacity-50 bg-gray-100'
                          : ''
                      } ${
                        dragOverItem?.type === 'company' && dragOverItem?.id === company.id
                          ? 'bg-blue-100 border-blue-300'
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
                            <div className="flex items-center gap-2">
                              {isStructureEditMode && (
                                <span className="text-gray-400 text-xs">⋮⋮</span>
                              )}
                              <span>{company.name}</span>
                            </div>
                            {isStructureEditMode && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleStartEditCompany(company.id, company.name)}
                                  className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded hover:bg-blue-600"
                                  title="편집"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteCompany(company.id, company.name)}
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
  );
}