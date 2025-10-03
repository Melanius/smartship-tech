-- 스마트십 기술 비교 웹페이지 데이터베이스 설정
-- 단계별 실행을 위한 간소화된 스키마

-- 1단계: 테이블 생성 (RLS 없이)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_code VARCHAR(20) UNIQUE NOT NULL,
  admin_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  website TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technology_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  company_id UUID,
  category_id UUID,
  description TEXT,
  description_en TEXT,
  specifications JSONB,
  features TEXT[],
  links JSONB,
  status VARCHAR(20) DEFAULT 'active',
  release_date DATE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, category_id)
);

CREATE TABLE IF NOT EXISTS change_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL,
  admin_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2단계: 초기 데이터 삽입
INSERT INTO admins (admin_code, admin_name) VALUES
  ('ADMIN001', '마스터 관리자'),
  ('ADMIN002', '보조 관리자'),
  ('ADMIN003', '테스트 관리자')
ON CONFLICT (admin_code) DO NOTHING;

INSERT INTO companies (name, name_en, description, sort_order) VALUES
  ('HD현대', 'HD Hyundai', 'HD현대중공업 그룹', 1),
  ('삼성중공업', 'Samsung Heavy Industries', '삼성중공업', 2),
  ('콩스버그', 'Kongsberg Maritime', '콩스버그 마리타임', 3),
  ('한국선급', 'Korean Register', '한국선급', 4),
  ('DNV', 'DNV', 'DNV', 5)
ON CONFLICT DO NOTHING;

INSERT INTO technology_categories (name, name_en, description, sort_order) VALUES
  ('자율운항', 'Autonomous Navigation', '자율운항 시스템', 1),
  ('디지털트윈', 'Digital Twin', '디지털 트윈 기술', 2),
  ('스마트선박', 'Smart Ship', '스마트십 통합 시스템', 3),
  ('원격모니터링', 'Remote Monitoring', '원격 모니터링 시스템', 4),
  ('예측정비', 'Predictive Maintenance', '예측 정비 시스템', 5)
ON CONFLICT DO NOTHING;

-- 3단계: 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_companies_sort_order ON companies(sort_order);
CREATE INDEX IF NOT EXISTS idx_tech_categories_sort_order ON technology_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_technologies_company_category ON technologies(company_id, category_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_table_record ON change_logs(table_name, record_id);

-- 4단계: RLS 활성화 및 정책 설정
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능한 정책
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON technology_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view technologies" ON technologies FOR SELECT USING (true);
CREATE POLICY "Anyone can view change_logs" ON change_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view admins" ON admins FOR SELECT USING (true);

-- 모든 사용자가 쓰기 가능한 정책 (임시)
CREATE POLICY "Allow all insert on companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on companies" ON companies FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on categories" ON technology_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on categories" ON technology_categories FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on technologies" ON technologies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on technologies" ON technologies FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on technologies" ON technologies FOR DELETE USING (true);
CREATE POLICY "Allow all insert on change_logs" ON change_logs FOR INSERT WITH CHECK (true);