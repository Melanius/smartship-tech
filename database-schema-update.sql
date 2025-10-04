-- 1. UNIQUE 제약조건 제거 (복수 기술 저장을 위해)
ALTER TABLE technologies
DROP CONSTRAINT IF EXISTS technologies_company_id_category_id_key;

-- 2. status 컬럼 삭제
ALTER TABLE technologies
DROP COLUMN IF EXISTS status;

-- 3. 인덱스 재생성 (UNIQUE 제거, 일반 인덱스로)
DROP INDEX IF EXISTS idx_technologies_company_category;
CREATE INDEX idx_technologies_company_category ON technologies(company_id, category_id);
