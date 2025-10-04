'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Technology } from '@/types/database'

interface CellEditModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  companyId: string
  existingTechs: Technology[]
  isEditMode: boolean
  onSave: () => void
}

export default function CellEditModal({
  isOpen,
  onClose,
  categoryId,
  companyId,
  existingTechs,
  isEditMode,
  onSave
}: CellEditModalProps) {
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [newTechTitle, setNewTechTitle] = useState('')
  const [newTechDescription, setNewTechDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadAllTechnologies()
    }
  }, [isOpen])

  const loadAllTechnologies = async () => {
    const { data } = await supabase
      .from('technologies')
      .select('*')
      .order('title')

    if (data) setAllTechnologies(data)
  }

  // 불러올 수 있는 기술 목록 (현재 셀에 없는 기술들)
  const availableTechs = allTechnologies.filter(tech => {
    const alreadyAdded = existingTechs.some(t => t.id === tech.id)
    const matchesCategory = !selectedCategory || tech.category_id === selectedCategory
    const matchesSearch = !searchTerm || tech.title.toLowerCase().includes(searchTerm.toLowerCase())
    return !alreadyAdded && matchesCategory && matchesSearch
  })

  const handleLoadTech = async (tech: Technology) => {
    try {
      // 같은 company_id와 category_id로 기술 추가 (복사)
      const { error } = await supabase
        .from('technologies')
        .insert({
          title: tech.title,
          description: tech.description,
          company_id: companyId,
          category_id: categoryId,
          link1: tech.link1 || null,
          link1_title: tech.link1_title || null,
          link2: tech.link2 || null,
          link2_title: tech.link2_title || null,
          link3: tech.link3 || null,
          link3_title: tech.link3_title || null,
        })

      if (error) throw error

      alert('기술이 추가되었습니다.')
      onSave()
      onClose()
    } catch (error) {
      console.error('기술 불러오기 오류:', error)
      alert('기술 불러오기 중 오류가 발생했습니다.')
    }
  }

  const handleCreateNewTech = async () => {
    if (!newTechTitle.trim()) {
      alert('기술명을 입력해주세요.')
      return
    }

    try {
      const { error } = await supabase
        .from('technologies')
        .insert({
          title: newTechTitle,
          description: newTechDescription || null,
          company_id: companyId,
          category_id: categoryId
        })

      if (error) throw error

      alert('새 기술이 추가되었습니다.')
      setNewTechTitle('')
      setNewTechDescription('')
      onSave()
      onClose()
    } catch (error) {
      console.error('기술 생성 오류:', error)
      alert('기술 생성 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">기술 관리</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* 현재 셀의 기술 목록 */}
        {existingTechs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">현재 기술 ({existingTechs.length}개)</h3>
            <div className="space-y-2">
              {existingTechs.map(tech => (
                <div key={tech.id} className="p-2 bg-blue-50 rounded">
                  {tech.title}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          {/* 새 기술 추가 섹션 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">✨ 새 기술 추가</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="기술명"
                value={newTechTitle}
                onChange={(e) => setNewTechTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                placeholder="설명 (선택사항)"
                value={newTechDescription}
                onChange={(e) => setNewTechDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
              <button
                onClick={handleCreateNewTech}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                새 기술 생성
              </button>
            </div>
          </div>

          {/* 기존 기술 불러오기 섹션 */}
          <div>
            <h3 className="font-semibold mb-3">📥 기존 기술 불러오기</h3>

            {/* 필터 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="기술 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
            </div>

            {/* 불러올 기술 목록 */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableTechs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  불러올 수 있는 기술이 없습니다.
                </p>
              ) : (
                availableTechs.map(tech => (
                  <div key={tech.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{tech.title}</div>
                      {tech.description && (
                        <div className="text-xs text-gray-500 whitespace-pre-wrap">{tech.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleLoadTech(tech)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      불러오기
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
