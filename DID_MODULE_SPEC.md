# SignChain W3C DID 모듈 기능 명세서

## 개요
SignChain DID 모듈은 W3C DID(Decentralized Identifiers) Core v1.0 표준을 완벽하게 준수하는 탈중앙화 신원 관리 시스템입니다. Microsoft Entra Verified ID의 아키텍처를 참고하여 설계되었으며, 블록체인 기반의 자기주권 신원(Self-Sovereign Identity) 시스템을 구현합니다.

## 핵심 기능

### 1. DID 생성 및 관리
**파일 위치**: `client/src/components/did/DIDManager.tsx`

#### 지원하는 DID Methods
- **did:web** - 웹 도메인 기반 DID
  - HTTPS를 통한 DID Document 호스팅
  - 기존 웹 인프라 활용
  - 도메인 평판 기반 신뢰
  
- **did:ethr** - Ethereum 기반 DID
  - Ethereum 블록체인에 등록
  - 스마트 컨트랙트 기반 관리
  - 높은 보안성과 불변성
  
- **did:key** - 자체 포함 키 DID
  - 별도 등록 불필요
  - 공개키에서 직접 파생
  - 경량 구현에 적합
  
- **did:polygon** - Polygon 네트워크 DID
  - 저비용 블록체인 솔루션
  - 빠른 트랜잭션 처리
  - Ethereum 호환성

#### 주요 기능
- DID Document 생성 및 수정
- 키 타입 선택 (Ed25519, Secp256k1, P-256)
- 서비스 엔드포인트 설정
- DID 목적별 분류 (개인, 기업, 기기, 서비스)

### 2. Verifiable Credentials (검증 가능한 자격증명)
**파일 위치**: `client/src/components/did/VerifiableCredentials.tsx`

#### 지원 자격증명 유형
1. **사업자등록증**
   - 필드: 상호명, 사업자등록번호, 대표자명, 사업장주소, 업태/종목
   - 발급자: 국세청 또는 인증된 기관

2. **주민등록증**
   - 필드: 성명, 주민등록번호, 주소, 발급일
   - 발급자: 행정안전부 또는 인증된 기관

3. **여권**
   - 필드: 성명, 여권번호, 국적, 생년월일, 발급일, 만료일
   - 발급자: 외교부 또는 인증된 기관

4. **학위증명서**
   - 필드: 성명, 학위, 전공, 대학교, 졸업일
   - 발급자: 교육기관

#### 기능
- 자격증명 발급 및 서명
- 만료일 자동 관리
- 자격증명 검증 (서명, 만료, 폐기 상태)
- QR 코드 기반 공유

### 3. DID Wallet
**파일 위치**: `client/src/components/did/DIDWallet.tsx`

#### 지갑 기능
- **다중 DID 관리**
  - 여러 DID Method 동시 지원
  - DID별 용도 구분
  - 상태 관리 (활성/비활성)

- **자격증명 저장**
  - 발급받은 모든 자격증명 관리
  - 만료 예정 알림
  - 카테고리별 분류

- **보안 기능**
  - 지갑 잠금/잠금해제
  - 생체 인증 옵션
  - 자동 잠금 설정
  - 백업 및 복구

- **서비스 연결**
  - 연결된 서비스 관리
  - 권한 설정
  - 연결 해제

### 4. Presentation Exchange (선택적 정보 공개)
**파일 위치**: `client/src/components/did/PresentationExchange.tsx`

#### 핵심 기능
- **선택적 정보 공개**
  - 필드별 공개/비공개 설정
  - 최소 정보 원칙
  - 사용자 통제권 보장

- **Zero-Knowledge Proof**
  - 실제 값 공개 없이 조건 증명
  - 예: 나이가 19세 이상임을 증명 (실제 나이 비공개)
  - 프라이버시 극대화

- **QR 코드 인증**
  - 오프라인 인증 지원
  - 즉시 검증 가능
  - 모바일 친화적

- **요청 관리**
  - 실시간 요청 알림
  - 요청 이력 관리
  - 승인/거부 처리

### 5. DID Resolver
**파일 위치**: `client/src/components/did/DIDResolver.tsx`

#### Universal Resolver
- 모든 DID Method 지원
- DID Document 조회
- 메타데이터 표시
- 검증 기능

#### Method별 Resolver
- did:web 전용 조회
- did:ethr 블록체인 조회
- did:key 즉시 파생
- did:polygon 네트워크 조회

#### 도구
- DID Document 검증
- 공개키 추출
- 서비스 엔드포인트 확인
- 서명 검증

## 기술 아키텍처

### 프론트엔드 구조
```
client/src/
├── pages/
│   └── did.tsx              # DID 모듈 메인 페이지
└── components/
    └── did/
        ├── DIDOverview.tsx           # W3C DID 소개
        ├── DIDManager.tsx            # DID 관리
        ├── VerifiableCredentials.tsx # 자격증명
        ├── DIDWallet.tsx            # 지갑
        ├── PresentationExchange.tsx  # 증명 교환
        └── DIDResolver.tsx          # Resolver
```

### 백엔드 API
```
server/
└── routes/
    └── did/
        └── index.ts         # DID API 엔드포인트
```

#### API 엔드포인트
- `POST /api/did/create` - DID 생성
- `GET /api/did/resolve/:did` - DID 조회
- `POST /api/did/issue-credential` - 자격증명 발급
- `POST /api/did/verify-credential` - 자격증명 검증
- `POST /api/did/create-presentation-request` - 프레젠테이션 요청
- `GET /api/did/list/:userId` - 사용자 DID 목록
- `GET /api/did/credentials/:did` - DID의 자격증명 목록

### 데이터베이스 스키마
```sql
-- 주요 테이블
- dids                      # DID 정보
- verifiable_credentials    # 발급된 자격증명
- presentation_requests     # 프레젠테이션 요청
- did_services             # 서비스 엔드포인트
- did_key_rotations        # 키 회전 이력
- vc_revocations          # 자격증명 폐기
- trusted_issuers         # 신뢰 발급자
- did_activity_logs       # 활동 로그
```

## 사용 시나리오

### 1. 기업 인증
1. 기업이 DID를 생성 (did:web 권장)
2. 사업자등록증 자격증명 발급
3. 계약 시 자격증명 제시
4. 상대방이 즉시 검증

### 2. 개인 신원확인
1. 개인이 DID 생성 (did:ethr 권장)
2. 주민등록증/운전면허증 자격증명 발급
3. 필요 시 선택적 정보만 공개
4. Zero-Knowledge Proof로 프라이버시 보호

### 3. 학력 증명
1. 교육기관이 학위 자격증명 발급
2. 학생이 DID Wallet에 저장
3. 취업 시 고용주에게 제시
4. 위변조 불가능한 검증

### 4. 접근 권한 관리
1. 조직 내 역할별 자격증명 발급
2. 시스템 접근 시 자격증명 요구
3. 실시간 권한 검증
4. 퇴사 시 즉시 폐기

## 보안 및 프라이버시

### 보안 기능
- 암호학적 서명으로 위변조 방지
- 블록체인 기반 불변성 보장
- 키 회전으로 장기 보안성 확보
- 다단계 인증 지원

### 프라이버시 보호
- 선택적 정보 공개
- Zero-Knowledge Proofs
- 최소 정보 원칙
- 사용자 통제권 보장

## 표준 준수

### W3C 표준
- DID Core v1.0
- Verifiable Credentials Data Model 1.0
- DID Resolution v0.3

### DIF 표준
- Universal Resolver
- Presentation Exchange
- DIDComm Messaging
- Sidetree Protocol

### 기타 표준
- OAuth 2.0 / OpenID Connect
- JSON Web Tokens (JWT)
- JSON-LD
- WebAuthn

## 향후 로드맵

### 단기 (3개월)
- [ ] DIDComm 메시징 구현
- [ ] 더 많은 DID Method 지원
- [ ] 모바일 앱 개발
- [ ] 하드웨어 지갑 연동

### 중기 (6개월)
- [ ] 기업용 관리 콘솔
- [ ] 대량 발급 시스템
- [ ] API 공개
- [ ] 국제 표준 인증

### 장기 (1년)
- [ ] AI 기반 신원 검증
- [ ] 글로벌 신뢰 네트워크 구축
- [ ] 정부 시스템 연동
- [ ] 블록체인 간 상호운용성

---
*문서 작성일: 2025년 7월 25일*
*작성자: SignChain DID Team*