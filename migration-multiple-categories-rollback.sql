-- ========================================
-- Rollback Migration: 다중 카테고리 롤백
-- ========================================
-- 목적: 다중 카테고리 기능을 원래대로 되돌리기
-- 작성일: 2025-01-XX
-- 주의: 이 스크립트는 문제 발생 시에만 실행!

-- Step 1: category_id 복원
-- 각 기술의 첫 번째 카테고리를 category_id로 설정
UPDATE technologies t
SET category_id = (
  SELECT category_id
  FROM technology_category_mapping
  WHERE technology_id = t.id
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE category_id IS NULL
AND EXISTS (
  SELECT 1 FROM technology_category_mapping WHERE technology_id = t.id
);

-- Step 2: category_id를 NOT NULL로 복원
-- 주의: category_id가 여전히 NULL인 행이 있으면 실패함
ALTER TABLE technologies ALTER COLUMN category_id SET NOT NULL;

-- Step 3: UNIQUE 제약조건 재추가
-- 주의: 중복 데이터가 있으면 실패함 (수동으로 정리 필요)
ALTER TABLE technologies ADD CONSTRAINT technologies_company_id_category_id_key
UNIQUE(company_id, category_id);

-- Step 4: RLS 정책 삭제
DROP POLICY IF EXISTS "Anyone can view technology_category_mapping" ON technology_category_mapping;

-- Step 5: 인덱스 삭제
DROP INDEX IF EXISTS idx_tech_category_mapping_tech_id;
DROP INDEX IF EXISTS idx_tech_category_mapping_cat_id;

-- Step 6: 중간 테이블 삭제
DROP TABLE IF EXISTS technology_category_mapping;

-- 롤백 완료 확인
DO $$
BEGIN
  RAISE NOTICE '=== Rollback Complete ===';
  RAISE NOTICE 'technology_category_mapping table dropped';
  RAISE NOTICE 'category_id restored to NOT NULL';
  RAISE NOTICE 'UNIQUE constraint restored';
  RAISE NOTICE 'Database structure reverted to original state';
END $$;

-- 롤백 후 확인 쿼리
-- SELECT COUNT(*) FROM technologies WHERE category_id IS NULL; -- 0이어야 함
-- SELECT company_id, category_id, COUNT(*) FROM technologies GROUP BY company_id, category_id HAVING COUNT(*) > 1; -- 결과 없어야 함
