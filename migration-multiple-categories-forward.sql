-- ========================================
-- Forward Migration: 다중 카테고리 지원
-- ========================================
-- 목적: 한 기술이 여러 카테고리에 속할 수 있도록 DB 구조 변경
-- 작성일: 2025-01-XX
-- 주의: 실행 전 반드시 백업!

-- Step 1: 중간 테이블 생성
CREATE TABLE IF NOT EXISTS technology_category_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES technology_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT technology_category_mapping_unique UNIQUE(technology_id, category_id)
);

-- Step 2: 기존 데이터 마이그레이션 (technologies → mapping)
-- category_id가 NULL이 아닌 모든 기술의 카테고리 관계를 mapping 테이블로 복사
INSERT INTO technology_category_mapping (technology_id, category_id, created_at)
SELECT id, category_id, created_at
FROM technologies
WHERE category_id IS NOT NULL;

-- Step 3: UNIQUE 제약조건 제거
-- 한 회사가 한 카테고리에 여러 기술을 가질 수 있도록
ALTER TABLE technologies DROP CONSTRAINT IF EXISTS technologies_company_id_category_id_key;

-- Step 4: technologies.category_id를 NULL 허용으로 변경
-- 기존 데이터는 유지하되, 새 기술은 mapping 테이블만 사용
ALTER TABLE technologies ALTER COLUMN category_id DROP NOT NULL;

-- Step 5: 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tech_category_mapping_tech_id ON technology_category_mapping(technology_id);
CREATE INDEX IF NOT EXISTS idx_tech_category_mapping_cat_id ON technology_category_mapping(category_id);

-- Step 6: RLS 정책 추가
ALTER TABLE technology_category_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view technology_category_mapping"
ON technology_category_mapping FOR SELECT USING (true);

-- 마이그레이션 완료 확인
DO $$
BEGIN
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Mapping table created: technology_category_mapping';
  RAISE NOTICE 'Existing data migrated: % rows', (SELECT COUNT(*) FROM technology_category_mapping);
  RAISE NOTICE 'UNIQUE constraint removed from technologies';
  RAISE NOTICE 'category_id is now nullable';
END $$;
