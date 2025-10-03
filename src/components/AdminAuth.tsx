'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Admin {
  id: string
  admin_code: string
  admin_name: string
  is_active: boolean
}

interface AdminAuthProps {
  onAuthChange: (admin: Admin | null) => void
}

export default function AdminAuth({ onAuthChange }: AdminAuthProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 컴포넌트 마운트 시 저장된 관리자 정보 확인
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_auth')
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin)
        setCurrentAdmin(admin)
        onAuthChange(admin)
      } catch (error) {
        localStorage.removeItem('admin_auth')
      }
    }
  }, [onAuthChange])

  const handleLogin = async () => {
    if (!adminCode.trim()) {
      setError('관리자 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', adminCode.trim())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setError('유효하지 않은 관리자 코드입니다.')
        return
      }

      // 로그인 성공
      setCurrentAdmin(data)
      localStorage.setItem('admin_auth', JSON.stringify(data))
      onAuthChange(data)
      setIsModalOpen(false)
      setAdminCode('')

    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentAdmin(null)
    localStorage.removeItem('admin_auth')
    onAuthChange(null)
  }

  if (currentAdmin) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-green-600 font-medium">✓ 관리자</span>
          <span className="ml-2 text-gray-700">{currentAdmin.admin_name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        관리자 로그인
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">관리자 인증</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관리자 코드
                </label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="예: ADMIN001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="text-xs text-gray-500">
                테스트용 관리자 코드: ADMIN001, ADMIN002, ADMIN003
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '확인 중...' : '로그인'}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setAdminCode('')
                    setError('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}