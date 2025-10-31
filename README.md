# 메일로 오는 폼 (Vercel + SendGrid)

## 구성
- `index.html` : 폼 UI (허니팟/기본 검증 포함)
- `api/send.js` : 서버리스 함수(메일 발송)
- `.env.example` : 환경변수 예시
- `aws/index.mjs` : (대안) AWS Lambda + SES
- `package.json` : Vercel 함수 의존성

## 빠른 시작 (Vercel 권장)
1. 이 폴더를 GitHub에 업로드
2. Vercel에서 Import
3. Vercel Project → Settings → Environment Variables 추가
   - `SENDGRID_API_KEY`, `MAIL_TO`, `MAIL_FROM`, (선택)`ALLOW_ORIGINS`
4. 배포 후 `/index.html` 열어 테스트

## 로컬 테스트
SendGrid 키를 `.env`에 넣고 Vercel CLI 또는 로컬 서버로 테스트 가능.

## AWS Lambda + SES 사용 시
- `aws/index.mjs` 코드를 Lambda에 배포
- 환경변수 `MAIL_TO`, `MAIL_FROM` 설정 (SES에서 도메인/주소 Verify)
- 프론트 `fetch('/api/send', ...)` 경로를 **Lambda URL**로 교체
