# SignChain - 블록체인 기반 전자서명 플랫폼

## 📋 프로젝트 개요

SignChain은 블록체인 기술을 활용한 종합적인 전자서명 플랫폼입니다. 문서 무결성 보장, 실시간 협업, 고급 보안 기능, 그리고 외부 API 통합을 제공하는 현대적인 웹 애플리케이션입니다.

### 🚀 주요 기능

- **📄 문서 관리**: 업로드, 미리보기, 메타데이터 관리
- **✍️ 전자서명**: 캔버스 기반 서명 및 텍스트 서명
- **🔗 블록체인 검증**: Ethereum, Polygon 네트워크 지원
- **👥 협업 워크플로우**: 순차 서명, 승인 프로세스, 템플릿 시스템
- **🔔 실시간 알림**: WebSocket 기반 푸시 알림
- **🔐 고급 보안**: 2FA, 생체 인증 (WebAuthn)
- **📧 이메일 통합**: SendGrid를 통한 자동 알림
- **📊 PDF 생성**: 다양한 형식의 문서 다운로드
- **🌐 외부 API**: REST API 및 웹훅 지원
- **📚 API 문서**: 개발자를 위한 포괄적인 문서

## 🏗️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: 세션 기반 + 2FA + WebAuthn
- **Real-time**: Socket.io
- **Email**: SendGrid
- **Blockchain**: ethers.js

### Infrastructure
- **Database**: Neon PostgreSQL
- **File Storage**: 시뮬레이션된 IPFS
- **Deployment**: Replit
- **Environment**: Node.js 20+

## 📁 프로젝트 구조

```
SignChain/
├── client/                     # 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   │   ├── ui/            # Shadcn UI 컴포넌트
│   │   │   ├── navigation.tsx  # 네비게이션 바
│   │   │   ├── notification-center.tsx  # 실시간 알림
│   │   │   ├── security-settings.tsx    # 보안 설정
│   │   │   └── ...            # 기타 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── dashboard.tsx   # 대시보드
│   │   │   ├── documents.tsx   # 문서 관리
│   │   │   ├── verification.tsx # 블록체인 검증
│   │   │   ├── security.tsx    # 보안 설정
│   │   │   ├── api-docs.tsx    # API 문서
│   │   │   └── ...            # 기타 페이지
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── lib/               # 유틸리티 함수
│   │   │   ├── auth.tsx       # 인증 로직
│   │   │   ├── queryClient.ts  # React Query 설정
│   │   │   ├── blockchain.ts   # 블록체인 연동
│   │   │   └── crypto.ts      # 암호화 함수
│   │   ├── App.tsx            # 메인 앱 컴포넌트
│   │   └── main.tsx           # 진입점
│   └── index.html             # HTML 템플릿
├── server/                     # 백엔드 애플리케이션
│   ├── index.ts               # 서버 진입점
│   ├── routes.ts              # 메인 API 라우트
│   ├── api-routes.ts          # 외부 API 라우트
│   ├── storage.ts             # 데이터베이스 로직
│   ├── websocket.ts           # WebSocket 서버
│   ├── security.ts            # 보안 기능 (2FA, WebAuthn)
│   ├── blockchain.ts          # 블록체인 연동
│   ├── email.ts               # 이메일 서비스
│   ├── pdf-generator.ts       # PDF 생성
│   ├── api-keys.ts            # API 키 관리
│   └── vite.ts                # Vite 개발 서버
├── shared/                     # 공유 스키마 및 타입
│   └── schema.ts              # Drizzle 스키마 정의
├── attached_assets/           # 첨부 파일
├── package.json               # 의존성 및 스크립트
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
├── tailwind.config.ts         # Tailwind CSS 설정
├── drizzle.config.ts          # Drizzle ORM 설정
├── replit.md                  # 프로젝트 문서
└── README.md                  # 이 파일
```

## 🚀 개발 환경 설정

### 필수 요구사항

- Node.js 18 이상
- PostgreSQL 데이터베이스
- SendGrid API 키 (이메일 기능)

### 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone <repository-url>
   cd signchain
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # 필요한 환경 변수들
   DATABASE_URL=postgresql://username:password@localhost/signchain
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

4. **데이터베이스 스키마 푸시**
   ```bash
   npm run db:push
   ```

5. **개발 서버 시작**
   ```bash
   npm run dev
   ```

   서버는 http://localhost:5000 에서 실행됩니다.

### 사용 가능한 스크립트

```bash
# 개발 서버 시작
npm run dev

# 데이터베이스 스키마 푸시
npm run db:push

# TypeScript 컴파일
npm run build

# 프로덕션 서버 시작
npm start
```

## 🔧 주요 설정 파일

### TypeScript 설정 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

### Vite 설정 (`vite.config.ts`)
- 프록시 설정으로 API 요청을 백엔드로 전달
- 정적 파일 서빙
- TypeScript 경로 매핑

### Tailwind CSS 설정 (`tailwind.config.ts`)
- Shadcn/ui 컴포넌트 스타일링
- 다크 모드 지원
- 커스텀 색상 및 애니메이션

## 🗄️ 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보
- **documents**: 문서 메타데이터
- **signatures**: 서명 데이터
- **signature_requests**: 서명 요청
- **workflow_templates**: 워크플로우 템플릿
- **document_collaborators**: 협업자 정보
- **notifications**: 알림 데이터
- **user_security**: 보안 설정 (2FA, 생체인증)
- **blockchain_transactions**: 블록체인 트랜잭션
- **organizations**: 조직 관리
- **api_keys**: 외부 API 키
- **webhooks**: 웹훅 설정
- **audit_logs**: 감사 로그

## 🔐 보안 기능

### 인증 시스템
- **기본 인증**: 이메일/비밀번호
- **2단계 인증**: TOTP (Google Authenticator 등)
- **생체 인증**: WebAuthn (TouchID, FaceID, Windows Hello)
- **세션 관리**: 안전한 세션 처리

### API 보안
- **API 키 인증**: SHA-256 해싱
- **요청 제한**: 분당 100회 제한
- **CORS 설정**: 적절한 도메인 제한
- **웹훅 서명**: HMAC-SHA256 검증

## 🌐 외부 API

### 사용 가능한 엔드포인트

```
GET    /api/v1/documents              # 문서 목록 조회
GET    /api/v1/documents/{id}         # 특정 문서 조회
POST   /api/v1/documents              # 문서 업로드
POST   /api/v1/documents/{id}/signature-requests  # 서명 요청
GET    /api/v1/documents/{id}/signatures          # 서명 목록 조회
GET    /api/v1/documents/{id}/verification        # 블록체인 검증
POST   /api/v1/webhooks               # 웹훅 등록
GET    /api/v1/health                 # 헬스 체크
```

### 인증
```bash
curl -H "X-API-Key: sk_your_api_key_here" \
     https://your-domain.com/api/v1/documents
```

### 웹훅 이벤트
- `document.uploaded`: 문서 업로드됨
- `signature.requested`: 서명 요청됨
- `signature.completed`: 서명 완료됨
- `document.verified`: 문서 검증됨
- `workflow.started`: 워크플로우 시작됨
- `workflow.completed`: 워크플로우 완료됨

## 🔗 블록체인 통합

### 지원 네트워크
- **Ethereum**: 메인넷 및 테스트넷
- **Polygon**: 낮은 가스비 최적화
- **자동 네트워크 선택**: 가스비 기반

### 기능
- 문서 해시 저장
- 트랜잭션 모니터링
- 가스비 최적화
- 블록 확인 추적

## 📧 이메일 통합

### SendGrid 설정
```javascript
// 환경 변수 필요
SENDGRID_API_KEY=your_sendgrid_api_key

// 지원 기능
- 서명 요청 이메일
- 완료 알림
- 워크플로우 업데이트
- 보안 알림
```

## 🔔 실시간 알림

### WebSocket 이벤트
- 문서 업데이트
- 서명 상태 변경
- 워크플로우 진행
- 보안 알림
- 시스템 공지

## 🧪 테스트 및 개발

### 개발 도구
- **Hot Reload**: Vite의 빠른 리로딩
- **TypeScript**: 타입 안전성
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅

### 디버깅
- 브라우저 개발자 도구
- VS Code 디버거 지원
- 콘솔 로깅
- 네트워크 패널

## 🚀 배포

### Replit 배포
1. Replit에서 프로젝트 열기
2. 환경 변수 설정
3. "Run" 버튼 클릭
4. 자동 배포 완료

### 환경 변수
```bash
DATABASE_URL=your_database_url
SENDGRID_API_KEY=your_sendgrid_key
NODE_ENV=production
```

## 📖 API 문서

프로젝트 실행 후 `/api-docs` 페이지에서 상세한 API 문서를 확인할 수 있습니다.

- 엔드포인트 목록
- 요청/응답 예제
- 다양한 언어 SDK
- 웹훅 설정 가이드
- 인증 방법

## 🤝 기여 가이드

### 코드 스타일
- TypeScript 사용
- ESLint 규칙 준수
- 컴포넌트 단위 개발
- 재사용 가능한 코드 작성

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
```

## 🔍 트러블슈팅

### 일반적인 문제

1. **데이터베이스 연결 오류**
   ```bash
   # DATABASE_URL 환경 변수 확인
   echo $DATABASE_URL
   ```

2. **포트 충돌**
   ```bash
   # 다른 포트로 실행
   PORT=3000 npm run dev
   ```

3. **패키지 의존성 문제**
   ```bash
   # node_modules 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript 오류**
   ```bash
   # 타입 체크
   npx tsc --noEmit
   ```

### 성능 최적화

- **코드 분할**: React.lazy() 사용
- **이미지 최적화**: WebP 포맷 사용
- **캐싱**: React Query 캐싱 활용
- **번들 크기**: 필요한 라이브러리만 import

## 📞 지원 및 문의

- **이슈 리포팅**: GitHub Issues
- **기능 요청**: Feature Request
- **보안 문제**: 직접 연락

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

## 📈 최근 업데이트

### v2.0.0 (2025-01-23)
- 외부 API 시스템 완전 구현
- 실시간 WebSocket 알림 시스템
- 고급 보안 기능 (2FA, WebAuthn)
- 블록체인 다중 네트워크 지원
- 포괄적인 API 문서 페이지

SignChain을 사용해 주셔서 감사합니다! 🚀