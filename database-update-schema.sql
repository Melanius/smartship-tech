-- 데이터베이스 스키마 업데이트 스크립트
-- Supabase SQL Editor에서 실행해주세요

-- 1. technologies 테이블에서 불필요한 컬럼 삭제
ALTER TABLE technologies
DROP COLUMN IF EXISTS title_en,
DROP COLUMN IF EXISTS description_en;

-- 2. links 컬럼을 다중 링크 지원을 위해 수정
-- 기존 links 컬럼은 이미 JSON 배열 형태로 설계되어 있지만,
-- 더 명확한 구조를 위해 확인 및 업데이트

-- 기존 links 데이터 백업 (선택사항)
-- SELECT id, links FROM technologies WHERE links IS NOT NULL;

-- links 컬럼이 JSON 배열 타입인지 확인하고 필요시 업데이트
-- 현재 links 컬럼은 이미 JSON 타입이며 배열 구조를 지원합니다
-- 예시 구조: [{"type": "website", "url": "https://example.com", "title": "공식 사이트"}]

-- 3. 업데이트된 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'technologies'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. 샘플 links 데이터 확인
SELECT id, title, links
FROM technologies
WHERE links IS NOT NULL
LIMIT 5;

-- 업데이트 완료 메시지
SELECT '✅ 스키마 업데이트 완료' as status;