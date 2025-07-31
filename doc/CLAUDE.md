# BlockchainSignature 프로젝트 문서

## 프로젝트 개요
- 블록체인 기반 전자서명 시스템
- 로컬 개발 환경: Node.js (Windows PowerShell 지원)
- 서버 배포: trendy.storydot.kr/signchain

## 진행 상황 기록
- 날짜별 진행상황은 `progress_{날짜}.md` 파일에 기록
- 각 작업 완료 시 git commit 수행
- **최신 진행 파일**: 
  - `progress_2025-07-31_evening.md` (현재 저녁 작업 상황)
  - `progress_2025-07-31.md` (오늘 전체 작업 기록)
  - `progress_2025-07-30.md` (이전 배포 및 연동 작업)

## 개발 환경
- **로컬 프론트엔드**: http://localhost:5174/ (Vite)  
- **로컬 백엔드**: http://localhost:3000/ (Express)
- **로컬 개발 경로**: `C:\dev\signchain\BlockchainSignature`
- **PowerShell 명령어**: `npm run dev:all` (동시 실행)

## 서버 정보
- **메인 URL**: https://trendy.storydot.kr/signchain/
- **API URL**: https://trendy.storydot.kr/signchain/api/v1/
- **헬스체크**: https://trendy.storydot.kr/signchain/api/v1/health
- **서버**: AWS EC2 (Ubuntu)
- **경로**: `/var/www/html/signchain`
- **프로세스 관리**: PM2 (signchain 서비스)
- **웹서버**: Apache + 리버스 프록시

## Git 저장소 & 워크플로우
- **GitHub**: https://github.com/loganko83/signchain
- **Personal Access Token**: [보안상 별도 관리]
- **브랜치 전략**: 
  - main: 프로덕션 브랜치 (서버 배포용)
  - test: 개발 브랜치 (검증 후 main 머지)
- **GitHub CLI**: `gh` 명령어 사용 가능
- **워크플로우**: 로컬개발 → Git커밋 → GitHub푸시 → 서버배포

## 현재 시스템 상태 (2025-07-31 저녁)
✅ **완료된 주요 작업들**
1. **GitHub 저장소 완전 동기화**
   * 서버 코드와 GitHub 저장소 100% 동기화 완료
   * 보안 민감 정보 (Personal Access Token 등) 완전 제거
   * Git 히스토리 정리 및 보안 스캔 통과

2. **Windows 로컬 개발환경 구축**
   * PowerShell 환경 완전 대응 (`&&` 대신 `;` 사용)
   * README.md에 상세한 로컬 개발 가이드 추가
   * package.json에 분리된 개발 스크립트 추가:
      * `npm run dev:server` (백엔드만)
      * `npm run dev:client` (프론트엔드만)
      * `npm run dev:all` (동시 실행)

3. **Git 워크플로우 확립**
   * test 브랜치 생성 및 개발 프로세스 구축
   * Pull Request 기반 코드 리뷰 시스템
   * 자동 커밋 시스템 구축

4. **문서화 완성**
   * `doc/progress_2025-07-31.md` 상세 진행상황 기록
   * `doc/CLAUDE.md` 최신 상황 반영
   * 로컬 개발환경 가이드 문서화

📊 **현재 시스템 상태 (모두 정상)**
* **웹 애플리케이션**: https://trendy.storydot.kr/signchain/ ✅
* **API 서비스**: https://trendy.storydot.kr/signchain/api/v1/health ✅
* **PM2 프로세스**: signchain 정상 운영 중 ✅
* **GitHub 동기화**: 완료 ✅

## 기술 스택
- **프론트엔드**: React + Vite + TypeScript + Tailwind CSS
- **백엔드**: Express + Node.js + TypeScript
- **데이터베이스**: Supabase PostgreSQL
- **인증**: JWT + SendGrid (이메일)
- **블록체인**: Web3 + Ethers.js (현재 목킹 모드, 실제 연동 준비 완료)
- **스토리지**: IPFS (분산 파일 저장)
- **배포**: PM2 + Apache (리버스 프록시)

🚀 **다음 단계 (즉시 진행 가능)**
1. **Pull Request 생성**
   * URL: https://github.com/loganko83/signchain/pull/new/test
   * test → main 브랜치 머지를 위한 PR 생성

2. **로컬 개발환경 테스트**
   * `C:\dev\signchain\BlockchainSignature` 경로에서 프로젝트 클론
   * PowerShell에서 `npm install ; npm run dev:all` 실행

3. **블록체인 테스트넷 연동**
   * 현재 목킹 모드로 완전 구현되어 있음
   * 실제 Web3 기능 활성화 및 테스트 준비 완료

🔧 **로컬 개발 시작 가이드**
Windows PowerShell에서 다음 명령어로 시작하세요:
```powershell
# 프로젝트 클론
git clone https://github.com/loganko83/signchain.git
cd signchain

# 의존성 설치 및 빌드
npm install ; npm run build

# 환경변수 설정
Copy-Item .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정

# 개발 서버 시작
npm run dev:all
```

## 중요 주의사항
⚠️ **절대 건드리지 말 것**:
- `trendy.storydot.kr` (기존 WordPress 사이트)
- `trendy.storydot.kr/xpswap` (덱스 서비스)
- `/var/www/html/` (기존 웹 파일들)

✅ **사용 가능 영역**:
- `trendy.storydot.kr/signchain` (우리 서비스)
- `/var/www/html/signchain/` (서버 프로젝트 폴더)

## 현재 진행 상황
- **상태**: 모든 기반 시설 완벽 구축 완료 ✅
- **남은 작업**: 로컬 개발환경 실제 테스트 및 블록체인 연동
- **다음 우선순위**: Pull Request 머지 후 실제 기능 테스트

마지막 업데이트: 2025-07-31 저녁 (Claude AI Assistant)
