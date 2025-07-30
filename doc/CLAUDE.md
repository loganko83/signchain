# BlockchainSignature 프로젝트 문서

## 프로젝트 개요
- 블록체인 기반 전자서명 시스템
- 로컬 개발 환경: Node.js
- 서버 배포: trendy.storydot.kr/signchain

## 진행 상황 기록
- 날짜별 진행상황은 `progress_{날짜}.md` 파일에 기록
- 각 작업 완료 시 git commit 수행
- **최신 진행 파일**: 
  - `progress_2025-07-30_status.md` (현재 상태 확인 및 작업 계획)
  - `progress_2025-07-29.md` (보안 문제 해결 완료)
  - `progress_2025-07-29_deployment.md` (서버 배포 가이드)

## 개발 환경
- 프론트엔드: http://localhost:5174/ (Vite)
- 백엔드 API: http://localhost:3000/ (Express)
- SendGrid API 설정 완료

## 서버 정보
- **메인 URL**: https://trendy.storydot.kr/signchain/
- **API URL**: https://trendy.storydot.kr/signchain/api/v1/
- **서버**: AWS EC2 (Ubuntu)
- **스토리지**: 새폴더 (storage, 20GB)
- **프로세스 관리**: PM2
- **웹서버**: Apache + 리버스 프록시
- **SSH 접속**: ssh-mcp 사용 가능

## Git 저장소
- **GitHub**: https://github.com/loganko83/signchain
- **Personal Access Token**: [보안상 별도 관리]
- **브랜치 전략**: 
  - main: 프로덕션 브랜치
  - test: 테스트 브랜치 (PR 전 검증용)

## 배포 현황 (2025-07-29 기준)
- ✅ **서버 배포**: 정상 운영 중
- ✅ **보안 문제**: 6개 중 5개 완전 해결, 1개 임시 처리
- ✅ **Git 동기화**: 로컬 ↔ GitHub ↔ 서버 완료
- ✅ **문서화**: 배포 가이드 및 트러블슈팅 가이드 완성

## 중요 주의사항
⚠️ **절대 건드리지 말 것**:
- `trendy.storydot.kr` (기존 WordPress 사이트)
- `trendy.storydot.kr/xpswap` (덱스 서비스)
- `/var/www/html/` (기존 웹 파일들)

✅ **사용 가능 영역**:
- `trendy.storydot.kr/signchain` (우리 서비스)
- `/home/ubuntu/signchain/` (서버 프로젝트 폴더)

## 향후 작업 계획
1. **인증 컨텍스트 구현** (우선순위: 높음)
   - React AuthContext 구현
   - JWT 토큰 기반 인증
   - 하드코딩된 사용자 ID 완전 제거

2. **기능 확장** (우선순위: 중간)
   - 블록체인 연동 강화
   - 전자서명 워크플로우 개선
   - 협업 기능 확장
