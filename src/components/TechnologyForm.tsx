'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TechnologyFormData } from '@/types/database'

interface Company {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface TechnologyFormProps {
  technology?: Technology | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  adminId?: string
}

interface Technology {
  id: string
  title: string
  company_id: string
  category_id: string
  description?: string | null
  link1?: string | null
  link1_title?: string | null
  link2?: string | null
  link2_title?: string | null
  link3?: string | null
  link3_title?: string | null
}

export default function TechnologyForm({
  technology,
  isOpen,
  onClose,
  onSuccess,
  adminId
}: TechnologyFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    link1: '',
    link1_title: '',
    link2: '',
    link2_title: '',
    link3: '',
    link3_title: ''
  })

  // 편집 모드일 때 기존 데이터로 폼 초기화 및 카테고리 로드
  useEffect(() => {
    if (technology) {
      setFormData({
        title: technology.title || '',
        company_id: technology.company_id || '',
        description: technology.description || '',
        link1: technology.link1 || '',
        link1_title: technology.link1_title || '',
        link2: technology.link2 || '',
        link2_title: technology.link2_title || '',
        link3: technology.link3 || '',
        link3_title: technology.link3_title || ''
      })

      // 기술의 카테고리 목록 로드
      loadTechnologyCategories(technology.id)
    } else {
      // 새로 추가할 때 빈 폼으로 초기화
      setFormData({
        title: '',
        company_id: '',
        description: '',
        link1: '',
        link1_title: '',
        link2: '',
        link2_title: '',
        link3: '',
        link3_title: ''
      })
      setSelectedCategories([])
    }
  }, [technology])

  const loadTechnologyCategories = async (techId: string) => {
    try {
      const { data } = await supabase
        .from('technology_category_mapping')
        .select('category_id')
        .eq('technology_id', techId)

      if (data) {
        setSelectedCategories(data.map(m => m.category_id))
      }
    } catch (error) {
      console.error('카테고리 로드 중 오류:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadCompaniesAndCategories()
    }
  }, [isOpen])

  const loadCompaniesAndCategories = async () => {
    try {
      const [companiesResponse, categoriesResponse] = await Promise.all([
        supabase.from('companies').select('id, name').order('name'),
        supabase.from('technology_categories').select('id, name').order('name')
      ])

      if (companiesResponse.data) setCompanies(companiesResponse.data)
      if (categoriesResponse.data) setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('회사 및 카테고리 로드 중 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId) return

    if (selectedCategories.length === 0) {
      alert('최소 1개의 카테고리를 선택해주세요.')
      return
    }

    setIsLoading(true)
    try {
      // 빈 문자열을 null로 변환하여 데이터베이스 오류 방지
      const cleanedData = {
        ...formData,
        link1: formData.link1 || null,
        link1_title: formData.link1_title || null,
        link2: formData.link2 || null,
        link2_title: formData.link2_title || null,
        link3: formData.link3 || null,
        link3_title: formData.link3_title || null,
        description: formData.description || null
      }

      if (technology) {
        // 편집 모드: 기술 정보 업데이트
        const { error: updateError } = await supabase
          .from('technologies')
          .update({
            ...cleanedData,
            updated_by: adminId
          })
          .eq('id', technology.id)

        if (updateError) throw updateError

        // 기존 카테고리 매핑 삭제
        const { error: deleteError } = await supabase
          .from('technology_category_mapping')
          .delete()
          .eq('technology_id', technology.id)

        if (deleteError) throw deleteError

        // 새 카테고리 매핑 추가
        const mappings = selectedCategories.map(catId => ({
          technology_id: technology.id,
          category_id: catId
        }))

        const { error: mappingError } = await supabase
          .from('technology_category_mapping')
          .insert(mappings)

        if (mappingError) throw mappingError

        // 변경 로그 기록
        await supabase.from('change_logs').insert({
          table_name: 'technologies',
          operation: 'UPDATE',
          admin_id: adminId,
          description: `수정: ${formData.title}`
        })
      } else {
        // 새로 추가 모드: 기술 생성
        const { data: techData, error: insertError } = await supabase
          .from('technologies')
          .insert({
            ...cleanedData,
            created_by: adminId,
            updated_by: adminId
          })
          .select()
          .single()

        if (insertError) throw insertError

        // 카테고리 매핑 추가
        const mappings = selectedCategories.map(catId => ({
          technology_id: techData.id,
          category_id: catId
        }))

        const { error: mappingError } = await supabase
          .from('technology_category_mapping')
          .insert(mappings)

        if (mappingError) throw mappingError

        // 변경 로그 기록
        await supabase.from('change_logs').insert({
          table_name: 'technologies',
          operation: 'CREATE',
          admin_id: adminId,
          description: `추가: ${formData.title}`
        })
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('기술 저장 중 오류:', error)
      console.error('에러 상세:', error.message, error.code, error.details)
      alert(`저장 중 오류가 발생했습니다.\n${error.message || JSON.stringify(error)}`)
    } finally {
      setIsLoading(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {technology ? '기술 정보 편집' : '새 기술 추가'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">기술명</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">회사</label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">회사 선택</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">카테고리 (복수 선택 가능)</label>
            <div className="grid grid-cols-3 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category.id])
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                선택됨: {selectedCategories.length}개
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-md h-40"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">관련 링크</label>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">링크 1 제목</label>
                <input
                  type="text"
                  value={formData.link1_title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link1_title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="예: 공식 홈페이지"
                />
                <label className="block text-xs text-gray-600 mt-1">링크 1 URL</label>
                <input
                  type="url"
                  value={formData.link1 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link1: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">링크 2 제목</label>
                <input
                  type="text"
                  value={formData.link2_title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link2_title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="예: 제품 소개서"
                />
                <label className="block text-xs text-gray-600 mt-1">링크 2 URL</label>
                <input
                  type="url"
                  value={formData.link2 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link2: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">링크 3 제목</label>
                <input
                  type="text"
                  value={formData.link3_title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link3_title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="예: 기술 문서"
                />
                <label className="block text-xs text-gray-600 mt-1">링크 3 URL</label>
                <input
                  type="url"
                  value={formData.link3 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link3: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-hanwha-primary text-white rounded-md hover:bg-hanwha-primary/90 disabled:opacity-50"
            >
              {isLoading ? '저장 중...' : (technology ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}