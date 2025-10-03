-- 링크 구조 변경: JSON 배열에서 개별 컬럼으로 변경
-- Supabase SQL Editor에서 실행해주세요

-- 1. 새로운 링크 컬럼들 추가
ALTER TABLE technologies
ADD COLUMN IF NOT EXISTS link1 TEXT,
ADD COLUMN IF NOT EXISTS link2 TEXT,
ADD COLUMN IF NOT EXISTS link3 TEXT;

-- 2. 기존 links 데이터를 새로운 컬럼으로 마이그레이션 (가능한 경우)
-- 기존 links가 배열이라면 첫 번째 요소의 URL을 link1에 저장
UPDATE technologies
SET link1 = CASE
  WHEN links IS NOT NULL
    AND jsonb_typeof(links) = 'array'
    AND jsonb_array_length(links) > 0
  THEN links->0->>'url'
  WHEN links IS NOT NULL
    AND jsonb_typeof(links) = 'string'
  THEN links::text
  ELSE NULL
END
WHERE links IS NOT NULL;

-- 3. 기존 links 컬럼 삭제
ALTER TABLE technologies
DROP COLUMN IF EXISTS links;

-- 4. 컬럼에 설명 추가
COMMENT ON COLUMN technologies.link1 IS '첫 번째 관련 링크 URL';
COMMENT ON COLUMN technologies.link2 IS '두 번째 관련 링크 URL';
COMMENT ON COLUMN technologies.link3 IS '세 번째 관련 링크 URL';

-- 5. 업데이트된 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'technologies'
AND table_schema = 'public'
AND column_name IN ('link1', 'link2', 'link3')
ORDER BY ordinal_position;

-- 6. 샘플 데이터 확인
SELECT id, title, link1, link2, link3
FROM technologies
WHERE link1 IS NOT NULL OR link2 IS NOT NULL OR link3 IS NOT NULL
LIMIT 5;

-- 업데이트 완료 메시지
SELECT '✅ 링크 구조 업데이트 완료: links → link1, link2, link3' as status;