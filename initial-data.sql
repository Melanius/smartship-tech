-- 초기 데이터 삽입 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 기업 데이터 삽입
INSERT INTO companies (name, description) VALUES
('HD현대', '대한민국의 대표적인 조선·해양 기업'),
('삼성중공업', '세계 최고 수준의 조선·해양 기술을 보유한 기업'),
('한화오션', '첨단 조선·해양 기술 전문 기업'),
('콩스버그', '노르웨이의 해양 기술 솔루션 전문 기업'),
('한국선급', '선박 및 해양구조물 검증 전문 기관'),
('DNV', '글로벌 리스크 관리 및 품질 보증 전문 기업'),
('롤스로이스', '선박용 추진 시스템 및 자동화 솔루션 전문'),
('바르질라', '해양 및 에너지 시장의 기술 솔루션 제공');

-- 2. 기술 카테고리 삽입
INSERT INTO technology_categories (name, description) VALUES
('자율운항', '무인 또는 최소 인원으로 운항하는 스마트십 기술'),
('디지털트윈', '선박의 디지털 복제본을 통한 시뮬레이션 및 최적화'),
('스마트선박', 'IoT와 AI를 활용한 지능형 선박 시스템'),
('원격모니터링', '원격지에서 선박 상태를 실시간 모니터링'),
('예측정비', 'AI 기반 장비 고장 예측 및 예방 정비'),
('친환경기술', '탄소 중립 및 환경 보호를 위한 녹색 기술'),
('사이버보안', '선박 IT 시스템 보안 및 해킹 방지 기술');

-- 3. 기술 데이터 삽입 (올바른 컬럼명 사용)
INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'HiNAS',
  'HD현대의 자율운항 시스템으로 AI 기반 항해 지원 기능을 제공합니다.',
  '{"type": "AI Navigation", "features": ["충돌 회피", "자동 항로 계획", "원격 모니터링"]}'::jsonb,
  '{"official": "https://www.hd-hyundai.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = 'HD현대' AND tc.name = '자율운항';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Smart Ship Platform',
  '삼성중공업의 통합 스마트십 플랫폼으로 디지털트윈 기술을 활용합니다.',
  '{"type": "Digital Twin", "features": ["실시간 데이터 수집", "성능 최적화", "예측 분석"]}'::jsonb,
  '{"official": "https://www.shi.samsung.co.kr/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '삼성중공업' AND tc.name = '디지털트윈';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'K-Autonomous Ship',
  '콩스버그의 완전 자율운항선 기술로 무인 운항이 가능합니다.',
  '{"type": "Autonomous", "features": ["완전 무인 운항", "5G 통신", "AI 의사결정"]}'::jsonb,
  '{"official": "https://www.kongsberg.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '콩스버그' AND tc.name = '자율운항';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Fleet Intelligence',
  '롤스로이스의 함대 지능형 관리 시스템으로 원격 모니터링을 제공합니다.',
  '{"type": "Monitoring", "features": ["실시간 선박 추적", "성능 모니터링", "연료 효율성"]}'::jsonb,
  '{"official": "https://www.rolls-royce.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '롤스로이스' AND tc.name = '원격모니터링';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Genius Insight',
  'DNV의 예측 정비 솔루션으로 장비 상태를 사전에 예측합니다.',
  '{"type": "Predictive", "features": ["머신러닝 기반 예측", "정비 스케줄링", "비용 최적화"]}'::jsonb,
  '{"official": "https://www.dnv.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = 'DNV' AND tc.name = '예측정비';

INSERT INTO technologies (title, description, specifications, links, company_id, category_id)
SELECT
  'Smart Analytics',
  '바르질라의 스마트 분석 플랫폼으로 선박 운영을 최적화합니다.',
  '{"type": "Analytics", "features": ["빅데이터 분석", "운영 최적화", "에너지 효율성"]}'::jsonb,
  '{"official": "https://www.wartsila.com/"}'::jsonb,
  c.id,
  tc.id
FROM companies c, technology_categories tc
WHERE c.name = '바르질라' AND tc.name = '스마트선박';

-- 확인용 쿼리
SELECT
  t.title as 기술명,
  t.description as 설명,
  c.name as 기업명,
  tc.name as 카테고리
FROM technologies t
JOIN companies c ON t.company_id = c.id
JOIN technology_categories tc ON t.category_id = tc.id
ORDER BY c.name, tc.name;

-- 결과 확인
SELECT '✅ 기업 데이터' as 테이블, COUNT(*) as 개수 FROM companies
UNION ALL
SELECT '✅ 기술 카테고리 데이터', COUNT(*) FROM technology_categories
UNION ALL
SELECT '✅ 기술 데이터', COUNT(*) FROM technologies;