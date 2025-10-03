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
  technology?: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  adminId?: string
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

  const [formData, setFormData] = useState<TechnologyFormData>({
    title: '',
    company_id: '',
    category_id: '',
    description: '',
    specifications: {},
    features: [],
    link1: '',
    link2: '',
    link3: '',
    status: 'active',
    release_date: ''
  })

  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (technology) {
      setFormData({
        title: technology.title || '',
        company_id: technology.company_id || '',
        category_id: technology.category_id || '',
        description: technology.description || '',
        specifications: technology.specifications || {},
        features: technology.features || [],
        link1: technology.link1 || '',
        link2: technology.link2 || '',
        link3: technology.link3 || '',
        status: technology.status || 'active',
        release_date: technology.release_date || ''
      })
    } else {
      // 새로 추가할 때 빈 폼으로 초기화
      setFormData({
        title: '',
        company_id: '',
        category_id: '',
        description: '',
        specifications: {},
        features: [],
        link1: '',
        link2: '',
        link3: '',
        status: 'active',
        release_date: ''
      })
    }
  }, [technology])

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

    setIsLoading(true)
    try {
      if (technology) {
        // 편집 모드
        const { error } = await supabase
          .from('technologies')
          .update({
            ...formData,
            updated_by: adminId
          })
          .eq('id', technology.id)

        if (error) throw error

        // 변경 로그 기록
        await supabase.from('change_logs').insert({
          table_name: 'technologies',
          operation: 'UPDATE',
          admin_id: adminId,
          description: `수정: ${formData.title}`
        })
      } else {
        // 새로 추가 모드
        const { error } = await supabase
          .from('technologies')
          .insert({
            ...formData,
            created_by: adminId,
            updated_by: adminId
          })

        if (error) throw error

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
    } catch (error) {
      console.error('기술 저장 중 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 링크 핸들러 제거 (개별 링크 입력으로 변경)

  const handleFeaturesChange = (features: string) => {
    const featuresArray = features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0)
    setFormData(prev => ({ ...prev, features: featuresArray }))
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

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-md h-24"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">주요 특징 (한 줄씩 입력)</label>
            <textarea
              value={formData.features?.join('\n') || ''}
              onChange={(e) => handleFeaturesChange(e.target.value)}
              className="w-full p-2 border rounded-md h-20"
              placeholder="특징 1
특징 2
특징 3"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">관련 링크</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">링크 1</label>
                <input
                  type="url"
                  value={formData.link1 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link1: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">링크 2</label>
                <input
                  type="url"
                  value={formData.link2 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, link2: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">링크 3</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">활성</option>
                <option value="development">개발 중</option>
                <option value="discontinued">중단됨</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">출시일</label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
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