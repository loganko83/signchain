# 🔐 BlockchainSignature - 블록체인 기반 전자서명 시스템

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue.svg)](https://www.typescriptlang.org/)

> **완전한 MVP 상태** - 실제 운영 가능한 전자서명 시스템

## 🌟 프로젝트 개요

BlockchainSignature는 블록체인 기술을 활용한 차세대 전자서명 시스템입니다. 문서의 무결성을 보장하고, 투명하고 검증 가능한 서명 프로세스를 제공합니다.

### 🚀 실제 서비스
- **웹 애플리케이션**: https://trendy.storydot.kr/signchain/
- **API 서비스**: https://trendy.storydot.kr/signchain/api/v1/
- **상태**: 24/7 운영 중 ✅

## ✨ 주요 기능

### 🔒 **보안 & 인증**
- JWT 기반 사용자 인증 시스템
- SendGrid를 통한 이메일 인증
- 역할 기반 접근 제어 (RBAC)
- API 속도 제한 및 보안 미들웨어

### 📄 **문서 관리**
- 다양한 형식 문서 업로드 지원
- 메타데이터 자동 추출 및 분류
- 버전 관리 및 이력 추적
- IPFS 기반 분산 저장

### ✍️ **전자서명**
- 디지털 서명 생성 및 검증
- 다중 서명자 워크플로우
- 서명 상태 실시간 추적
- 법적 효력 인증서 생성

### ⛓️ **블록체인 연동**
- 문서 해시 블록체인 등록
- 서명 무결성 검증
- 스마트 컨트랙트 기반 처리
- Polygon/Ethereum 테스트넷 지원

### 🆔 **DID (분산 신원)**
- 자격증명 발급 및 관리
- 검증 가능한 디지털 신원
- 개인정보 보호 강화
- 상호 운용성 지원

### 🔄 **워크플로우**
- 승인 단계별 프로세스 관리
- 실시간 알림 시스템
- 협업 도구 통합
- 사용자 정의 워크플로우

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript** - 현대적 UI 프레임워크
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **React Query** - 서버 상태 관리
- **Framer Motion** - 애니메이션 라이브러리

### Backend
- **Node.js** + **Express** - 서버 런타임 및 프레임워크
- **TypeScript** - 타입 안전성 보장
- **JWT** - 사용자 인증
- **SendGrid** - 이메일 서비스
- **Multer** - 파일 업로드 처리

### Database & Storage
- **Supabase PostgreSQL** - 관계형 데이터베이스
- **IPFS** - 분산 파일 저장
- **Redis** - 캐싱 및 세션 저장

### Blockchain
- **Web3.js** + **Ethers.js** - 블록체인 상호작용
- **Polygon Mumbai** - 테스트넷 환경
- **MetaMask** 연동 - 지갑 통합
- **Smart Contracts** - Solidity 기반

### DevOps & Deployment
- **PM2** - 프로세스 관리
- **Apache** - 웹서버 + 리버스 프록시
- **AWS EC2** - 클라우드 호스팅
- **GitHub Actions** - CI/CD 파이프라인

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- Git
- PostgreSQL (또는 Supabase 계정)

### 로컬 개발 환경 구축

#### Windows (PowerShell)
```powershell
# 저장소 클론
git clone https://github.com/loganko83/signchain.git C:\dev\signchain\BlockchainSignature
cd C:\dev\signchain\BlockchainSignature

# 의존성 설치
npm install

# 환경 설정
Copy-Item .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요

# 개발 서버 시작 (프론트엔드 + 백엔드 동시 실행)
npm run dev:all
```

#### Linux/macOS
```bash
# 저장소 클론  
git clone https://github.com/loganko83/signchain.git
cd signchain

# 의존성 설치
npm install

# 환경 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요

# 개발 서버 시작
npm run dev:all
```

### 접속 확인
- **프론트엔드**: http://localhost:5174
- **백엔드 API**: http://localhost:3000
- **API 문서**: http://localhost:3000/api-docs

## 📁 프로젝트 구조

```
BlockchainSignature/
├── 📁 frontend/                 # React 프론트엔드
│   ├── 📁 src/
│   │   ├── 📁 components/       # UI 컴포넌트
│   │   ├── 📁 pages/           # 페이지 컴포넌트
│   │   ├── 📁 hooks/           # 커스텀 훅
│   │   ├── 📁 utils/           # 유틸리티 함수
│   │   └── 📁 types/           # TypeScript 타입 정의
│   └── 📄 package.json
├── 📁 backend/                  # Express 백엔드
│   ├── 📁 src/
│   │   ├── 📁 routes/          # API 라우트
│   │   ├── 📁 models/          # 데이터 모델
│   │   ├── 📁 middleware/      # 미들웨어
│   │   ├── 📁 services/        # 비즈니스 로직
│   │   └── 📁 utils/           # 유틸리티 함수
│   └── 📄 package.json
├── 📁 contracts/               # 스마트 컨트랙트
├── 📁 doc/                     # 프로젝트 문서
├── 📄 package.json            # 루트 패키지 설정
├── 📄 README.md              # 이 파일
└── 📄 .env.example           # 환경변수 템플릿
```

## 🌐 API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 사용자 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /api/v1/auth/verify` - 토큰 검증

### 문서 관리
- `GET /api/v1/documents` - 문서 목록 조회
- `POST /api/v1/documents` - 문서 업로드
- `GET /api/v1/documents/:id` - 문서 상세 조회
- `PUT /api/v1/documents/:id` - 문서 수정
- `DELETE /api/v1/documents/:id` - 문서 삭제

### 전자서명
- `POST /api/v1/signatures` - 서명 생성
- `GET /api/v1/signatures/:id` - 서명 조회
- `POST /api/v1/signatures/:id/verify` - 서명 검증

### 블록체인
- `POST /api/v1/blockchain/register` - 블록체인 등록
- `GET /api/v1/blockchain/verify/:hash` - 블록체인 검증

## 🔧 환경 변수 설정

`.env` 파일에 다음 환경변수들을 설정하세요:

```env
# 기본 설정
PORT=3000
NODE_ENV=development

# 데이터베이스
DATABASE_URL=your_postgresql_url

# JWT 인증
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 이메일 (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# 블록체인 (옵션)
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key

# IPFS (옵션)
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## 🧪 테스트 실행

```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage
```

## 📊 성능 모니터링

### 시스템 상태 확인
- **헬스체크**: `/api/v1/health`
- **메트릭**: `/api/v1/metrics`
- **로그**: PM2 대시보드

### 성능 최적화
- API 응답 캐싱
- 데이터베이스 쿼리 최적화
- CDN을 통한 정적 파일 서빙
- 이미지 압축 및 최적화

## 🔐 보안 고려사항

### 구현된 보안 기능
- ✅ HTTPS 강제 사용
- ✅ CORS 정책 적용
- ✅ API 속도 제한
- ✅ SQL 인젝션 방지
- ✅ XSS 보호
- ✅ JWT 토큰 기반 인증
- ✅ 파일 업로드 검증
- ✅ 민감 정보 환경변수 관리

### 추가 보안 권장사항
- 정기적인 의존성 업데이트
- 보안 헤더 강화
- 로그 모니터링 및 알림
- 정기적인 백업 수행

## 📈 확장 계획

### 단기 (1-3개월)
- [ ] 모바일 반응형 개선
- [ ] PWA 기능 추가
- [ ] 다국어 지원
- [ ] 성능 최적화

### 중기 (3-6개월)
- [ ] 실제 블록체인 네트워크 연동
- [ ] 엔터프라이즈 기능 추가
- [ ] API 버전 관리
- [ ] 마이크로서비스 아키텍처 전환

### 장기 (6개월+)
- [ ] AI 기반 문서 분석
- [ ] 블록체인 크로스체인 지원
- [ ] 대규모 확장성 개선
- [ ] 컴플라이언스 인증 획득

## 🤝 기여하기

### 개발 워크플로우
1. Fork 프로젝트
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

### 코딩 표준
- TypeScript 엄격 모드 사용
- ESLint + Prettier 설정 준수
- 커밋 메시지 컨벤션 따르기
- 테스트 코드 작성 필수

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 리포팅**: [GitHub Issues](https://github.com/loganko83/signchain/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/loganko83/signchain/discussions)
- **보안 이슈**: security@yourdomain.com

## 🎉 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움으로 만들어졌습니다:

- [React](https://reactjs.org/) - UI 라이브러리
- [Express](https://expressjs.com/) - 웹 프레임워크
- [Supabase](https://supabase.com/) - 데이터베이스 서비스
- [Web3.js](https://web3js.readthedocs.io/) - 블록체인 라이브러리
- [IPFS](https://ipfs.io/) - 분산 저장 네트워크

---

<div align="center">

**🚀 BlockchainSignature로 안전하고 투명한 전자서명을 경험하세요!**

Made with ❤️ by [Logan Ko](https://github.com/loganko83)

</div>
