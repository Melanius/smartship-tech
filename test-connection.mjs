// ES Module 방식으로 Supabase 연결 테스트
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('🔗 Supabase 연결 테스트 시작...')

async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase 클라이언트 생성 성공')

    // 기업 테이블 조회
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ 연결 실패:', error.message)
      return false
    }

    console.log('✅ 데이터베이스 연결 성공!')
    console.log('📊 기업 데이터:', companies)
    return true

  } catch (err) {
    console.error('💥 오류 발생:', err.message)
    return false
  }
}

testConnection()