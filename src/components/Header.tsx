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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
                  스마트십 기술 연구
                </span>
                <span className="text-sm text-hanwha-text-muted font-medium">
                  Smart Ship Technology Research
                </span>
              </div>
            </Link>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-6">
              <a
                className={`relative px-3 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform hover:text-hanwha-primary ${
                  pathname === '/comparison'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : 'text-hanwha-text-primary before:scale-x-0 hover:before:scale-x-100'
                }`}
                href="/comparison"
              >
                솔루션 비교
              </a>
              <a
                className={`relative px-3 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform ${
                  pathname === '/management'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : `${currentAdmin ? 'text-hanwha-primary' : 'text-hanwha-text-secondary hover:text-hanwha-primary'} before:scale-x-0 hover:before:scale-x-100`
                }`}
                href="/management"
              >
                기술 현황
              </a>
              <a
                className={`relative px-3 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform hover:text-hanwha-primary ${
                  pathname === '/technology-trends'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : 'text-hanwha-text-primary before:scale-x-0 hover:before:scale-x-100'
                }`}
                href="/technology-trends"
              >
                기술 트렌드
              </a>
              <a
                className={`relative px-3 py-2 text-lg font-medium transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-hanwha-primary before:transition-transform hover:text-hanwha-primary ${
                  pathname === '/news-clipping'
                    ? 'text-hanwha-primary before:scale-x-100'
                    : 'text-hanwha-text-primary before:scale-x-0 hover:before:scale-x-100'
                }`}
                href="/news-clipping"
              >
                뉴스 클리핑
              </a>
            </nav>
          </div>

          {/* 우측 영역 */}
          <div className="flex items-center space-x-4">
            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-hanwha-primary-subtle/50 transition-colors"
              >
                <span className="sr-only">메뉴 열기</span>
                <svg
                  className="h-6 w-6 text-hanwha-text-primary transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* 관리자 인증 */}
            <div className="bg-hanwha-surface/80 rounded-xl px-1 py-1 shadow-sm border border-hanwha-border/50">
              <AdminAuth onAuthChange={setCurrentAdmin} />
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 패널 */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-hanwha-surface border-t border-hanwha-border">
            <div className="executive-container py-4">
              <nav className="flex flex-col space-y-4">
                <a
                  className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/comparison'
                      ? 'bg-hanwha-primary text-white'
                      : 'text-hanwha-text-primary hover:bg-hanwha-primary-subtle/50'
                  }`}
                  href="/comparison"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  솔루션 비교
                </a>
                <a
                  className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/management'
                      ? 'bg-hanwha-primary text-white'
                      : 'text-hanwha-text-primary hover:bg-hanwha-primary-subtle/50'
                  }`}
                  href="/management"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  기술 현황
                </a>
                <a
                  className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/technology-trends'
                      ? 'bg-hanwha-primary text-white'
                      : 'text-hanwha-text-primary hover:bg-hanwha-primary-subtle/50'
                  }`}
                  href="/technology-trends"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  기술 트렌드
                </a>
                <a
                  className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/news-clipping'
                      ? 'bg-hanwha-primary text-white'
                      : 'text-hanwha-text-primary hover:bg-hanwha-primary-subtle/50'
                  }`}
                  href="/news-clipping"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  뉴스 클리핑
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}