'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Company, TechnologyCategory, Technology, TechnologyFormData } from '@/types/database'

interface TechnologyFormProps {
  technology?: Technology | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  adminId?: string
}

type CompanyOption = Pick<Company, 'id' | 'name'>
type CategoryOption = Pick<TechnologyCategory, 'id' | 'name' | 'type'>

export default function TechnologyForm({
  technology,
  isOpen,
  onClose,
  onSuccess,
  adminId
}: TechnologyFormProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 이미지 관련 상태
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [deleteExistingImage, setDeleteExistingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    acronym_full: '',
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
        acronym_full: technology.acronym_full || '',
        link1: technology.link1 || '',
        link1_title: technology.link1_title || '',
        link2: technology.link2 || '',
        link2_title: technology.link2_title || '',
        link3: technology.link3 || '',
        link3_title: technology.link3_title || ''
      })

      // 기존 이미지 URL 설정
      setExistingImageUrl((technology as any).image_url || null)
      setImageFile(null)
      setImagePreview(null)
      setDeleteExistingImage(false)

      // 기술의 카테고리 목록 로드
      loadTechnologyCategories(technology.id)
    } else {
      // 새로 추가할 때 빈 폼으로 초기화
      setFormData({
        title: '',
        company_id: '',
        description: '',
        acronym_full: '',
        link1: '',
        link1_title: '',
        link2: '',
        link2_title: '',
        link3: '',
        link3_title: ''
      })
      setSelectedCategories([])
      setExistingImageUrl(null)
      setImageFile(null)
      setImagePreview(null)
      setDeleteExistingImage(false)
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
        supabase.from('technology_categories').select('id, name, type').order('name')
      ])

      if (companiesResponse.data) setCompanies(companiesResponse.data)
      if (categoriesResponse.data) setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('회사 및 카테고리 로드 중 오류:', error)
    }
  }

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setDeleteExistingImage(false)
  }

  // 이미지 업로드 함수
  const uploadImage = async (techId: string): Promise<string | null> => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${techId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('technology-images')
        .upload(fileName, imageFile)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('technology-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error)
      throw error
    }
  }

  // 기존 이미지 삭제 함수
  const deleteImage = async (imageUrl: string) => {
    try {
      // URL에서 파일 경로 추출
      const urlParts = imageUrl.split('/technology-images/')
      if (urlParts.length < 2) return

      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from('technology-images')
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('이미지 삭제 중 오류:', error)
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
        acronym_full: formData.acronym_full || null,
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
        let imageUrl = existingImageUrl

        // 기존 이미지 삭제 처리
        if (deleteExistingImage && existingImageUrl) {
          await deleteImage(existingImageUrl)
          imageUrl = null
        }

        // 새 이미지 업로드
        if (imageFile) {
          // 기존 이미지가 있으면 삭제
          if (existingImageUrl && !deleteExistingImage) {
            await deleteImage(existingImageUrl)
          }
          imageUrl = await uploadImage(technology.id)
        }

        const { error: updateError } = await supabase
          .from('technologies')
          .update({
            ...cleanedData,
            image_url: imageUrl,
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

        // 이미지 업로드 (기술 ID가 생성된 후)
        let imageUrl = null
        if (imageFile) {
          imageUrl = await uploadImage(techData.id)

          // 이미지 URL 업데이트
          await supabase
            .from('technologies')
            .update({ image_url: imageUrl })
            .eq('id', techData.id)
        }

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

          {/* 약어 전체 설명 입력 필드 */}
          <div>
            <label className="block text-sm font-medium mb-1">약어 전체 설명 (선택)</label>
            <input
              type="text"
              value={formData.acronym_full}
              onChange={(e) => setFormData(prev => ({ ...prev, acronym_full: e.target.value }))}
              className="w-full p-2 border rounded-md"
              placeholder="예: Maritime Autonomous Surface Ship"
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

            {/* 디지털 기술 */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                디지털 기술
              </h3>
              <div className="grid grid-cols-3 gap-2 p-3 border border-purple-200 rounded-md bg-purple-50/30 max-h-48 overflow-y-auto">
                {categories.filter(cat => cat.type === 'digital').map(category => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded">
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
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 자율운항 기술 */}
            <div>
              <h3 className="text-sm font-semibold text-sky-700 mb-2 flex items-center">
                <span className="w-3 h-3 rounded-full bg-sky-400 mr-2"></span>
                자율운항 기술
              </h3>
              <div className="grid grid-cols-3 gap-2 p-3 border border-sky-200 rounded-md bg-sky-50/30 max-h-48 overflow-y-auto">
                {categories.filter(cat => cat.type === 'autonomous').map(category => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-sky-100 p-2 rounded">
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
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                선택됨: {selectedCategories.length}개
              </p>
            )}
          </div>

          {/* 이미지 업로드 섹션 */}
          <div>
            <label className="block text-sm font-medium mb-3">기술 대표 이미지</label>

            {/* 기존 이미지 표시 */}
            {existingImageUrl && !imagePreview && !deleteExistingImage && (
              <div className="mb-3">
                <img
                  src={existingImageUrl}
                  alt="현재 이미지"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <label className="flex items-center mt-2 text-sm text-red-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteExistingImage}
                    onChange={(e) => setDeleteExistingImage(e.target.checked)}
                    className="mr-2"
                  />
                  기존 이미지 삭제
                </label>
              </div>
            )}

            {/* 새 이미지 미리보기 */}
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  선택 취소
                </button>
              </div>
            )}

            {/* 파일 선택 입력 */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-hanwha-primary file:text-white hover:file:bg-hanwha-primary/90"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP 형식, 최대 5MB
            </p>
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