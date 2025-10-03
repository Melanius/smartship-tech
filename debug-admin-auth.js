// 관리자 인증 상태 디버깅 스크립트
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('🔍 관리자 인증 상태 디버깅 시작...')
console.log('📊 환경 변수 확인:')
console.log('- Supabase URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
console.log('- Supabase Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')

async function debugAdminAuth() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 환경 변수가 설정되지 않았습니다')
      console.log('💡 .env.local 파일에 다음을 추가하세요:')
      console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase 클라이언트 생성 완료')

    // 1. 관리자 테이블 확인
    console.log('\n📊 관리자 테이블 확인...')
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')

    if (adminError) {
      console.error('❌ 관리자 테이블 조회 오류:', adminError)
      return
    }

    console.log(`✅ 관리자 데이터 ${admins?.length || 0}개 찾음:`)
    admins?.forEach(admin => {
      console.log(`  - ${admin.admin_code}: ${admin.admin_name} (활성: ${admin.is_active})`)
    })

    // 2. 로컬스토리지 시뮬레이션 (브라우저에서는 localStorage 사용)
    const testAdminCode = 'ADMIN001'
    console.log(`\n🧪 테스트용 관리자 코드로 인증 시뮬레이션: ${testAdminCode}`)

    const { data: adminData, error: authError } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_code', testAdminCode)
      .eq('is_active', true)
      .single()

    if (authError) {
      console.error(`❌ 관리자 인증 오류 (${testAdminCode}):`, authError)
    } else {
      console.log(`✅ 관리자 인증 성공 (${testAdminCode}):`, adminData)
    }

    // 3. 기업 및 카테고리 데이터 확인
    console.log('\n📊 기업 데이터 확인...')
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (companyError) {
      console.error('❌ 기업 데이터 조회 오류:', companyError)
    } else {
      console.log(`✅ 기업 데이터 ${companies?.length || 0}개:`)
      companies?.forEach(company => {
        console.log(`  - ${company.name}`)
      })
    }

    console.log('\n📊 기술 카테고리 확인...')
    const { data: categories, error: categoryError } = await supabase
      .from('technology_categories')
      .select('*')
      .order('name')

    if (categoryError) {
      console.error('❌ 기술 카테고리 조회 오류:', categoryError)
    } else {
      console.log(`✅ 기술 카테고리 ${categories?.length || 0}개:`)
      categories?.forEach(category => {
        console.log(`  - ${category.name}`)
      })
    }

    // 4. 기술 데이터 확인
    console.log('\n📊 기술 데이터 확인...')
    const { data: technologies, error: techError } = await supabase
      .from('technologies')
      .select(`
        *,
        company:companies(name),
        technology_category:technology_categories(name)
      `)
      .order('title')

    if (techError) {
      console.error('❌ 기술 데이터 조회 오류:', techError)
    } else {
      console.log(`✅ 기술 데이터 ${technologies?.length || 0}개:`)
      technologies?.forEach(tech => {
        console.log(`  - ${tech.title} (${tech.company?.name} - ${tech.technology_category?.name})`)
      })
    }

  } catch (error) {
    console.error('💥 전체 오류:', error)
  }
}

debugAdminAuth()