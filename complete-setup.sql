-- 완전한 데이터베이스 설정 스크립트
-- Supabase SQL Editor에서 이 스크립트 전체를 한 번에 실행하세요

-- ========================================
-- 1. 기존 테이블 삭제 (있다면)
-- ========================================
DROP TABLE IF EXISTS change_logs CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS technology_categories CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ========================================
-- 2. 테이블 생성 (schema.sql)
-- ========================================

-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_code VARCHAR(20) UNIQUE NOT NULL,
  admin_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 기업 정보 테이블
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  name_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  website VARCHAR(500),
  country VARCHAR(100),
  founded_year INTEGER,
  employee_count INTEGER,
  logo_url VARCHAR(500),
  headquarters VARCHAR(200),
  business_type VARCHAR(100),
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 기술 카테고리 테이블
CREATE TABLE IF NOT EXISTS technology_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  name_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 기술 상세 정보 테이블
CREATE TABLE IF NOT EXISTS technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES technology_categories(id) ON DELETE CASCADE,
  description TEXT,
  description_en TEXT,
  specifications JSONB,
  features TEXT[],
  links JSONB,
  status VARCHAR(20) DEFAULT 'active',
  release_date DATE,
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, category_id)
);

-- 변경 로그 테이블
CREATE TABLE IF NOT EXISTS change_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  admin_id UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 3. RLS 정책 설정
-- ========================================

-- RLS 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Allow read access to admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow read access to companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow read access to technology_categories" ON technology_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access to technologies" ON technologies FOR SELECT USING (true);
CREATE POLICY "Allow read access to change_logs" ON change_logs FOR SELECT USING (true);

-- ========================================
-- 4. 관리자 데이터 삽입
-- ========================================

-- RLS 임시 비활성화
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 관리자 데이터 삽입
INSERT INTO admins (admin_code, admin_name, is_active, created_at) VALUES
('ADMIN001', '김관리자', true, NOW()),
('ADMIN002', '이관리자', true, NOW()),
('ADMIN003', '박관리자', true, NOW());

-- RLS 다시 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. 초기 데이터 삽입
-- ========================================

-- 기업 데이터 삽입
INSERT INTO companies (name, description) VALUES
('HD현대', '대한민국의 대표적인 조선·해양 기업'),
('삼성중공업', '세계 최고 수준의 조선·해양 기술을 보유한 기업'),
('한화오션', '첨단 조선·해양 기술 전문 기업'),
('콩스버그', '노르웨이의 해양 기술 솔루션 전문 기업'),
('한국선급', '선박 및 해양구조물 검증 전문 기관'),
('DNV', '글로벌 리스크 관리 및 품질 보증 전문 기업'),
('롤스로이스', '선박용 추진 시스템 및 자동화 솔루션 전문'),
('바르질라', '해양 및 에너지 시장의 기술 솔루션 제공');

-- 기술 카테고리 삽입
INSERT INTO technology_categories (name, description) VALUES
('자율운항', '무인 또는 최소 인원으로 운항하는 스마트십 기술'),
('디지털트윈', '선박의 디지털 복제본을 통한 시뮬레이션 및 최적화'),
('스마트선박', 'IoT와 AI를 활용한 지능형 선박 시스템'),
('원격모니터링', '원격지에서 선박 상태를 실시간 모니터링'),
('예측정비', 'AI 기반 장비 고장 예측 및 예방 정비'),
('친환경기술', '탄소 중립 및 환경 보호를 위한 녹색 기술'),
('사이버보안', '선박 IT 시스템 보안 및 해킹 방지 기술');

-- 기술 데이터 삽입
INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'HiNAS',
  'HD현대의 자율운항 시스템으로 AI 기반 항해 지원 기능을 제공합니다.',
  '{"type": "AI Navigation", "features": ["충돌 회피", "자동 항로 계획", "원격 모니터링"]}'::jsonb,
  '{"official": "https://www.hd-hyundai.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = 'HD현대' AND tc.name = '자율운항';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Smart Ship Platform',
  '삼성중공업의 통합 스마트십 플랫폼으로 디지털트윈 기술을 활용합니다.',
  '{"type": "Digital Twin", "features": ["실시간 데이터 수집", "성능 최적화", "예측 분석"]}'::jsonb,
  '{"official": "https://www.shi.samsung.co.kr/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '삼성중공업' AND tc.name = '디지털트윈';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'K-Autonomous Ship',
  '콩스버그의 완전 자율운항선 기술로 무인 운항이 가능합니다.',
  '{"type": "Autonomous", "features": ["완전 무인 운항", "5G 통신", "AI 의사결정"]}'::jsonb,
  '{"official": "https://www.kongsberg.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '콩스버그' AND tc.name = '자율운항';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Fleet Intelligence',
  '롤스로이스의 함대 지능형 관리 시스템으로 원격 모니터링을 제공합니다.',
  '{"type": "Monitoring", "features": ["실시간 선박 추적", "성능 모니터링", "연료 효율성"]}'::jsonb,
  '{"official": "https://www.rolls-royce.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '롤스로이스' AND tc.name = '원격모니터링';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Genius Insight',
  'DNV의 예측 정비 솔루션으로 장비 상태를 사전에 예측합니다.',
  '{"type": "Predictive", "features": ["머신러닝 기반 예측", "정비 스케줄링", "비용 최적화"]}'::jsonb,
  '{"official": "https://www.dnv.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = 'DNV' AND tc.name = '예측정비';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Smart Analytics',
  '바르질라의 스마트 분석 플랫폼으로 선박 운영을 최적화합니다.',
  '{"type": "Analytics", "features": ["빅데이터 분석", "운영 최적화", "에너지 효율성"]}'::jsonb,
  '{"official": "https://www.wartsila.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '바르질라' AND tc.name = '스마트선박';

-- ========================================
-- 6. 설정 완료 확인
-- ========================================

-- 결과 확인
SELECT '✅ 관리자 데이터' as 테이블, COUNT(*) as 개수 FROM admins
UNION ALL
SELECT '✅ 기업 데이터', COUNT(*) FROM companies
UNION ALL
SELECT '✅ 기술 카테고리 데이터', COUNT(*) FROM technology_categories
UNION ALL
SELECT '✅ 기술 데이터', COUNT(*) FROM technologies;

-- 확인용 쿼리
SELECT
  t.title as 기술명,
  t.description as 설명,
  c.name as 기업명,
  tc.name as 카테고리
FROM technologies t
JOIN companies c ON t.company_id = c.id
JOIN technology_categories tc ON t.category_id = tc.id
ORDER BY c.name, tc.name;

-- 관리자 정보 확인
SELECT
  admin_code as 관리자코드,
  admin_name as 관리자명,
  is_active as 활성상태,
  created_at as 생성일시
FROM admins
ORDER BY admin_code;

-- 완료 메시지
SELECT '🎉 데이터베이스 설정이 완료되었습니다!' as 상태;