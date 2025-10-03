'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  name_en: string | null
  description: string | null
  sort_order: number
  created_at: string
}

interface Category {
  id: string
  name: string
  name_en: string | null
  description: string | null
  sort_order: number
  created_at: string
}

interface TestResult {
  companies: Company[]
  categories: Category[]
  error: string | null
}

export default function TestPage() {
  const [result, setResult] = useState<TestResult>({
    companies: [],
    categories: [],
    error: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testSupabase() {
      try {
        console.log('🔗 Supabase 연결 테스트 시작...')

        // 기업 데이터 조회
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('sort_order')

        if (companiesError) {
          throw new Error(`Companies 조회 오류: ${companiesError.message}`)
        }

        // 카테고리 데이터 조회
        const { data: categories, error: categoriesError } = await supabase
          .from('technology_categories')
          .select('*')
          .order('sort_order')

        if (categoriesError) {
          throw new Error(`Categories 조회 오류: ${categoriesError.message}`)
        }

        setResult({
          companies: companies || [],
          categories: categories || [],
          error: null
        })

        console.log('✅ Supabase 연결 테스트 성공!')

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Supabase 연결 테스트 실패:', errorMessage)
        setResult({
          companies: [],
          categories: [],
          error: errorMessage
        })
      } finally {
        setLoading(false)
      }
    }

    testSupabase()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔗 Supabase 연결 테스트</h1>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>데이터베이스 연결 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">🔗 Supabase 연결 테스트</h1>

      {result.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">❌ 연결 실패</h2>
          <p className="text-red-700">{result.error}</p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">✅ 연결 성공!</h2>
          <p className="text-green-700">데이터베이스에서 데이터를 성공적으로 불러왔습니다.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 기업 데이터 */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">🏢 기업 데이터 ({result.companies.length}개)</h2>
          {result.companies.length > 0 ? (
            <div className="space-y-2">
              {result.companies.map((company) => (
                <div key={company.id} className="p-2 border rounded bg-gray-50">
                  <div className="font-medium">{company.name}</div>
                  {company.name_en && (
                    <div className="text-sm text-gray-600">{company.name_en}</div>
                  )}
                  {company.description && (
                    <div className="text-sm text-gray-500 mt-1">{company.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">데이터가 없습니다.</p>
          )}
        </div>

        {/* 카테고리 데이터 */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">🏷️ 기술 카테고리 ({result.categories.length}개)</h2>
          {result.categories.length > 0 ? (
            <div className="space-y-2">
              {result.categories.map((category) => (
                <div key={category.id} className="p-2 border rounded bg-gray-50">
                  <div className="font-medium">{category.name}</div>
                  {category.name_en && (
                    <div className="text-sm text-gray-600">{category.name_en}</div>
                  )}
                  {category.description && (
                    <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        테스트 완료 시간: {new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  )
}