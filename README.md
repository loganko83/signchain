# SignChain - 블록체인 기반 전자서명 플랫폼

SignChain은 세 가지 전문 모듈로 구성된 포괄적인 블록체인 기반 전자서명 플랫폼입니다. React 프론트엔드와 Express.js 백엔드를 기반으로 하며, 문서 검증과 불변성을 위해 블록체인 기술을 활용합니다.

## 🏗️ 모듈 아키텍처

### 📄 계약 모듈 (Contract Module)
- **기능**: 기존 전자서명 기능을 유지하며 블록체인 통합 강화
- **특징**: 계약서 업로드, 서명 요청, 블록체인 등록, 검증
- **사용 사례**: 일반 계약서, 동의서, 법적 문서
- **블록체인**: Ethereum/Polygon 네트워크에 문서 해시 및 서명 기록

### ✅ 결재 모듈 (Approval Module)
- **기능**: Adobe Sign 스타일의 순차 승인 워크플로우
- **특징**: ERP 스타일 결재 프로세스, 다중 승인자, 이메일 통지
- **사용 사례**: 기업 내부 결재, 승인 프로세스, 공람 절차
- **블록체인**: 각 승인 단계별 블록체인 트랜잭션 기록

### 🆔 DID 모듈 (Decentralized Identity Module)
- **기능**: 분산 신원 증명 및 블록체인 인증서 발급
- **특징**: 사업자등록증, 신분증, 여권의 DID 버전 생성
- **사용 사례**: 신원 확인, 자격증명, 기업 인증
- **블록체인**: DID 자격증명의 발급, 검증, 폐기 과정 기록

## 🚀 주요 기능

### 공통 기능
- **🔗 블록체인 통합**: 모든 모듈에서 Ethereum/Polygon 네트워크 지원
- **📧 이메일 알림**: SendGrid를 통한 실시간 알림 시스템
- **🔔 실시간 통지**: WebSocket 기반 푸시 알림
- **🔐 고급 보안**: 2FA, 생체 인증 (WebAuthn)
- **📊 감사 추적**: 완전한 활동 기록 및 블록체인 검증
- **🌐 외부 API**: REST API 및 웹훅 지원

### 모듈별 전용 기능
#### 계약 모듈
- 문서 업로드 및 SHA-256 해싱
- 서명 요청 및 전자서명 수집
- 블록체인 기반 문서 검증
- IPFS 시뮬레이션 분산 저장

#### 결재 모듈
- 순차적 승인 워크플로우 설계
- 다중 승인자 설정 및 관리
- 단계별 승인/반려 처리
- 기업 계정 및 이메일 통합

#### DID 모듈
- 자격증명 발급 (사업자등록증, 신분증, 여권)
- RSA 암호화 기반 DID 생성
- QR 코드 기반 공유 및 검증
- 블록체인 기반 자격증명 폐기

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
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── contract.tsx    # 계약 모듈 페이지
│   │   │   ├── approval.tsx    # 결재 모듈 페이지
│   │   │   ├── did.tsx         # DID 모듈 페이지
│   │   │   ├── dashboard.tsx   # 통합 대시보드
│   │   │   └── ...            # 기타 페이지
│   │   ├── lib/               # 유틸리티 함수
│   │   │   ├── auth.tsx       # 인증 로직
│   │   │   ├── blockchain.ts   # 블록체인 연동
│   │   │   └── crypto.ts      # 암호화 함수
│   │   └── App.tsx            # 메인 앱 컴포넌트
├── server/                     # 백엔드 애플리케이션
│   ├── modules/               # 모듈별 비즈니스 로직
│   │   ├── contract-module.ts  # 계약 모듈
│   │   ├── approval-module.ts  # 결재 모듈
│   │   └── did-module.ts      # DID 모듈
│   ├── routes.ts              # 메인 API 라우트
│   ├── module-routes.ts       # 모듈별 API 라우트
│   ├── storage.ts             # 데이터베이스 로직
│   ├── blockchain.ts          # 블록체인 서비스
│   ├── crypto.ts              # 서버 암호화 함수
│   └── ...                    # 기타 서비스
├── shared/                     # 공유 스키마 및 타입
│   └── schema.ts              # Drizzle 스키마 정의
└── ...                        # 설정 파일들
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

## 🗄️ 데이터베이스 스키마

### 공통 테이블
- **users**: 사용자 정보
- **organizations**: 조직 관리
- **audit_logs**: 감사 로그
- **blockchain_transactions**: 블록체인 트랜잭션
- **notifications**: 알림 데이터

### 계약 모듈 테이블
- **documents**: 문서 메타데이터
- **signatures**: 서명 데이터
- **signature_requests**: 서명 요청

### 결재 모듈 테이블
- **approval_workflows**: 승인 워크플로우
- **approval_steps**: 승인 단계
- **enterprise_roles**: 기업 역할
- **user_roles**: 사용자 역할 할당

### DID 모듈 테이블
- **did_credentials**: DID 자격증명
- **did_verifications**: DID 검증 기록

## 🔐 보안 기능

### 인증 시스템
- **기본 인증**: 이메일/비밀번호
- **2단계 인증**: TOTP (Google Authenticator 등)
- **생체 인증**: WebAuthn (TouchID, FaceID, Windows Hello)
- **세션 관리**: 안전한 세션 처리

### 블록체인 보안
- **다중 네트워크**: Ethereum, Polygon 지원
- **가스비 최적화**: 자동 네트워크 선택
- **트랜잭션 모니터링**: 실시간 확인 추적
- **암호화**: SHA-256 해싱, RSA 서명

## 🌐 API 엔드포인트

### 계약 모듈 API
```
POST   /api/modules/contract/upload              # 계약서 업로드
POST   /api/modules/contract/signature-request   # 서명 요청
POST   /api/modules/contract/sign               # 계약서 서명
GET    /api/modules/contract/verify/{id}        # 계약서 검증
```

### 결재 모듈 API
```
POST   /api/modules/approval/upload             # 결재 문서 업로드
POST   /api/modules/approval/workflow           # 워크플로우 생성
POST   /api/modules/approval/step/complete      # 승인 단계 완료
POST   /api/modules/approval/add-approver       # 승인자 추가
GET    /api/modules/approval/final-document/{id} # 최종 문서 조회
```

### DID 모듈 API
```
POST   /api/modules/did/issue-credential        # 자격증명 발급
POST   /api/modules/did/verify-credential       # 자격증명 검증
POST   /api/modules/did/authenticate            # DID 인증
POST   /api/modules/did/revoke-credential       # 자격증명 폐기
GET    /api/modules/did/user-credentials/{id}   # 사용자 자격증명 조회
POST   /api/modules/did/generate-shareable      # 공유 가능한 자격증명 생성
```

## 🔗 블록체인 통합

### 지원 네트워크
- **Ethereum**: 메인넷 및 테스트넷
- **Polygon**: 낮은 가스비 최적화
- **자동 선택**: 가스비 기반 최적 네트워크 선택

### 모듈별 블록체인 기능

#### 계약 모듈
- 문서 해시 블록체인 등록
- 서명 트랜잭션 기록
- 계약 검증 및 감사

#### 결재 모듈
- 워크플로우 시작 트랜잭션
- 각 승인 단계별 기록
- 최종 승인 완료 증명

#### DID 모듈
- DID 자격증명 발급 기록
- 검증 요청 트랜잭션
- 자격증명 폐기 기록

## 📧 이메일 통합

### SendGrid 기능
- **서명 요청**: 계약 모듈 서명 요청 시 자동 발송
- **승인 알림**: 결재 모듈 워크플로우 단계별 알림
- **DID 알림**: 자격증명 발급 및 검증 완료 통지
- **보안 알림**: 2FA 설정, 로그인 시도 등

## 🔔 실시간 알림

### WebSocket 이벤트
- **문서 업데이트**: 모든 모듈의 문서 상태 변경
- **서명/승인 상태**: 실시간 프로세스 진행 상황
- **블록체인 트랜잭션**: 트랜잭션 확인 및 완료
- **보안 이벤트**: 인증 시도, 계정 변경 등

## 🧪 사용 예시

### 계약 모듈 사용법
1. 계약서 파일 업로드
2. 서명자 이메일 설정
3. 블록체인 등록 및 서명 요청 발송
4. 서명자가 전자서명 완료
5. 블록체인 검증 및 최종 문서 다운로드

### 결재 모듈 사용법
1. 결재 문서 업로드
2. 순차적 승인 워크플로우 설계
3. 각 단계별 승인자 이메일 설정
4. 워크플로우 시작 및 자동 이메일 발송
5. 순차적 승인/반려 처리
6. 최종 승인 완료 시 문서 다운로드

### DID 모듈 사용법
1. 자격증명 유형 선택 (사업자등록증/신분증/여권)
2. 개인/기업 정보 입력
3. 블록체인 DID 자격증명 발급
4. QR 코드 생성 및 공유
5. 검증 요청 시 즉시 블록체인 확인

## 🚀 배포

### Replit 배포
1. Replit에서 프로젝트 열기
2. 환경 변수 설정 (DATABASE_URL, SENDGRID_API_KEY)
3. "Run" 버튼 클릭
4. 자동 배포 완료

### 환경 변수
```bash
DATABASE_URL=your_neon_database_url
SENDGRID_API_KEY=your_sendgrid_api_key
NODE_ENV=production
```

## 🔍 트러블슈팅

### 일반적인 문제

1. **모듈 로딩 오류**
   - TypeScript 컴파일 확인: `npx tsc --noEmit`
   - 의존성 재설치: `rm -rf node_modules && npm install`

2. **블록체인 연결 오류**
   - 환경 변수 확인: ETHEREUM_RPC_URL, POLYGON_RPC_URL
   - 네트워크 상태 확인

3. **데이터베이스 스키마 오류**
   - 스키마 푸시: `npm run db:push`
   - 연결 확인: DATABASE_URL 환경 변수

## 📈 최근 업데이트

### v3.0.0 (2025-01-24) - 모듈 아키텍처
- **세 가지 모듈 시스템**: 계약, 결재, DID 모듈 완전 분리
- **모듈별 블록체인 통합**: 각 모듈 전용 블록체인 트랜잭션 처리
- **전용 API 엔드포인트**: 모듈별 독립적인 API 구조
- **한국어 인터페이스**: 모든 모듈에 한국어 UI 적용
- **고급 워크플로우**: Adobe Sign 스타일 순차 승인 시스템
- **DID 자격증명**: 블록체인 기반 신원 증명 시스템

### v2.0.0 (2025-01-23)
- 외부 API 시스템 완전 구현
- 실시간 WebSocket 알림 시스템
- 고급 보안 기능 (2FA, WebAuthn)
- 블록체인 다중 네트워크 지원
- 포괄적인 API 문서 페이지

## 📞 지원 및 문의

- **기능 요청**: GitHub Issues
- **버그 리포트**: Issue Template 사용
- **보안 문제**: 직접 연락

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

SignChain의 세 가지 모듈 시스템으로 다양한 전자서명 및 인증 요구사항을 한 번에 해결하세요! 🚀