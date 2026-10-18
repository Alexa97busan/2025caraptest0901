import React from 'react';

// 사이트 첫 화면: 공부할 과정을 고른다.
// 자동차산업기사 → 시뮬레이터 모음(정적 페이지), 자동차진단평가사 2급 → 기출문제집(이 React 앱).
interface LandingProps {
  onOpenAppraiser: () => void;
}

const LAB_URL = './lab.html';

const Chevron = () => (
  <svg className="lp-chevron" viewBox="0 0 8 14" aria-hidden="true">
    <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 엔진 피스톤과 크랭크를 한 획으로 그린 아이콘 (자동차산업기사)
const EngineGlyph = () => (
  <svg className="lp-glyph" viewBox="0 0 96 96" aria-hidden="true">
    <rect x="30" y="10" width="36" height="30" rx="6" />
    <path d="M30 22h36M30 30h36" />
    <path d="M48 40v18" />
    <circle cx="48" cy="70" r="16" />
    <circle cx="48" cy="70" r="3.5" />
    <path d="M48 58l9 10" />
  </svg>
);

// 차 옆모습 위로 돋보기를 겹친 아이콘 (자동차진단평가사)
const AppraiseGlyph = () => (
  <svg className="lp-glyph" viewBox="0 0 96 96" aria-hidden="true">
    <path d="M12 62v-8l8-14c2-3 4-4 8-4h26c3 0 5 1 7 3l10 13h7c3 0 6 3 6 6v4" />
    <path d="M12 62h8M36 62h20M72 62h12" />
    <circle cx="28" cy="62" r="7" />
    <circle cx="64" cy="62" r="7" />
    <circle cx="58" cy="28" r="12" />
    <path d="M66.5 36.5 76 46" />
  </svg>
);

export const Landing: React.FC<LandingProps> = ({ onOpenAppraiser }) => (
  <div className="lp">
    <header className="lp-nav">
      <div className="lp-nav-inner">
        <span className="lp-wordmark">CarLab</span>
        <span className="lp-nav-note">자동차 자격 공부</span>
      </div>
    </header>

    <main className="lp-main">
      <section className="lp-hero">
        <p className="lp-eyebrow">CarLab</p>
        <h1 className="lp-title">오늘은 무엇을<br />공부할까요.</h1>
        <p className="lp-lead">원하는 과정을 선택하세요.</p>
      </section>

      <section className="lp-grid" aria-label="공부할 과정 선택">
        <a className="lp-tile" href={LAB_URL} style={{ '--d': '120ms' } as React.CSSProperties}>
          <span className="lp-kicker">국가기술자격</span>
          <h2 className="lp-name">자동차산업기사</h2>
          <p className="lp-desc">엔진, 섀시, 전기. 공식을 직접 움직여 보며 이해합니다.</p>
          <EngineGlyph />
          <dl className="lp-stats">
            <div><dt>시뮬레이터</dt><dd>8</dd></div>
            <div><dt>연습 문제</dt><dd>32</dd></div>
          </dl>
          <span className="lp-cta">학습 시작하기<Chevron /></span>
        </a>

        <button type="button" className="lp-tile" onClick={onOpenAppraiser} style={{ '--d': '200ms' } as React.CSSProperties}>
          <span className="lp-kicker">국가공인 자격</span>
          <h2 className="lp-name">자동차진단평가사 2급</h2>
          <p className="lp-desc">2019년부터 2026년까지. 실제 시험지처럼 풀고 채점합니다.</p>
          <AppraiseGlyph />
          <dl className="lp-stats">
            <div><dt>기출 회차</dt><dd>15</dd></div>
            <div><dt>문항</dt><dd>900</dd></div>
          </dl>
          <span className="lp-cta">기출문제 풀기<Chevron /></span>
        </button>
      </section>
    </main>

    <footer className="lp-foot">
      <p>학습용으로 단순화한 모델과 직접 작성한 연습 문제가 포함되어 있습니다. 정비 기준값은 차종별 정비지침서를 따르세요.</p>
    </footer>
  </div>
);
