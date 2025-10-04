-- technology_category_mapping 테이블에 INSERT, UPDATE, DELETE 정책 추가

-- INSERT 정책: 모든 사용자가 삽입 가능
CREATE POLICY "Anyone can insert technology_category_mapping"
ON technology_category_mapping FOR INSERT
WITH CHECK (true);

-- UPDATE 정책: 모든 사용자가 수정 가능
CREATE POLICY "Anyone can update technology_category_mapping"
ON technology_category_mapping FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE 정책: 모든 사용자가 삭제 가능
CREATE POLICY "Anyone can delete technology_category_mapping"
ON technology_category_mapping FOR DELETE
USING (true);

-- 확인
DO $$
BEGIN
  RAISE NOTICE 'RLS 정책이 추가되었습니다.';
  RAISE NOTICE 'technology_category_mapping 테이블에 INSERT, UPDATE, DELETE 가능';
END $$;
