'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminAuth from './AdminAuth'

interface Admin {
  id: string
  admin_code: string
  admin_name: string
  is_active: boolean
}

export default function Header() {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              스마트십 기술 비교
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/comparison"
            >
              기술 비교
            </a>
            <a
              className={`transition-colors hover:text-foreground/80 ${
                currentAdmin ? 'text-foreground' : 'text-foreground/60'
              }`}
              href="/management"
            >
              기능 관리
              {currentAdmin && <span className="ml-1 text-green-600">●</span>}
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="md:hidden">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <span className="sr-only">메뉴 열기</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <AdminAuth onAuthChange={setCurrentAdmin} />
          </nav>
        </div>
      </div>
    </header>
  )
}