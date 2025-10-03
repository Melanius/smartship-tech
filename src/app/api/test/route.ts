import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔗 Supabase 연결 테스트 시작...')

    // 1. 기업 테이블 데이터 조회
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('sort_order')

    if (companiesError) {
      throw new Error(`Companies 조회 오류: ${companiesError.message}`)
    }

    // 2. 기술 카테고리 테이블 데이터 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('technology_categories')
      .select('*')
      .order('sort_order')

    if (categoriesError) {
      throw new Error(`Categories 조회 오류: ${categoriesError.message}`)
    }

    // 3. 기술 정보 테이블 데이터 조회
    const { data: technologies, error: technologiesError } = await supabase
      .from('technologies')
      .select(`
        *,
        companies(name),
        technology_categories(name)
      `)

    if (technologiesError) {
      throw new Error(`Technologies 조회 오류: ${technologiesError.message}`)
    }

    // 4. 관리자 테이블 데이터 조회
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, admin_code, admin_name, is_active, created_at')

    if (adminsError) {
      throw new Error(`Admins 조회 오류: ${adminsError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: '✅ Supabase 연동 테스트 성공!',
      data: {
        companies: companies || [],
        categories: categories || [],
        technologies: technologies || [],
        admins: admins || []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Supabase 연결 테스트 실패:', error)

    return NextResponse.json({
      success: false,
      message: '❌ Supabase 연동 테스트 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}