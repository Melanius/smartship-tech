-- Supabase SQL Editor에서 실행할 관리자 데이터 수정 스크립트 (올바른 버전)

-- 1. 기존 RLS 정책 임시 비활성화 (관리자 데이터 삽입용)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. 기존 관리자 데이터 삭제 (있다면)
DELETE FROM admins;

-- 3. 관리자 데이터 삽입 (올바른 컬럼명 사용)
INSERT INTO admins (admin_code, admin_name, is_active, created_at) VALUES
('ADMIN001', '김관리자', true, NOW()),
('ADMIN002', '이관리자', true, NOW()),
('ADMIN003', '박관리자', true, NOW());

-- 4. RLS 다시 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. 관리자 테이블을 위한 새로운 정책 생성 (읽기 전용)
DROP POLICY IF EXISTS "Allow read access to admins" ON admins;
CREATE POLICY "Allow read access to admins" ON admins
    FOR SELECT USING (true);

-- 6. 삽입된 데이터 확인
SELECT * FROM admins;