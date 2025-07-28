# SignChain 프로젝트 진행 상황

## 프로젝트 정보
- **프로젝트명**: SignChain (블록체인 기반 전자서명 플랫폼)
- **위치**: C:\dev\signchain\BlockchainSignature
- **개발 환경**: Node.js, React, TypeScript, Vite, Express
- **블록체인**: Xphere Network
- **작업 일자**: 2024년 1월

## 🏗️ 프로젝트 구조
```
BlockchainSignature/
├── client/                    # 프론트엔드 (React + TypeScript)
│   ├── src/
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   │   └── contract/    # 계약 모듈 컴포넌트
│   │   │       ├── DocumentEditor.tsx      # 문서 편집기
│   │   │       ├── ContractTracking.tsx    # 계약 추적
│   │   │       └── ContractTemplates.tsx   # 템플릿 관리
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── contract.tsx # 계약 모듈 메인
│   │   │   └── sign-document.tsx # 서명 페이지
│   │   └── lib/            # 유틸리티 및 설정
├── server/                  # 백엔드 (Express)
├── db/                     # 데이터베이스 스키마
└── package.json           # 프로젝트 설정

```

## ✅ 완료된 기능 (2024년 1월 구현)

### 1. **대시보드**
- 계약 현황을 한눈에 볼 수 있는 통계 대시보드
- 전체 계약서, 완료된 계약, 진행 중인 계약, 평균 처리 시간 표시
- 빠른 작업 버튼과 최근 활동 로그

### 2. **계약서 템플릿 관리**
- 표준 근로계약서, 소프트웨어 개발 용역계약서, NDA 등 기본 템플릿 제공
- 템플릿 생성/편집/복사 기능
- 동적 필드 관리 (텍스트, 숫자, 날짜, 선택 등)
- 태그 및 카테고리별 분류

### 3. **문서 편집기**
- 드래그 앤 드롭으로 서명 필드 배치
- 다양한 필드 타입 지원 (서명, 이니셜, 도장, 날짜, 텍스트, 체크박스)
- 실시간 미리보기 및 페이지 네비게이션
- 서명자별 색상 구분

### 4. **다중 서명자 지원**
- 여러 명의 서명자 추가/삭제
- 서명자별 역할 지정 (구매자, 판매자, 증인 등)
- 서명 순서 설정
- 필수/선택 필드 구분

### 5. **실시간 추적**
- 계약서 진행 상황 실시간 모니터링
- 서명자별 상태 확인 (대기중, 열람, 서명 완료)
- 활동 타임라인 (생성, 발송, 열람, 서명 기록)
- IP 주소 및 디바이스 정보 기록

### 6. **서명 페이지**
- 서명자 전용 보안 링크
- 문서 확대/축소 및 페이지 이동
- 다양한 서명 방식 (그리기, 타이핑, 업로드)
- 서명 전 약관 동의
- 필수 필드 검증

### 7. **블록체인 통합**
- 문서 해시를 블록체인에 기록
- 트랜잭션 해시로 검증 가능
- Xphere 네트워크 연동
- 위변조 방지 보장

## 🔧 추가 구현 예정 기능

### 1. **대량 발송 기능**
- CSV 파일로 수신자 목록 업로드
- 개인화된 필드 자동 채우기
- 발송 상태 일괄 관리

### 2. **전자도장 관리**
- 회사/개인 도장 이미지 등록
- 도장 사용 권한 관리
- 도장 사용 이력 추적

### 3. **서명 인증**
- SMS 인증 후 서명
- 이메일 OTP 인증
- 공동인증서 연동

### 4. **계약서 버전 관리**
- 수정 이력 자동 저장
- 버전별 비교 기능
- 이전 버전 복원

### 5. **외부 연동**
- Google Drive 연동
- Dropbox 연동
- OneDrive 연동
- 문서 자동 동기화

### 6. **모바일 서명**
- 반응형 디자인 개선
- 터치 서명 최적화
- 모바일 앱 개발

### 7. **알림 설정**
- 이메일 알림 커스터마이징
- SMS 알림
- 카카오톡 알림채널
- 슬랙/팀즈 연동

### 8. **감사 추적(Audit Trail)**
- 모든 활동 상세 로그
- 법적 증거력 있는 기록
- 로그 다운로드 및 보관
- 접근 권한 로그

### 9. **API/Webhook**
- RESTful API 제공
- Webhook 이벤트 설정
- API 키 관리
- 사용량 모니터링

### 10. **전자세금계산서 연동**
- 계약 완료 시 자동 발행
- 국세청 전자세금계산서 연동
- 세금계산서 템플릿 관리

## 📝 기술 스택

### Frontend
- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.19
- TailwindCSS 3.4.17
- Radix UI Components
- React Hook Form
- Tanstack Query

### Backend
- Node.js
- Express 4.21.2
- Drizzle ORM
- PostgreSQL (Neon)
- SendGrid (이메일)

### Blockchain
- Ethers.js 6.15.0
- Web3.js 4.16.0
- Xphere Network

### Authentication & Security
- Passport.js
- bcrypt
- express-session
- WebAuthn (SimpleWebAuthn)

## 🚀 로컬 개발 환경 실행

```bash
# 프로젝트 디렉토리
cd C:\dev\signchain\BlockchainSignature

# 의존성 설치
npm install

# 개발 서버 실행 (PowerShell)
npm run dev:win

# 또는 두 개의 터미널에서 각각 실행
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
npm run dev:win
```

### 접속 URL
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000

## 📌 주의사항

1. **데이터베이스**: 현재 mock URL로 설정되어 있어 실제 DB 작업은 실패할 수 있음
2. **이메일**: SendGrid API 키 설정 필요
3. **블록체인**: Ethereum/Polygon RPC URL 설정 필요
4. **인증**: 프로덕션 환경에서는 보안 설정 강화 필요

## 🎯 향후 계획

1. **단기 (1-2주)**
   - 대량 발송 기능 구현
   - 전자도장 관리 시스템
   - 모바일 반응형 개선

2. **중기 (1-2개월)**
   - 서명 인증 강화
   - 외부 스토리지 연동
   - API/Webhook 시스템

3. **장기 (3-6개월)**
   - 모바일 앱 개발
   - 전자세금계산서 연동
   - 국제화(i18n) 지원
   - 기업용 관리자 대시보드

## 📞 문의사항
- 프로젝트 관련 문의는 이슈 트래커를 이용해주세요.
- 긴급한 사항은 개발팀에 직접 연락 바랍니다.

---
*최종 업데이트: 2024년 1월*
