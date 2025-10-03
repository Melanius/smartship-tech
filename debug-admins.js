// Node.js에서 관리자 데이터 확인
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('🔍 관리자 데이터 확인 시작...')

async function debugAdmins() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('✅ Supabase 클라이언트 생성 완료')

    // 1. 모든 관리자 데이터 조회
    console.log('\n📊 모든 관리자 데이터 조회...')
    const { data: allAdmins, error: allError } = await supabase
      .from('admins')
      .select('*')

    if (allError) {
      console.error('❌ 전체 조회 오류:', allError)
    } else {
      console.log('✅ 전체 관리자 데이터:', allAdmins)
      console.log(`총 ${allAdmins?.length || 0}개의 관리자 데이터`)
    }

    // 2. 특정 관리자 코드로 조회 테스트
    for (const code of ['ADMIN001', 'ADMIN002', 'ADMIN003']) {
      console.log(`\n🧪 ${code} 조회 테스트...`)

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', code)

      if (error) {
        console.error(`❌ ${code} 조회 오류:`, error)
      } else {
        console.log(`✅ ${code} 조회 결과:`, data)
      }

      // 활성 관리자로 조회
      const { data: activeData, error: activeError } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_code', code)
        .eq('is_active', true)
        .single()

      if (activeError) {
        console.error(`❌ ${code} 활성 조회 오류:`, activeError)
      } else {
        console.log(`✅ ${code} 활성 조회 결과:`, activeData)
      }
    }

  } catch (error) {
    console.error('💥 전체 오류:', error)
  }
}

debugAdmins()