'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Admin {
  id: string
  admin_code: string
  admin_name: string
  is_active: boolean
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const adminAuth = localStorage.getItem('admin_auth')
      if (!adminAuth) {
        setAdmin(null)
        setIsLoading(false)
        return
      }

      // 저장된 관리자 객체를 파싱
      const storedAdmin = JSON.parse(adminAuth)

      // 데이터베이스에서 최신 상태 확인
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', storedAdmin.admin_code)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        localStorage.removeItem('admin_auth')
        setAdmin(null)
      } else {
        setAdmin(data)
      }
    } catch (error) {
      console.error('관리자 확인 중 오류:', error)
      localStorage.removeItem('admin_auth')
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_auth')
    setAdmin(null)
  }

  return {
    admin,
    isAdmin: !!admin,
    isLoading,
    checkAdmin,
    logout
  }
}