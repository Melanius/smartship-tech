# Supabase 마이그레이션 가이드

## 이미지 업로드 기능 설정

이미지 업로드 기능을 사용하려면 다음 두 SQL 파일을 Supabase에서 실행해야 합니다.

### 1. DB 테이블 마이그레이션

**파일**: `add_image_url_to_technologies.sql`

Supabase Dashboard > SQL Editor에서 실행:

```sql
-- Add image_url column to technologies table
ALTER TABLE technologies
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment
COMMENT ON COLUMN technologies.image_url IS 'URL to technology representative image stored in Supabase Storage';
```

### 2. Storage Bucket 및 정책 생성

**파일**: `create_technology_images_bucket.sql`

Supabase Dashboard > SQL Editor에서 실행:

```sql
-- Create storage bucket for technology images
INSERT INTO storage.buckets (id, name, public)
VALUES ('technology-images', 'technology-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'technology-images');

-- Policy: Authenticated users can upload
CREATE POLICY IF NOT EXISTS "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'technology-images');

-- Policy: Authenticated users can update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'technology-images')
WITH CHECK (bucket_id = 'technology-images');

-- Policy: Authenticated users can delete
CREATE POLICY IF NOT EXISTS "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'technology-images');
```

## 실행 방법

### Option 1: Supabase Dashboard (권장)

1. Supabase 프로젝트 대시보드 접속
2. 좌측 메뉴에서 **SQL Editor** 선택
3. 새 쿼리 생성
4. `add_image_url_to_technologies.sql` 내용 복사 → 붙여넣기 → 실행
5. 새 쿼리 생성
6. `create_technology_images_bucket.sql` 내용 복사 → 붙여넣기 → 실행

### Option 2: Supabase CLI

```bash
# CLI가 설치되어 있다면
supabase db push

# 또는 개별 파일 실행
supabase db execute --file supabase/migrations/add_image_url_to_technologies.sql
supabase db execute --file supabase/migrations/create_technology_images_bucket.sql
```

## 확인 사항

마이그레이션 완료 후 확인:

1. **테이블 확인**:
   - `technologies` 테이블에 `image_url` 컬럼이 추가되었는지 확인

2. **Storage 확인**:
   - Storage > Buckets에서 `technology-images` bucket이 생성되었는지 확인
   - Bucket이 Public으로 설정되었는지 확인

3. **정책 확인**:
   - Storage > Policies에서 4개의 정책이 생성되었는지 확인
   - Public Access (SELECT)
   - Authenticated Upload (INSERT)
   - Authenticated Update (UPDATE)
   - Authenticated Delete (DELETE)

## 사용 방법

마이그레이션 완료 후:

1. 관리자로 로그인
2. "새 기술 추가" 또는 "기술 정보 편집" 클릭
3. "기술 대표 이미지" 섹션에서 이미지 선택 (최대 5MB)
4. 저장하면 이미지가 Supabase Storage에 업로드됨
5. 기술 상세 모달에서 업로드된 이미지 확인 가능

## 트러블슈팅

### 이미지 업로드 실패

- Storage bucket이 올바르게 생성되었는지 확인
- 정책이 올바르게 설정되었는지 확인
- 파일 크기가 5MB 이하인지 확인
- 이미지 파일 형식이 올바른지 확인 (JPG, PNG, WEBP)

### 이미지가 표시되지 않음

- image_url이 DB에 올바르게 저장되었는지 확인
- Storage bucket이 public으로 설정되었는지 확인
- 브라우저 콘솔에서 CORS 오류가 없는지 확인
