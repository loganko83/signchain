# Xphere 블록체인 연동 설계 문서

## 🎯 Phase 1: Xphere 네트워크 연결 및 테스트

### 1.1 Xphere RPC 엔드포인트 확인
- Primary: https://xphere-rpc.com
- Secondary: https://ankr.com/rpc/xphere

### 1.2 네트워크 정보 수집 필요사항
- [x] Chain ID 확인
- [x] Native Token 심볼
- [x] Block Explorer URL
- [x] Gas Price 정보
- [x] 테스트넷/메인넷 구분

### 1.3 현재 Mock 데이터 현황
- **blockchain.ts**: 모든 메서드가 Mock 트랜잭션 해시 생성
- **memory-storage.ts**: 인메모리 스토리지 사용
- **DID 시스템**: Microsoft ION 스타일 구현되어 있음

## 🔧 Phase 2: 실제 블록체인 연동 구현

### 2.1 환경변수 추가
```bash
# Xphere 블록체인 설정
XPHERE_RPC_URL=https://xphere-rpc.com
XPHERE_CHAIN_ID=xxx
XPHERE_BLOCK_EXPLORER=https://explorer.xphere.com
BLOCKCHAIN_PRIVATE_KEY=0x[새로생성할키]
XPHERE_CONTRACT_ADDRESS=0x[배포할컨트랙트주소]

# 가스비 및 네트워크 설정
DEFAULT_GAS_LIMIT=200000
MAX_GAS_PRICE=100000000000  # 100 Gwei
```

### 2.2 스마트 컨트랙트 배포 계획

#### 2.2.1 필요한 컨트랙트
1. **DocumentRegistry.sol** - 문서 등록/검증
2. **SignatureRegistry.sol** - 서명 등록/검증  
3. **DIDRegistry.sol** - DID 등록/관리
4. **WorkflowManager.sol** - 워크플로우 관리

#### 2.2.2 지갑 생성 및 가스비 준비
1. **개발용 지갑 생성**
   ```javascript
   const wallet = ethers.Wallet.createRandom();
   console.log('Address:', wallet.address);
   console.log('Private Key:', wallet.privateKey);
   ```

2. **가스비 확보 방법**
   - Xphere 네이티브 토큰 필요량: ~1-5 XPHERE (예상)
   - 컨트랙트 배포: ~0.5 XPHERE
   - 초기 테스트 트랜잭션: ~0.5 XPHERE
   - 예비 가스비: ~4 XPHERE

### 2.3 컨트랙트 개발 순서
1. **DocumentRegistry 컨트랙트** (최우선)
2. **SignatureRegistry 컨트랙트**
3. **DIDRegistry 컨트랙트** (Microsoft ION 호환)
4. **통합 테스트 및 최적화**

## 📋 Phase 3: DID 시스템 Xphere 연동

### 3.1 Microsoft ION 호환 DID 구조
```json
{
  "id": "did:xphere:0x...",
  "verificationMethod": [...],
  "authentication": [...],
  "service": [...]
}
```

### 3.2 Xphere DID Document 저장 방식
- **온체인**: DID Document 해시값
- **오프체인**: IPFS 또는 분산 스토리지에 전체 Document
- **검증**: 온체인 해시와 오프체인 데이터 일치성

## 🚀 Phase 4: 데이터베이스 실연결

### 4.1 Supabase 연결 상태 확인
- [x] 연결 정보 확인됨
- [ ] 실제 데이터 CRUD 테스트 필요
- [ ] Mock 데이터 -> 실 데이터베이스 마이그레이션

### 4.2 SendGrid 이메일 서비스
- [x] API Key 설정됨
- [ ] 실제 이메일 발송 테스트 필요

## 📊 작업 진행 순서

### Step 1: Xphere 네트워크 정보 수집 ✅ 다음
1. RPC 연결 테스트
2. Chain ID 및 네트워크 정보 확인
3. 가스비 정보 수집

### Step 2: 지갑 생성 및 가스비 준비
1. 개발용 지갑 생성
2. Xphere 토큰 확보 방법 확인
3. 테스트용 가스비 준비

### Step 3: 스마트 컨트랙트 개발
1. DocumentRegistry 컨트랙트 작성
2. 로컬 테스트넷에서 테스트
3. Xphere 네트워크에 배포

### Step 4: 백엔드 통합
1. blockchain.ts 실제 연동 구현
2. Mock 데이터 제거
3. Supabase 실연결

### Step 5: 프론트엔드 최적화
1. 실시간 블록체인 상태 표시
2. 트랜잭션 진행상황 UI
3. 사용자 경험 개선

---
**작성일**: 2025-08-01  
**다음 업데이트**: Xphere 네트워크 정보 수집 완료 후
