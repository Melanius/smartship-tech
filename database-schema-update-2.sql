-- 링크 제목 컬럼 추가
ALTER TABLE technologies
ADD COLUMN IF NOT EXISTS link1_title TEXT,
ADD COLUMN IF NOT EXISTS link2_title TEXT,
ADD COLUMN IF NOT EXISTS link3_title TEXT;

-- 출시일 컬럼 삭제
ALTER TABLE technologies
DROP COLUMN IF EXISTS release_date;

-- 사양(specifications) 컬럼 삭제
ALTER TABLE technologies
DROP COLUMN IF EXISTS specifications;
