import { NextResponse } from 'next/server'

// 임시 관리자 생성 API (개발용)
export async function POST() {
  try {

    // 여기서는 anon key로는 RLS 때문에 안되므로
    // 직접 SQL 실행을 권장하거나 서비스 키 사용 필요

    return NextResponse.json({
      success: false,
      message: 'RLS 정책으로 인해 API를 통한 관리자 생성이 제한됩니다.',
      instruction: '다음 중 하나의 방법을 사용하세요:',
      methods: [
        '1. Supabase 대시보드 > SQL Editor에서 fix-admin-data.sql 실행',
        '2. /debug-admin 페이지에서 현재 상태 확인',
        '3. 수동으로 Supabase 대시보드에서 관리자 데이터 삽입'
      ],
      sql: `
-- Supabase SQL Editor에서 실행:
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
INSERT INTO admins (admin_code, admin_name, is_active) VALUES
('ADMIN001', '김관리자', true),
('ADMIN002', '이관리자', true),
('ADMIN003', '박관리자', true);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to admins" ON admins FOR SELECT USING (true);
      `
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}