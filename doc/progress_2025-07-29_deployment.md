# 서버 배포 가이드 - 2025-07-29

## 🚀 배포 환경 정보

### 서버 정보
- **도메인**: trendy.storydot.kr
- **서비스 경로**: /signchain
- **서버**: AWS EC2 (Ubuntu)
- **스토리지**: 새폴더 (storage, 20GB)
- **웹서버**: Apache + 리버스 프록시
- **프로세스 매니저**: PM2

### 주요 URL
- **메인 서비스**: https://trendy.storydot.kr/signchain/
- **API 엔드포인트**: https://trendy.storydot.kr/signchain/api/v1/
- **Health Check**: https://trendy.storydot.kr/signchain/api/v1/health

---

## 📁 로컬 vs 서버 환경 차이점

### 로컬 개발 환경
```
경로: C:\dev\signchain\BlockchainSignature\
포트: 
  - 프론트엔드: 5174 (Vite)
  - 백엔드: 3000 (Express)
OS: Windows
실행 방법: 
  - 프론트엔드: npm run dev
  - 백엔드: npm run start:dev
데이터베이스: PostgreSQL (Neon 클라우드)
환경 파일: .env (로컬용)
```

### 서버 배포 환경
```
경로: /home/ubuntu/signchain/
포트: 
  - 백엔드: 3000 (PM2로 관리)
  - 웹서버: 80/443 (Apache)
OS: Ubuntu Linux
실행 방법: 
  - PM2: pm2 start ecosystem.config.js
  - Apache: systemctl start apache2
데이터베이스: PostgreSQL (Neon 클라우드)
환경 파일: .env (서버용)
SSL: Let's Encrypt (자동 갱신)
```

---

## 🔧 배포 프로세스

### 1. 로컬에서 서버로 배포 순서

#### Step 1: 로컬 변경사항 커밋 및 푸시
```bash
# Windows PowerShell
cd C:\dev\signchain\BlockchainSignature
git add .
git commit -m "feat: 변경사항 설명"
git push origin main
```

#### Step 2: 서버 접속 및 동기화
```bash
# SSH 접속 (ssh-mcp 사용)
ssh ubuntu@trendy.storydot.kr

# 서버에서 실행
cd /home/ubuntu/signchain
git pull origin main
```

#### Step 3: 의존성 설치 및 빌드
```bash
# 서버에서 실행
npm install
npm run build
```

#### Step 4: PM2 재시작
```bash
# 서버에서 실행
pm2 restart signchain
pm2 status
```

#### Step 5: 배포 확인
```bash
# Health Check
curl https://trendy.storydot.kr/signchain/api/v1/health
```

### 2. 주요 설정 파일들

#### PM2 설정 (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'signchain',
    script: './dist/server/server.js',
    cwd: '/home/ubuntu/signchain',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

#### Apache 가상 호스트 설정
```apache
<VirtualHost *:443>
    ServerName trendy.storydot.kr
    DocumentRoot /var/www/html
    
    # signchain 리버스 프록시
    ProxyPass /signchain/ http://localhost:3000/
    ProxyPassReverse /signchain/ http://localhost:3000/
    ProxyPreserveHost On
    
    # 기존 WordPress는 건드리지 않음
    ProxyPass /xpswap !
    ProxyPass /wp-admin !
    ProxyPass /wp-content !
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/private.key
</VirtualHost>
```

---

## 🔐 환경 변수 차이점

### 로컬 .env
```env
# 개발용 설정
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5174

# 데이터베이스
DATABASE_URL=postgresql://username:password@hostname:5432/dbname

# 외부 서비스
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=dev@signchain.app

# 보안
ENCRYPTION_KEY=local-development-key-32-chars
JWT_SECRET=local-jwt-secret

# WebAuthn (로컬)
RP_ID=localhost
RP_NAME=SignChain Dev
ORIGIN=http://localhost:5174
```

### 서버 .env
```env
# 프로덕션 설정
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://trendy.storydot.kr/signchain

# 데이터베이스 (동일)
DATABASE_URL=postgresql://username:password@hostname:5432/dbname

# 외부 서비스
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@trendy.storydot.kr

# 보안 (프로덕션용 강화)
ENCRYPTION_KEY=production-encryption-key-32-chars
JWT_SECRET=production-jwt-secret-strong

# WebAuthn (프로덕션)
RP_ID=trendy.storydot.kr
RP_NAME=SignChain
ORIGIN=https://trendy.storydot.kr
```

---

## ⚠️ 배포 시 주의사항

### 1. 절대 건드리지 말 것
- `/var/www/html/` (기존 WordPress)
- `trendy.storydot.kr/xpswap/` (덱스 서비스)
- Apache 기본 설정 파일들

### 2. 배포 전 체크리스트
- [ ] 로컬에서 빌드 성공 확인 (`npm run build`)
- [ ] 환경 변수 올바른지 확인
- [ ] Git 커밋 및 푸시 완료
- [ ] 데이터베이스 연결 테스트
- [ ] SSL 인증서 유효성 확인

### 3. 배포 후 체크리스트
- [ ] Health Check API 응답 확인
- [ ] PM2 프로세스 상태 확인 (`pm2 status`)
- [ ] 로그 확인 (`pm2 logs signchain`)
- [ ] 프론트엔드 정상 로딩 확인
- [ ] API 엔드포인트 테스트

### 4. 롤백 절차 (문제 발생 시)
```bash
# 1. 이전 커밋으로 되돌리기
git reset --hard HEAD~1
git push -f origin main

# 2. 서버에서 동기화
cd /home/ubuntu/signchain
git reset --hard HEAD~1
npm run build
pm2 restart signchain

# 3. 상태 확인
pm2 status
curl https://trendy.storydot.kr/signchain/api/v1/health
```

---

## 📊 배포 히스토리

### 2025-07-29 (최신)
- **시간**: 11:35 KST
- **커밋**: 61c0f84 (보안 문제 해결)
- **변경사항**: 
  - 하드코딩된 사용자 ID TODO 주석 추가
  - 보안 문서화 개선
- **상태**: ✅ 성공
- **빌드 크기**: 163.5kb
- **재시작**: PM2 restart 성공

### 2025-07-28 (이전)
- **시간**: 오후
- **변경사항**: 
  - 초기 서버 배포
  - PostgreSQL 설정
  - PM2 설정
  - Apache 리버스 프록시 설정
- **상태**: ✅ 성공

---

## 🔍 트러블슈팅

### 자주 발생하는 문제들

#### 1. PM2 프로세스 죽음
```bash
# 문제 확인
pm2 status
pm2 logs signchain

# 해결 방법
pm2 restart signchain
pm2 save
```

#### 2. 빌드 실패
```bash
# 문제: node_modules 충돌
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. 환경 변수 누락
```bash
# 문제 확인
pm2 env signchain

# 해결 방법
# .env 파일 확인 및 수정
vi .env
pm2 restart signchain
```

#### 4. 포트 충돌
```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :3000

# 프로세스 종료
sudo kill -9 <PID>
pm2 restart signchain
```

---

## 📈 성능 모니터링

### PM2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 상태 확인
pm2 status

# 로그 확인
pm2 logs signchain --lines 100
```

### 시스템 리소스
```bash
# 메모리 사용량
free -h

# 디스크 사용량
df -h

# CPU 사용량
top
```

### 웹서버 로그
```bash
# Apache 로그
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

---

**문서 작성일**: 2025-07-29  
**마지막 업데이트**: 2025-07-29 11:45 KST  
**배포 상태**: ✅ 정상 운영 중
