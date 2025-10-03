'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'

interface Technology {
  id: string
  title: string
  description: string | null
  specifications: any | null
  links: any | null
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
  const [editingTech, setEditingTech] = useState<string | null>(null)
  const [showNewTechForm, setShowNewTechForm] = useState(false)

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
          technology_category:technology_categories(name)
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

  const handleEdit = (techId: string) => {
    if (!isAdmin) return
    setEditingTech(techId)
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech) => (
          <div key={tech.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {tech.title}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {tech.technology_category.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{tech.company.name}</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <p className="text-sm text-gray-600">
                {tech.description || '설명이 없습니다.'}
              </p>
              {tech.specifications && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>사양:</strong> {typeof tech.specifications === 'object'
                    ? JSON.stringify(tech.specifications, null, 2)
                    : tech.specifications}
                </div>
              )}
              {tech.links && (
                <div className="text-xs">
                  <a
                    href={typeof tech.links === 'object' ? tech.links.official : tech.links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    관련 링크 →
                  </a>
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(tech.id)}
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
                  onClick={() => handleDelete(tech.id, tech.name)}
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
        ))}

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
    </div>
  );
}