// 관리자 데이터 직접 삽입
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zjtlrsztugigjmwrlgxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGxyc3p0dWdpZ2ptd3JsZ3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2ODEsImV4cCI6MjA3NDk4OTY4MX0.FFwVZ_0d3oaVxuRrKwfiswle5iyV03xdIJfmYG5XHO4'

console.log('📝 관리자 데이터 삽입 시작...')

async function insertAdmins() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const admins = [
      {
        admin_code: 'ADMIN001',
        admin_name: '김관리자',
        is_active: true
      },
      {
        admin_code: 'ADMIN002',
        admin_name: '이관리자',
        is_active: true
      },
      {
        admin_code: 'ADMIN003',
        admin_name: '박관리자',
        is_active: true
      }
    ]

    console.log('📊 삽입할 관리자 데이터:', admins)

    // 관리자 데이터 삽입
    const { data, error } = await supabase
      .from('admins')
      .insert(admins)
      .select()

    if (error) {
      console.error('❌ 삽입 오류:', error)

      // RLS 정책 문제일 수 있으므로 개별 삽입 시도
      console.log('\n🔄 개별 삽입 시도...')
      for (const admin of admins) {
        const { data: singleData, error: singleError } = await supabase
          .from('admins')
          .insert([admin])
          .select()

        if (singleError) {
          console.error(`❌ ${admin.admin_code} 삽입 실패:`, singleError)
        } else {
          console.log(`✅ ${admin.admin_code} 삽입 성공:`, singleData)
        }
      }
    } else {
      console.log('✅ 전체 삽입 성공:', data)
    }

    // 삽입 후 확인
    console.log('\n🔍 삽입 후 데이터 확인...')
    const { data: checkData, error: checkError } = await supabase
      .from('admins')
      .select('*')

    if (checkError) {
      console.error('❌ 확인 오류:', checkError)
    } else {
      console.log('✅ 현재 관리자 데이터:', checkData)
    }

  } catch (error) {
    console.error('💥 전체 오류:', error)
  }
}

insertAdmins()