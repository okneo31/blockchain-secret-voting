// Cloudflare Pages Function — /og 엔드포인트
// 언어별 OG 공유 이미지(1200x630 SVG)를 만들어 줍니다.
//   /og?lang=ko  → 한글 카드
//   /og?lang=en  → 영문 카드
// SVG로 그려서 별도 라이브러리 없이 동작합니다.
// (참고: 일부 플랫폼은 OG 이미지로 PNG만 인식해요. PNG가 필요하면
//  README의 "OG 이미지를 PNG로" 항목을 보세요.)

const COPY = {
  ko: {
    badge: "초등학생도 이해하는 블록체인 투표",
    title1: "비밀은 지키고,",
    title2: "검증은 누구나.",
    sub: "누가 뽑았는지는 아무도 몰라요. 그런데도 표는 모두가 다시 확인할 수 있어요.",
    chips: ["🤫 비밀 보장", "🔍 재검증", "🛡️ 위변조 불가", "🌍 모두가 감시"],
    foot: "🗳️ 블록체인 비밀투표 대시보드",
  },
  en: {
    badge: "A kid-friendly blockchain voting explainer",
    title1: "Private to cast,",
    title2: "verifiable by all.",
    sub: "Nobody knows who you voted for — yet everyone can re-check the count.",
    chips: ["🤫 Secret", "🔍 Re-verify", "🛡️ Tamper-proof", "🌍 Everyone watches"],
    foot: "🗳️ Blockchain Secret Voting Dashboard",
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function chip(x, y, label) {
  const w = label.length * 18 + 56;
  return `
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="58" rx="29" fill="#ffffff" opacity="0.92"/>
      <text x="${w / 2}" y="38" font-size="26" font-weight="800" text-anchor="middle" fill="#7a3d12">${esc(label)}</text>
    </g>`;
}

function svg(lang) {
  const c = COPY[lang] || COPY.ko;
  let cx = 80;
  const chips = c.chips
    .map((label) => {
      const g = chip(cx, 470, label);
      cx += label.length * 18 + 56 + 18;
      return g;
    })
    .join("");

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffb347"/>
      <stop offset="0.55" stop-color="#ff7eb3"/>
      <stop offset="1" stop-color="#ff9d2e"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="#ffe9c2" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffe9c2" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- 큰 장식 이모지 -->
  <text x="980" y="250" font-size="320" opacity="0.16">⛓️</text>
  <text x="120" y="180" font-size="120">🗳️</text>

  <!-- 배지 -->
  <g transform="translate(80,210)">
    <rect width="${c.badge.length * 15 + 60}" height="50" rx="25" fill="#3a2415" opacity="0.85"/>
    <text x="30" y="33" font-size="24" font-weight="700" fill="#ffe9c2">${esc(c.badge)}</text>
  </g>

  <!-- 제목 -->
  <text x="78" y="330" font-size="82" font-weight="800" fill="#ffffff">${esc(c.title1)}</text>
  <text x="78" y="412" font-size="82" font-weight="800" fill="#3a2415">${esc(c.title2)}</text>

  <!-- 부제 -->
  <text x="80" y="552" font-size="30" font-weight="600" fill="#fff6e6">${esc(c.sub)}</text>

  <!-- 칩 -->
  ${chips}

  <!-- 푸터 -->
  <text x="80" y="608" font-size="24" font-weight="700" fill="#3a2415" opacity="0.8">${esc(c.foot)}</text>
</svg>`;
}

export function onRequest(context) {
  const url = new URL(context.request.url);
  let lang = url.searchParams.get("lang");
  if (lang !== "ko" && lang !== "en") lang = "ko";

  return new Response(svg(lang), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
