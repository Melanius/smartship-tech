-- autonomous 타입 카테고리 3개 추가
-- 기존 카테고리의 최대 sort_order 확인 후 순차적으로 추가

DO $$
DECLARE
  max_order INTEGER;
BEGIN
  -- 기존 최대 sort_order 확인
  SELECT COALESCE(MAX(sort_order), 0) INTO max_order FROM technology_categories;

  -- 3개 카테고리 추가
  INSERT INTO technology_categories (name, type, description, sort_order, created_at, updated_at)
  VALUES
    ('상황인지', 'autonomous', '선박 주변 환경 및 상황을 인지하는 기술', max_order + 1, NOW(), NOW()),
    ('충돌회피', 'autonomous', '장애물 및 타 선박과의 충돌을 예측하고 회피하는 기술', max_order + 2, NOW(), NOW()),
    ('이접안', 'autonomous', '항만 접안 및 이안 작업을 자동화하는 기술', max_order + 3, NOW(), NOW());

  RAISE NOTICE '3개의 autonomous 카테고리가 추가되었습니다.';
END $$;
