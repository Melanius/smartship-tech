-- 복수 기술 저장을 위한 UNIQUE 제약조건 제거
-- 다양한 이름으로 존재할 수 있는 제약조건들을 모두 제거

-- 가능한 모든 UNIQUE 제약조건 제거
ALTER TABLE technologies DROP CONSTRAINT IF EXISTS technologies_company_id_category_id_key;
ALTER TABLE technologies DROP CONSTRAINT IF EXISTS technologies_company_category_unique;
ALTER TABLE technologies DROP CONSTRAINT IF EXISTS unique_company_category;

-- 기존 UNIQUE 인덱스 제거
DROP INDEX IF EXISTS idx_technologies_company_category;
DROP INDEX IF EXISTS technologies_company_id_category_id_idx;

-- 일반 인덱스로 재생성 (성능을 위해)
CREATE INDEX IF NOT EXISTS idx_technologies_company_category ON technologies(company_id, category_id);
