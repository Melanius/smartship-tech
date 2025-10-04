-- technology_categories 테이블에 type 컬럼 추가 및 기존 데이터 업데이트

-- 1. type 컬럼 추가
ALTER TABLE technology_categories
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'digital';

-- 2. 기존 모든 데이터를 'digital' 타입으로 설정
UPDATE technology_categories
SET type = 'digital'
WHERE type IS NULL OR type = '';

-- 3. type 컬럼에 CHECK 제약 조건 추가 (digital 또는 autonomous만 허용)
ALTER TABLE technology_categories
ADD CONSTRAINT check_category_type
CHECK (type IN ('digital', 'autonomous'));

-- 4. type 컬럼에 인덱스 추가 (성능 최적화)
CREATE INDEX idx_technology_categories_type ON technology_categories(type);

-- 5. 컬럼 설명 추가
COMMENT ON COLUMN technology_categories.type IS '기술 카테고리 타입: digital(디지털) 또는 autonomous(자율운항)';

-- 확인 쿼리
SELECT id, name, type, sort_order
FROM technology_categories
ORDER BY type, sort_order;