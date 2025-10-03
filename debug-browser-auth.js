// 브라우저 환경에서의 관리자 인증 시뮬레이션
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('🔍 브라우저 환경 관리자 인증 시뮬레이션...')

async function testBrowserAuth() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 1. localStorage 시뮬레이션 (브라우저에서 발생할 수 있는 시나리오)
    const testAdminCode = 'ADMIN001'
    console.log(`\n🧪 관리자 코드 테스트: ${testAdminCode}`)

    // 2. AdminAuth 컴포넌트와 동일한 로직 시뮬레이션
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_code', testAdminCode.trim())
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ 관리자 인증 실패:', error)
      console.log('상세 오류 정보:')
      console.log('- Code:', error.code)
      console.log('- Message:', error.message)
      console.log('- Details:', error.details)
      console.log('- Hint:', error.hint)
    } else {
      console.log('✅ 관리자 인증 성공:', data)
    }

    // 3. useAdmin 훅과 동일한 로직 테스트
    console.log('\n🔍 useAdmin 훅 로직 테스트...')

    // localStorage에 저장된 것처럼 시뮬레이션
    const storedAdminCode = testAdminCode // localStorage.getItem('admin_code') 시뮬레이션

    if (!storedAdminCode) {
      console.log('❌ localStorage에 admin_code 없음')
      return
    }

    const { data: adminData, error: authError } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_code', storedAdminCode)
      .eq('is_active', true)
      .single()

    if (authError || !adminData) {
      console.error('❌ useAdmin 인증 실패:', authError)
      console.log('localStorage.removeItem("admin_code") 실행될 것')
    } else {
      console.log('✅ useAdmin 인증 성공:', adminData)
      console.log('isAdmin: true')
      console.log('admin 객체:', adminData)
    }

    // 4. 데이터 로딩 테스트 (비교 페이지)
    console.log('\n📊 비교 페이지 데이터 로딩 테스트...')

    const [companiesRes, categoriesRes, technologiesRes] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('technology_categories').select('*').order('name'),
      supabase.from('technologies').select('*')
    ])

    console.log('기업 데이터:', companiesRes.error ? `❌ ${companiesRes.error.message}` : `✅ ${companiesRes.data?.length}개`)
    console.log('카테고리 데이터:', categoriesRes.error ? `❌ ${categoriesRes.error.message}` : `✅ ${categoriesRes.data?.length}개`)
    console.log('기술 데이터:', technologiesRes.error ? `❌ ${technologiesRes.error.message}` : `✅ ${technologiesRes.data?.length}개`)

    // 5. 관리 페이지 데이터 로딩 테스트
    console.log('\n📊 관리 페이지 데이터 로딩 테스트...')

    const { data: techData, error: techError } = await supabase
      .from('technologies')
      .select(`
        *,
        company:companies(name),
        technology_category:technology_categories(name)
      `)
      .order('title')

    if (techError) {
      console.error('❌ 관리 페이지 데이터 로딩 실패:', techError)
    } else {
      console.log('✅ 관리 페이지 데이터 로딩 성공:', techData?.length, '개')
      techData?.slice(0, 2).forEach(tech => {
        console.log(`  - ${tech.title} (${tech.company?.name})`)
      })
    }

  } catch (error) {
    console.error('💥 전체 테스트 오류:', error)
  }
}

testBrowserAuth()