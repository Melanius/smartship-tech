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

      // 페이지 새로고침으로 편집 기능 즉시 활성화
      window.location.reload()

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

    // 페이지 새로고침으로 편집 기능 즉시 비활성화
    window.location.reload()
  }

  if (currentAdmin) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-700">{currentAdmin.admin_name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-2 bg-hanwha-surface border border-hanwha-border rounded-lg hover:bg-hanwha-primary-subtle/20 text-hanwha-text-secondary hover:text-hanwha-primary transition-all duration-200 font-medium"
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
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-hanwha-primary to-hanwha-primary-light text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
        <span>관리자 로그인</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-hanwha-surface rounded-2xl shadow-2xl w-full max-w-md border border-hanwha-border overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-hanwha-primary-subtle to-hanwha-primary-subtle/50 px-6 py-4 border-b border-hanwha-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-hanwha-primary rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-hanwha-text-primary">관리자 인증</h2>
                  <p className="text-sm text-hanwha-text-secondary">시스템 관리 권한 확인</p>
                </div>
              </div>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-hanwha-text-primary mb-2">
                  관리자 코드
                </label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="예: ADMIN001"
                  className="w-full px-4 py-3 border border-hanwha-border rounded-lg focus:outline-none focus:ring-2 focus:ring-hanwha-primary focus:border-hanwha-primary transition-all duration-200 bg-hanwha-background"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-hanwha-primary-subtle/20 p-3 rounded-lg">
                <p className="text-sm text-hanwha-text-muted font-medium">
                  💡 테스트용 관리자 코드
                </p>
                <p className="text-xs text-hanwha-text-muted mt-1">
                  ADMIN001, ADMIN002, ADMIN003
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-hanwha-primary to-hanwha-primary-light text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>확인 중...</span>
                    </div>
                  ) : (
                    '로그인'
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setAdminCode('')
                    setError('')
                  }}
                  className="px-4 py-3 border border-hanwha-border rounded-lg hover:bg-hanwha-primary-subtle/20 text-hanwha-text-secondary hover:text-hanwha-text-primary transition-all duration-200 font-medium"
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