'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const { isAdmin, admin, isLoading } = useAdmin()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [supabaseTest, setSupabaseTest] = useState<any>(null)

  useEffect(() => {
    // localStorage 데이터 확인
    const adminAuth = localStorage.getItem('admin_auth')
    const adminCode = localStorage.getItem('admin_code')
    setLocalStorageData({
      admin_auth: adminAuth ? JSON.parse(adminAuth) : null,
      admin_code: adminCode
    })

    // Supabase 연결 테스트
    testSupabase()
  }, [])

  const testSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .limit(1)

      setSupabaseTest({
        success: !error,
        data: data?.[0],
        error: error?.message
      })
    } catch (error) {
      setSupabaseTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_code')
    window.location.reload()
  }

  const testLogin = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', 'ADMIN001')
        .eq('is_active', true)
        .single()

      if (data) {
        localStorage.setItem('admin_auth', JSON.stringify(data))
        window.location.reload()
      }
    } catch (error) {
      console.error('Test login failed:', error)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">디버깅 페이지</h1>

      {/* useAdmin 훅 상태 */}
      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">useAdmin 훅 상태</h2>
        <div className="space-y-2 text-sm">
          <div>로딩 중: {isLoading ? '✅' : '❌'}</div>
          <div>관리자 인증: {isAdmin ? '✅' : '❌'}</div>
          <div>관리자 정보: {admin ? JSON.stringify(admin, null, 2) : 'null'}</div>
        </div>
      </div>

      {/* localStorage 상태 */}
      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">localStorage 상태</h2>
        <div className="space-y-2 text-sm">
          <div>admin_auth: {localStorageData?.admin_auth ? JSON.stringify(localStorageData.admin_auth, null, 2) : 'null'}</div>
          <div>admin_code: {localStorageData?.admin_code || 'null'}</div>
        </div>
      </div>

      {/* Supabase 연결 테스트 */}
      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Supabase 연결 테스트</h2>
        <div className="space-y-2 text-sm">
          <div>연결 상태: {supabaseTest?.success ? '✅' : '❌'}</div>
          <div>테스트 데이터: {supabaseTest?.data ? JSON.stringify(supabaseTest.data, null, 2) : 'null'}</div>
          {supabaseTest?.error && <div className="text-red-500">오류: {supabaseTest.error}</div>}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-x-4">
        <button
          onClick={clearLocalStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          localStorage 초기화
        </button>
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          테스트 로그인 (ADMIN001)
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          홈페이지로
        </button>
      </div>
    </div>
  )
}