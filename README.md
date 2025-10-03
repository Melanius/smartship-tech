# smartship-tech

스마트십 기술 비교 웹사이트

## 프로젝트 개요

조선사와 기술 기업들의 스마트십 기술을 비교하고 관리할 수 있는 웹 애플리케이션입니다.

## 주요 기능

### ✅ 구현 완료된 기능들

1. **관리자 인증 시스템**
   - 코드 기반 관리자 로그인 (ADMIN001, ADMIN002, ADMIN003)
   - localStorage 기반 세션 관리

2. **동적 비교 테이블**
   - 기업(열) vs 기술 카테고리(행) 매트릭스 구조
   - 실시간 데이터 로딩 및 표시

3. **구조 편집 모드**
   - 관리자 전용 편집 기능
   - 구조 편집 스위치 (ON/OFF)

4. **CRUD 기능**
   - **기업 관리**: 추가, 수정, 삭제
   - **기술 카테고리 관리**: 추가, 수정, 삭제
   - **기술 데이터 관리**: 셀 클릭으로 기술 추가/편집

5. **드래그 앤 드롭 순서 변경**
   - 기업 열 순서 변경 (드래그 앤 드롭)
   - 카테고리 행 순서 변경 (드래그 앤 드롭)
   - 실시간 시각적 피드백

6. **인라인 편집**
   - 기업명/카테고리명 직접 편집
   - 키보드 단축키 지원 (Enter: 저장, ESC: 취소)

7. **변경 로그 시스템**
   - 모든 변경사항 추적 및 기록
   - 관리자별 변경 이력 관리

## 기술 스택

- **Frontend**: Next.js 15.5.4, React, TypeScript
- **UI**: Tailwind CSS 4.0, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: 코드 기반 관리자 인증
- **Build Tool**: Turbopack

## 데이터베이스 구조

- `admins`: 관리자 정보
- `companies`: 기업/조선사 정보
- `technology_categories`: 기술 카테고리
- `technologies`: 기술 상세 정보
- `change_logs`: 변경 로그

## 설치 및 실행

1. 프로젝트 클론
```bash
git clone https://github.com/Melanius/smartship-tech.git
cd smartship-tech
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일에 Supabase 설정:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 데이터베이스 스키마 적용
- Supabase SQL Editor에서 `setup-database.sql` 실행

5. 개발 서버 실행
```bash
npm run dev
```

## 사용법

1. **관리자 로그인**: ADMIN001, ADMIN002, ADMIN003 중 하나로 로그인
2. **구조 편집 모드**: 스위치를 ON으로 설정
3. **기능 사용**:
   - 셀 클릭: 기술 추가/편집
   - 드래그 앤 드롭: 순서 변경
   - ✏️ 버튼: 이름 편집
   - 🗑️ 버튼: 삭제
   - + 버튼: 새 항목 추가

## 개발 상태

- ✅ 기본 CRUD 기능
- ✅ 드래그 앤 드롭 순서 변경
- ✅ 인라인 편집
- ✅ 관리자 인증
- ✅ 변경 로그 시스템
- 🚧 기술 상세 정보 관리 (향후 계획)
- 🚧 다국어 지원 (향후 계획)

## 라이선스

MIT License
