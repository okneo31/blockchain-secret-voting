# 🗳️ 블록체인 비밀투표 대시보드 (Cloudflare Pages)

비밀투표(누가 뽑았는지 비밀)이면서 재검증(표를 누구나 다시 확인) 가능한 블록체인 투표를
초등학생도 이해하도록 만든 **인터랙티브 대시보드**예요.

- **언어별 URL (단일 소스)**: `/ko`, `/en` 두 주소 / 템플릿은 `index.html` 하나만 유지
- **루트 자동 분기**: `/` 접속 시 IP가 한국이면 `/ko`, 그 외는 `/en` 으로 리다이렉트
- **수동 토글**: 우측 상단 `한국어 / EN` 버튼 → 배포 환경에선 해당 URL로 이동(쿠키 유지)
- **언어별 OG 카드 + hreflang**: 공유 시 한·영 다른 제목·이미지, SEO용 hreflang 자동 삽입
- **투표 시뮬레이터**: 후보를 누르면 비밀 번호표 생성 → 블록이 실시간으로 쌓임
- **움직임**: 스크롤 등장, 통통 튀는 호버, 투표 시 색종이 효과

---

## 📁 폴더 구조

```
vote/
├─ index.html              # 대시보드 "단일 템플릿" (한·영 사전 + 시뮬레이터 내장)
├─ functions/
│  ├─ _middleware.js       # / → /ko·/en 리다이렉트, /ko·/en 서빙(언어 주입), OG·hreflang
│  └─ og.js                # /og?lang=ko|en  → 언어별 OG 이미지(SVG) 생성
├─ dashboard.html          # (참고용) 초기 한글 단독 버전
└─ README.md
```

### 주소 구조

| URL | 동작 |
|-----|------|
| `/`        | IP가 한국이면 `/ko`, 그 외 `/en` 으로 302 리다이렉트 |
| `/ko`      | `index.html`을 한글로 박아서 서빙 (OG=한글) |
| `/en`      | `index.html`을 영문으로 박아서 서빙 (OG=영문) |
| `/og?lang=`| 언어별 OG 공유 이미지(SVG) |

> HTML은 `index.html` **한 벌만** 유지해요. `/ko`·`/en`은 같은 파일을 언어만 바꿔
> 내보내므로 두 언어 내용이 어긋날 위험이 없어요.

> Cloudflare Pages는 `functions/` 폴더를 자동으로 Functions(워커)로 인식해요.
> 별도 빌드 과정이 필요 없어요.

---

## 🚀 배포 방법

### 방법 A — Wrangler CLI (가장 빠름)

```powershell
# 1) wrangler 설치 (한 번만)
npm install -g wrangler

# 2) 로그인
wrangler login

# 3) 이 폴더(D:\vote)에서 배포
wrangler pages deploy . --project-name vote-blockchain
```

배포가 끝나면 `https://vote-blockchain.pages.dev` 같은 주소가 나와요.

### 방법 B — 대시보드(깃 연동)

1. 이 폴더를 GitHub 저장소에 올려요.
2. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**
3. 빌드 설정:
   - **Build command**: (비워둠)
   - **Build output directory**: `/` (루트)
4. **Save and Deploy**

---

## 🧪 로컬에서 미리 보기

```powershell
wrangler pages dev .
```

- 직접 열어볼 주소: `http://localhost:8788/ko` , `http://localhost:8788/en`
- 루트 `http://localhost:8788/` 는 IP로 분기하는데, 로컬은 국가정보가 없어 기본 `/en`.
  한글은 `/ko` 로 가거나 `?lang=ko`, 또는 우측 상단 **한국어** 버튼을 누르세요.
- `index.html` 을 그냥 더블클릭해도 동작해요(이때는 브라우저 언어로 자동 선택,
  토글은 새로고침 없이 즉시 전환).

---

## 🌐 언어 분기 규칙 (우선순위)

루트 `/` 에서만 `pickLang()` 으로 어디로 보낼지 결정해요. 순서:

1. `?lang=ko` / `?lang=en` 쿼리 (명시적 지정이 최우선)
2. `lang` **쿠키** (토글 버튼이 저장 → 다음 방문 유지)
3. **IP 국가코드** — `KR` 이면 `ko`, 나머지는 `en`

> `/ko`·`/en` 으로 직접 들어오면 IP와 상관없이 그 언어로 고정돼요.
> 그래서 **공유 링크는 항상 링크에 박힌 언어 그대로** 열려요.

---

## 🖼️ OG(공유 카드) 확인

- 한글 카드: `https<도메인>/og?lang=ko`
- 영문 카드: `https<도메인>/og?lang=en`
- 페이지를 공유하면 미들웨어가 접속 언어에 맞는 카드를 자동으로 연결해요.

### OG 이미지를 PNG로 (선택)

지금은 가볍게 **SVG**로 그려요. 카카오톡/페이스북 등 일부는 OG 이미지로
**PNG/JPG만** 인식할 수 있어요. 확실한 호환이 필요하면 PNG 렌더링을 추가하세요:

```powershell
npm i workers-og
```

```js
// functions/og.js 를 PNG 버전으로 교체할 때의 핵심
import { ImageResponse } from "workers-og";
export function onRequest(context){
  // ...JSX/HTML 템플릿을 ImageResponse 로 반환하면 PNG가 나와요
}
```

> 위 SVG 버전은 트위터·디스코드·슬랙 등에서는 잘 보이고,
> 라이브러리 없이 즉시 동작한다는 장점이 있어요.

---

## 🔧 내용 수정하기

- **글자(한·영)**: `index.html` 안의 `DICT.ko` / `DICT.en`
- **클릭 상세설명**: `index.html` 안의 `MODAL.ko` / `MODAL.en`
- **OG 문구·색**: `functions/og.js` 의 `COPY`
- **후보·초기 표수**: `index.html` 의 `CANDS`, `SEED`, `TOTAL_BALLOTS`

---

## ⚠️ 참고

- 이 대시보드는 **교육용 설명 자료**예요. 실제 선거에 쓰는 시스템은
  훨씬 엄격한 암호·보안 검증(영지식증명 회로, 키 관리, 감사)이 필요해요.
- 폰트(Pretendard)·차트(Chart.js)는 CDN을 사용해요. 완전 오프라인이 필요하면
  해당 파일을 프로젝트에 내려받아 경로를 바꿔주세요.
