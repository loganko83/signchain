# SignChain 서버 배포 가이드

## 서버 정보
- **서버 URL**: trendy.storydot.kr/signchain
- **서버 타입**: AWS EC2
- **접속 방법**: SSH-MCP
- **스토리지**: 20GB 별도 폴더

## 배포 디렉토리 구조
```
/var/www/html/signchain/     # 프로젝트 루트
├── client/                  # 프론트엔드 소스
├── server/                  # 백엔드 소스
├── dist/                    # 빌드된 정적 파일
├── .env                     # 환경변수 설정
├── ecosystem.config.cjs     # PM2 설정
└── package.json
```

## 로컬과 서버의 차이점

### 1. 환경변수 (.env)
**로컬 개발**:
```env
DATABASE_URL=postgres://localhost:5432/signchain_dev
JWT_SECRET=local-dev-secret
SENDGRID_API_KEY=test-key
PORT=3000
```

**서버 배포**:
```env
DATABASE_URL=postgres://signuser:password@localhost:5432/signchain
JWT_SECRET=production-secret-key
SENDGRID_API_KEY=actual-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@signchain.app
ENCRYPTION_KEY=production-encryption-key
RP_ID=trendy.storydot.kr
RP_NAME=SignChain
ORIGIN=https://trendy.storydot.kr
PORT=5001  # 5000은 xpswap이 사용 중
```

### 2. 빌드 설정
**로컬**:
```bash
npm run build  # BASE_URL=/ (기본값)
```

**서버**:
```bash
BASE_URL=/signchain/ npm run build  # 서브 경로 설정
```

### 3. 웹서버 설정
**로컬**: 
- Vite 개발 서버 (포트 5174)
- Express 서버 (포트 3000)

**서버**:
- Apache 웹서버 + 리버스 프록시
- Express 서버 (포트 5001)
- PM2로 프로세스 관리 (cluster 모드)

### 4. Apache 설정 (.htaccess)
```apache
# SignChain 리다이렉트 규칙 (워드프레스와 공존)
RewriteRule ^signchain(/.*)?$ http://localhost:5001/signchain$1 [P,L]
```

## 배포 절차

### 1. 코드 업데이트
```bash
cd /var/www/html/signchain
git pull origin main
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 확인
```bash
# .env 파일에 필수 환경변수 확인
cat .env
```

### 4. 빌드 실행
```bash
BASE_URL=/signchain/ npm run build
```

### 5. PM2 재시작
```bash
pm2 restart signchain
pm2 save
```

### 6. 서비스 확인
- https://trendy.storydot.kr/signchain/ 접속
- PM2 상태: `pm2 status`
- 로그 확인: `pm2 logs signchain`

## 데이터베이스

### PostgreSQL 설정
- 데이터베이스명: signchain
- 사용자: signuser
- 포트: 5432

### 마이그레이션
```bash
npm run db:push  # Drizzle Kit 사용
```

## 주의사항

1. **포트 충돌**: 5000번 포트는 xpswap이 사용 중이므로 5001 사용
2. **경로 설정**: 모든 정적 자산과 API는 /signchain/ 경로 아래 위치
3. **워드프레스 공존**: .htaccess의 RewriteRule 순서 중요
4. **HTTPS 필수**: WebAuthn 등 보안 기능은 HTTPS에서만 작동

## 문제 해결

### PM2 재시작 반복
```bash
# 로그 확인
pm2 logs signchain --lines 100

# 설정 파일 확인
cat ecosystem.config.cjs

# 프로세스 삭제 후 재시작
pm2 delete signchain
pm2 start ecosystem.config.cjs
```

### Apache 프록시 문제
```bash
# Apache 모듈 확인
sudo a2enmod proxy proxy_http

# 설정 재로드
sudo systemctl reload apache2
```

### 빌드 오류
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm cache clean --force
```

## 모니터링

### PM2 모니터링
```bash
pm2 monit  # 실시간 모니터링
pm2 info signchain  # 상세 정보
```

### 로그 위치
- PM2 로그: `~/.pm2/logs/`
- Apache 로그: `/var/log/apache2/`
- 애플리케이션 로그: `/var/www/html/signchain/logs/`

## 백업

### 데이터베이스 백업
```bash
pg_dump -U signuser signchain > signchain_backup_$(date +%Y%m%d).sql
```

### 파일 백업
```bash
tar -czf signchain_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  /var/www/html/signchain
```
