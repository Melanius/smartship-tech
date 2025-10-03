// Supabase 연동 테스트 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경변수에서 설정값 가져오기
const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('🔗 Supabase 연결 테스트 시작...')

async function testSupabaseConnection() {
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('✅ Supabase 클라이언트 생성 성공')

    // 1. 기업 테이블 데이터 조회
    console.log('\n📊 Companies 테이블 조회...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('sort_order')

    if (companiesError) {
      console.error('❌ Companies 조회 오류:', companiesError)
    } else {
      console.log('✅ Companies 데이터:', companies)
    }

    // 2. 기술 카테고리 테이블 데이터 조회
    console.log('\n🏷️ Technology Categories 테이블 조회...')
    const { data: categories, error: categoriesError } = await supabase
      .from('technology_categories')
      .select('*')
      .order('sort_order')

    if (categoriesError) {
      console.error('❌ Categories 조회 오류:', categoriesError)
    } else {
      console.log('✅ Categories 데이터:', categories)
    }

    // 3. 기술 정보 테이블 데이터 조회
    console.log('\n🔧 Technologies 테이블 조회...')
    const { data: technologies, error: technologiesError } = await supabase
      .from('technologies')
      .select(`
        *,
        companies(name),
        technology_categories(name)
      `)

    if (technologiesError) {
      console.error('❌ Technologies 조회 오류:', technologiesError)
    } else {
      console.log('✅ Technologies 데이터:', technologies)
    }

    // 4. 관리자 테이블 데이터 조회
    console.log('\n👤 Admins 테이블 조회...')
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id, admin_code, admin_name, is_active, created_at')

    if (adminsError) {
      console.error('❌ Admins 조회 오류:', adminsError)
    } else {
      console.log('✅ Admins 데이터:', admins)
    }

    console.log('\n🎉 모든 테스트 완료!')

  } catch (error) {
    console.error('💥 연결 테스트 실패:', error.message)
  }
}

testSupabaseConnection()