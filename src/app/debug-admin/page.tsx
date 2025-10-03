'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAdminPage() {
  const [adminData, setAdminData] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdmins() {
      try {
        console.log('🔍 관리자 데이터 조회 시작...')

        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .order('created_at')

        console.log('📊 Supabase 응답:', { data, error })

        if (error) {
          setError(`데이터베이스 오류: ${error.message}`)
          console.error('❌ Supabase 오류:', error)
        } else {
          setAdminData(data || [])
          console.log('✅ 관리자 데이터 로드 성공:', data)
        }
      } catch (err) {
        console.error('💥 예외 발생:', err)
        setError(`예외 발생: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  const testLogin = async (adminCode: string) => {
    try {
      console.log(`🧪 ${adminCode} 로그인 테스트 시작...`)

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', adminCode)
        .eq('is_active', true)
        .single()

      console.log(`📊 ${adminCode} 테스트 결과:`, { data, error })

      if (error) {
        console.error(`❌ ${adminCode} 오류:`, error)
      } else {
        console.log(`✅ ${adminCode} 성공:`, data)
      }
    } catch (err) {
      console.error(`💥 ${adminCode} 예외:`, err)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔍 관리자 데이터 디버깅</h1>
        <div className="text-blue-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">🔍 관리자 데이터 디버깅</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">❌ 오류 발생</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">📊 데이터베이스 조회 결과</h2>
        <p className="text-blue-700 mb-2">총 {adminData.length}개의 관리자 데이터 발견</p>

        {adminData.length > 0 ? (
          <div className="space-y-2">
            {adminData.map((admin, index) => (
              <div key={admin.id || index} className="bg-white p-3 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>ID:</strong> {admin.id}</div>
                  <div><strong>코드:</strong> {admin.admin_code}</div>
                  <div><strong>이름:</strong> {admin.admin_name}</div>
                  <div><strong>활성:</strong> {admin.is_active ? '✅ 예' : '❌ 아니오'}</div>
                  <div><strong>생성일:</strong> {admin.created_at}</div>
                  <div><strong>수정일:</strong> {admin.updated_at || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-600">관리자 데이터가 없습니다.</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-green-800 mb-3">🧪 로그인 테스트</h2>
        <div className="space-y-2">
          {['ADMIN001', 'ADMIN002', 'ADMIN003'].map(code => (
            <button
              key={code}
              onClick={() => testLogin(code)}
              className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {code} 테스트
            </button>
          ))}
        </div>
        <p className="text-green-700 text-sm mt-2">
          각 버튼을 클릭하면 콘솔(F12)에서 로그인 테스트 결과를 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">ℹ️ 디버깅 정보</h2>
        <div className="text-sm space-y-1">
          <div><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
          <div><strong>현재 시간:</strong> {new Date().toLocaleString('ko-KR')}</div>
          <div><strong>브라우저 콘솔:</strong> F12를 눌러서 자세한 로그를 확인하세요</div>
        </div>
      </div>
    </div>
  )
}