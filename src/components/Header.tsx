'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminAuth from './AdminAuth'

interface Admin {
  id: string
  admin_code: string
  admin_name: string
  is_active: boolean
}

export default function Header() {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-hanwha-surface to-hanwha-primary-subtle/30 backdrop-blur-lg border-b border-hanwha-border shadow-lg">
      <div className="executive-container">
        <div className="flex h-20 items-center justify-between">
          {/* 로고 및 브랜딩 영역 */}
          <div className="flex items-center space-x-8">
            <Link className="flex items-center space-x-3 group" href="/">
              <div className="w-3 h-3 bg-hanwha-primary rounded-full group-hover:scale-110 transition-transform duration-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-hanwha-text-primary leading-tight">
                  스마트십 기술 비교
                </span>
                <span className="text-sm text-hanwha-text-muted font-medium">
                  Smart Ship Technology Comparison
                </span>
              </div>
            </Link>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                className={`relative px-4 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform hover:text-hanwha-primary ${
                  pathname === '/comparison'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : 'text-hanwha-text-primary before:scale-x-0 hover:before:scale-x-100'
                }`}
                href="/comparison"
              >
                기술 비교
              </a>
              <a
                className={`relative px-4 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform ${
                  pathname === '/management'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : `${currentAdmin ? 'text-hanwha-primary' : 'text-hanwha-text-secondary hover:text-hanwha-primary'} before:scale-x-0 hover:before:scale-x-100`
                }`}
                href="/management"
              >
                <span className="flex items-center space-x-2">
                  <span>기능 관리</span>
                  {currentAdmin && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-emerald-600">관리자</span>
                    </div>
                  )}
                </span>
              </a>
            </nav>
          </div>

          {/* 우측 영역 */}
          <div className="flex items-center space-x-4">
            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg hover:bg-hanwha-primary-subtle/50 transition-colors">
                <span className="sr-only">메뉴 열기</span>
                <svg className="h-6 w-6 text-hanwha-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* 관리자 인증 */}
            <div className="bg-hanwha-surface/80 rounded-xl px-1 py-1 shadow-sm border border-hanwha-border/50">
              <AdminAuth onAuthChange={setCurrentAdmin} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}