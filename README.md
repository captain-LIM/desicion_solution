# DecideAI — AI 기반 의사결정 지원 서비스

일상의 고민을 입력하면 AI가 3가지 관점에서 분석하고 최적의 선택을 추천해주는 웹 서비스입니다.

---

## 주요 기능

### AI 결정 추천
- 고민 상황, 선택지(2~5개), 카테고리, 감정 상태를 입력
- Google Gemini 2.5 Flash가 **낙관론자 / 현실주의자 / 감성적 시각** 3가지 관점으로 분석
- 최적 선택지와 추천 이유를 즉시 제공

### 개인화 AI
- 사후 만족도 리뷰(만족/아쉬움)를 3개 이상 쌓으면 자동 활성화
- 과거 결정 패턴을 AI 프롬프트에 반영해 개인 맞춤 추천 제공

### 결정 히스토리
- 과거 결정 전체 기록 조회
- 키워드 검색, 카테고리·날짜 범위 필터
- 북마크 기능

### 리뷰 시스템
- 결정 후 3일이 지나면 사후 만족도 입력 요청
- 리뷰 데이터는 개인화 AI 학습에 사용

### 커뮤니티 투표
- 결정을 공개하면 다른 사용자들이 선택지에 투표
- AI 추천과 사람들의 선택 일치 여부를 실시간 비교

### 인사이트 대시보드
- 결정 성향 분석 (신중형 / 결단형 / 감성형 / 이성형 / 성찰형 / 균형형)
- 카테고리별 만족도, 감정 상태 입력 영향, 시간대별 결정 패턴 시각화

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | React 18, Vite, Tailwind CSS, Recharts, Lucide |
| 백엔드 | Node.js, Express |
| 데이터베이스 | MySQL 8 |
| AI | Google Gemini 2.5 Flash (OpenRouter) |
| 인증 | JWT + bcrypt |

---

## 프로젝트 구조

```
project/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── decisions.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── decisionController.js
│   └── middleware/auth.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/        # AuthContext, ThemeContext
        ├── pages/          # Home, Result, History, Stats, Insights, Community, Share
        ├── components/     # Navbar, Sidebar, ReviewModal, ReviewBanner
        └── lib/            # utils, categories
```

---

## 시작하기

### 환경변수 설정

`backend/.env` 파일을 생성하고 아래 값을 입력합니다.

```env
MYSQL_URL=mysql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=4000
NODE_ENV=development
```

### 설치 및 실행

```bash
# 백엔드
cd backend
npm install
node server.js

# 프론트엔드 (개발)
cd frontend
npm install
npm run dev
```

### 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드 후 백엔드 서버가 `frontend/dist`를 정적으로 서빙합니다.

---

## 데이터베이스 초기화

`schema.sql` 파일로 테이블을 생성합니다.

```bash
mysql -u root -p your_database < schema.sql
```

### 테이블 구조

| 테이블 | 역할 |
|---|---|
| `users` | 회원 정보 (이메일, 비밀번호 해시, 이름) |
| `decisions` | 결정 이력 및 AI 분석 결과 (perspectives JSON 포함) |
| `options` | 결정별 선택지 목록 |
| `votes` | 커뮤니티 투표 기록 |

---

## API 엔드포인트

### 인증
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 |

### 결정
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/decisions` | AI 결정 생성 |
| GET | `/api/decisions/history` | 히스토리 조회 |
| GET | `/api/decisions/stats` | 통계 조회 |
| GET | `/api/decisions/insights` | 인사이트 조회 |
| GET | `/api/decisions/community` | 커뮤니티 피드 |
| POST | `/api/decisions/:id/vote` | 투표 |
| PATCH | `/api/decisions/:id/bookmark` | 북마크 토글 |
| PATCH | `/api/decisions/:id/publish` | 커뮤니티 공개 토글 |
| PATCH | `/api/decisions/:id/review` | 만족도 리뷰 저장 |
| DELETE | `/api/decisions/:id` | 결정 삭제 |
