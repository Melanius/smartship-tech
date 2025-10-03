import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅 함수
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 날짜와 시간 포맷팅 함수
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 현재 관리자 정보 가져오기
export function getCurrentAdmin() {
  if (typeof window === 'undefined') return null

  const adminAuth = localStorage.getItem('admin_auth')
  return adminAuth ? JSON.parse(adminAuth) : null
}

// 관리자 인증 확인
export function isAdmin(): boolean {
  return getCurrentAdmin() !== null
}