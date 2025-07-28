# SignChain 계약 모듈 기능 명세서

## 구현 완료된 기능 상세

### 1. 대시보드 (Dashboard)
**파일 위치**: `client/src/pages/contract.tsx` - `TabsContent value="overview"`

#### 주요 통계 카드
- **전체 계약서**: 총 계약서 수 및 이번 달 신규 계약서
- **완료된 계약**: 완료 건수 및 전체 대비 비율
- **진행 중**: 서명 대기 중인 계약서 수
- **평균 처리 시간**: 계약 완료까지 평균 소요 시간

#### 빠른 작업
- 새 계약서 업로드
- 템플릿에서 생성
- 문서 편집기 열기

#### 최근 활동
- 최근 계약서 상태 변경 이력
- 시간순 정렬

### 2. 계약서 템플릿 관리
**파일 위치**: `client/src/components/contract/ContractTemplates.tsx`

#### 기본 제공 템플릿
1. **표준 근로계약서**
   - 필드: 근로자 정보, 직위, 부서, 급여, 계약기간
   - 카테고리: 인사/노무

2. **소프트웨어 개발 용역계약서**
   - 필드: 프로젝트명, 개발범위, 계약금액, 납품일
   - 카테고리: IT/개발

3. **비밀유지계약서(NDA)**
   - 필드: 당사자 정보, 비밀정보 내용, 유효기간
   - 카테고리: 법무/보안

#### 템플릿 기능
- 새 템플릿 생성
- 기존 템플릿 편집
- 템플릿 복사
- 동적 필드 추가/삭제
- 필드 타입: text, number, date, select, textarea
- 변수 치환: {{필드명}} 형식

### 3. 문서 편집기
**파일 위치**: `client/src/components/contract/DocumentEditor.tsx`

#### 서명자 관리 (왼쪽 사이드바)
- 서명자 추가/삭제
- 서명자별 색상 자동 할당
- 이메일/이름 입력
- 할당된 필드 수 표시

#### 서명 도구
- **서명**: 수기 서명 필드
- **이니셜**: 이니셜 필드
- **도장**: 도장/인감 필드
- **날짜**: 날짜 입력 필드
- **텍스트**: 텍스트 입력 필드
- **체크박스**: 동의/확인 체크박스

#### 문서 뷰어 (중앙)
- PDF 문서 표시
- 페이지 네비게이션
- 드래그 앤 드롭으로 필드 배치
- 필드 클릭으로 삭제
- 서명자별 색상으로 필드 구분

#### 필드 속성 (오른쪽 사이드바)
- 필드 라벨 편집
- 필수/선택 설정
- 서명 순서 표시

### 4. 계약서 추적
**파일 위치**: `client/src/components/contract/ContractTracking.tsx`

#### 계약서 개요
- 제목 및 설명
- 생성일/만료일
- 현재 상태 배지
- 진행률 표시

#### 서명자 현황
- 각 서명자별 상태
  - pending: 대기중
  - sent: 발송됨
  - viewed: 열람됨
  - signed: 서명 완료
- 서명 일시
- IP 주소 및 디바이스 정보
- 체크박스로 리마인더 대상 선택

#### 활동 타임라인
- 모든 활동 시간순 표시
- 활동 유형: 생성, 발송, 열람, 서명
- 행위자 및 IP 주소 기록

#### 블록체인 정보
- 문서 해시값
- 트랜잭션 해시
- 익스플로러 링크
- 검증 버튼

### 5. 서명 페이지
**파일 위치**: `client/src/pages/sign-document.tsx`

#### 헤더
- 계약서 제목
- 서명 만료일
- 현재 서명자 정보

#### 진행률 바
- 전체 필드 중 완료된 필드 비율

#### 좌측 사이드바
- 서명 필드 목록
- 완료/미완료 상태
- 필수 필드 표시
- 클릭으로 해당 페이지 이동

#### 문서 뷰어
- 확대/축소 기능
- 페이지 이동
- 회전 기능
- 전체화면 보기
- 필드 클릭으로 입력

#### 서명 모달
- **그리기**: 캔버스에 마우스로 서명
- **타이핑**: 텍스트로 서명 입력
- **업로드**: 서명 이미지 업로드

#### 우측 사이드바
- 전자서명 약관 동의
- 서명 완료 버튼
- 주의사항 안내
- 블록체인 정보 표시

## 기술적 구현 사항

### 상태 관리
- React useState로 로컬 상태 관리
- 계약서 데이터는 부모 컴포넌트에서 관리
- Props로 하위 컴포넌트에 전달

### 스타일링
- Tailwind CSS 사용
- Radix UI 컴포넌트 활용
- 반응형 디자인 (그리드 시스템)

### 파일 구조
```
client/src/
├── pages/
│   ├── contract.tsx        # 메인 계약 모듈
│   └── sign-document.tsx   # 서명 페이지
└── components/
    └── contract/
        ├── DocumentEditor.tsx      # 문서 편집기
        ├── ContractTracking.tsx    # 추적 시스템
        └── ContractTemplates.tsx   # 템플릿 관리
```

### Mock 데이터
현재 실제 백엔드 연동 전이므로 Mock 데이터 사용:
- 계약서 2개 (진행중 1개, 완료 1개)
- 템플릿 3개
- 추적 데이터 샘플

## 향후 백엔드 연동 시 필요 API

### 계약서 관련
- `GET /api/contracts` - 계약서 목록
- `POST /api/contracts` - 계약서 생성
- `GET /api/contracts/:id` - 계약서 상세
- `PUT /api/contracts/:id` - 계약서 수정
- `DELETE /api/contracts/:id` - 계약서 삭제

### 템플릿 관련
- `GET /api/templates` - 템플릿 목록
- `POST /api/templates` - 템플릿 생성
- `PUT /api/templates/:id` - 템플릿 수정
- `DELETE /api/templates/:id` - 템플릿 삭제

### 서명 관련
- `POST /api/contracts/:id/send` - 서명 요청 발송
- `GET /api/sign/:token` - 서명 페이지 데이터
- `POST /api/sign/:token` - 서명 제출
- `POST /api/contracts/:id/remind` - 리마인더 발송

### 추적 관련
- `GET /api/contracts/:id/tracking` - 추적 정보
- `GET /api/contracts/:id/audit` - 감사 로그

### 블록체인 관련
- `POST /api/blockchain/register` - 문서 등록
- `GET /api/blockchain/verify/:hash` - 문서 검증

---
*문서 작성일: 2024년 1월*
