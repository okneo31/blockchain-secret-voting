// Cloudflare Pages Function (Worker runtime)
//
// 구조: "URL은 둘, 소스는 하나"
//   /        → 접속 IP로 /ko 또는 /en 으로 자동 리다이렉트
//   /ko      → 같은 index.html 템플릿을 한글로 박아서 서빙
//   /en      → 같은 index.html 템플릿을 영문으로 박아서 서빙
//   /og, 정적자산(css/js/img) → 그대로 통과
//
// 한 개의 index.html 템플릿만 유지하므로 내용이 어긋날 위험이 없어요.

const OG = {
  ko: {
    title: "🗳️ 블록체인 비밀투표 — 비밀은 지키고, 검증은 누구나",
    desc:  "누가 뽑았는지는 비밀, 표 검증은 누구나! 초등학생도 이해하는 블록체인 투표 대시보드.",
    locale: "ko_KR",
  },
  en: {
    title: "🗳️ Blockchain Secret Voting — Private yet Verifiable",
    desc:  "Nobody sees who you voted for, yet anyone can verify the count. A kid-friendly blockchain voting dashboard.",
    locale: "en_US",
  },
};

// IP 국가코드(+쿼리/쿠키)로 언어 결정 — 루트 리다이렉트에만 사용
function pickLang(request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("lang");
  if (q === "ko" || q === "en") return q;

  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)lang=(ko|en)/);
  if (m) return m[1];

  const country = request.cf && request.cf.country;
  return country === "KR" ? "ko" : "en";
}

// index.html 템플릿을 받아 언어별 <title>·OG·lang·hreflang 을 박아 반환
function localize(res, lang, url) {
  const t = OG[lang];
  const origin = url.origin;
  const img = `${origin}/og-${lang}.png`;   // 정적 PNG (og-ko.png / og-en.png)
  const pageUrl = `${origin}/${lang}`;

  return new HTMLRewriter()
    .on("html", { element(e) { e.setAttribute("lang", lang); } })
    .on("title", { element(e) { e.setInnerContent(t.title); } })
    .on('meta[property="og:title"]',        { element(e){ e.setAttribute("content", t.title); }})
    .on('meta[property="og:description"]',  { element(e){ e.setAttribute("content", t.desc); }})
    .on('meta[property="og:image"]',        { element(e){ e.setAttribute("content", img); }})
    .on('meta[property="og:locale"]',       { element(e){ e.setAttribute("content", t.locale); }})
    .on('meta[property="og:url"]',          { element(e){ e.setAttribute("content", pageUrl); }})
    .on('meta[name="twitter:title"]',       { element(e){ e.setAttribute("content", t.title); }})
    .on('meta[name="twitter:description"]', { element(e){ e.setAttribute("content", t.desc); }})
    .on('meta[name="twitter:image"]',       { element(e){ e.setAttribute("content", img); }})
    .on("head", { element(e) {
      e.append(`<link rel="alternate" hreflang="ko" href="${origin}/ko">`, { html: true });
      e.append(`<link rel="alternate" hreflang="en" href="${origin}/en">`, { html: true });
      e.append(`<link rel="alternate" hreflang="x-default" href="${origin}/">`, { html: true });
      e.append(`<script>window.__LANG__=${JSON.stringify(lang)};</script>`, { html: true });
    }})
    .transform(res);
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/"; // 끝 슬래시 정리

  // 1) 루트 → IP 언어로 리다이렉트
  if (path === "/" || path === "/index.html") {
    const lang = pickLang(request);
    return Response.redirect(`${url.origin}/${lang}`, 302);
  }

  // 2) 언어 페이지 → 단일 템플릿을 언어별로 서빙
  if (path === "/ko" || path === "/en") {
    const lang = path === "/en" ? "en" : "ko";
    const assetRes = await env.ASSETS.fetch(new URL("/index.html", url.origin));
    return localize(assetRes, lang, url);
  }

  // 3) 그 외(/og, 정적 자산 등)는 그대로
  return next();
}
