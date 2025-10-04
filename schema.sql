-- 스마트십 기술 비교 웹페이지 데이터베이스 스키마

-- 관리자 정보 테이블
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_code VARCHAR(20) UNIQUE NOT NULL,
  admin_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 기업/조선사 정보 테이블
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  website TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 기술 카테고리 테이블 (테이블의 열 헤더)
CREATE TABLE IF NOT EXISTS technology_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
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
  admin_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_companies_sort_order ON companies(sort_order);
CREATE INDEX IF NOT EXISTS idx_tech_categories_sort_order ON technology_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_technologies_company_category ON technologies(company_id, category_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_table_record ON change_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_created_at ON change_logs(created_at DESC);

-- 초기 관리자 데이터 삽입
INSERT INTO admins (admin_code, admin_name) VALUES
  ('ADMIN001', '김관리자'),
  ('ADMIN002', '이관리자'),
  ('ADMIN003', '박관리자')
ON CONFLICT (admin_code) DO NOTHING;

-- 초기 기업 데이터 삽입
INSERT INTO companies (name, name_en, description, sort_order) VALUES
  ('HD현대', 'HD Hyundai', 'HD현대중공업 그룹', 1),
  ('삼성중공업', 'Samsung Heavy Industries', '삼성중공업', 2),
  ('콩스버그', 'Kongsberg Maritime', '콩스버그 마리타임', 3),
  ('한국선급', 'Korean Register', '한국선급', 4),
  ('DNV', 'DNV', 'DNV', 5)
ON CONFLICT DO NOTHING;

-- 초기 기술 카테고리 데이터 삽입
INSERT INTO technology_categories (name, name_en, description, sort_order) VALUES
  ('자율운항', 'Autonomous Navigation', '자율운항 시스템', 1),
  ('디지털트윈', 'Digital Twin', '디지털 트윈 기술', 2),
  ('스마트선박', 'Smart Ship', '스마트십 통합 시스템', 3),
  ('원격모니터링', 'Remote Monitoring', '원격 모니터링 시스템', 4),
  ('예측정비', 'Predictive Maintenance', '예측 정비 시스템', 5)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기 가능, 관리자만 쓰기 가능)
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON technology_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view technologies" ON technologies FOR SELECT USING (true);
CREATE POLICY "Anyone can view change_logs" ON change_logs FOR SELECT USING (true);

-- 관리자 정보는 보안상 제한
CREATE POLICY "Only authenticated users can view admins" ON admins FOR SELECT USING (auth.role() = 'authenticated');