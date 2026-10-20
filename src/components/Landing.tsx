import React, { useEffect, useRef, useState } from 'react';

// 사이트 첫 화면.
// 그림은 아이콘 대신 이 사이트 시뮬레이터의 실제 화면을 쓰고, 진단평가사 쪽은 실제 기출 한 문제를 바로 풀어 보게 한다.
interface LandingProps {
  onOpenAppraiser: () => void;
}

const LAB_URL = './lab.html';
const IMG = './landing/';

// 자동차산업기사: 시뮬레이터·계산기 12개 (lab.html 의 카드와 같은 순서)
const TOOLS: [string, string][] = [
  ['단진자 3D', 'pendulum.html'],
  ['4행정 엔진', 'engine.html'],
  ['정비 이론 계산기 (마력·토크)', 'calc.html#power'],
  ['현가장치 스프링·댐퍼', 'suspension.html'],
  ['현가장치 형식 5종', 'suspension-types.html'],
  ['브레이크 유압', 'brake.html'],
  ['디스크 브레이크 단면', 'disc-brake.html'],
  ['조향 장치', 'steering.html'],
  ['변속기 기어비', 'gearbox.html'],
  ['디퍼렌셜', 'differential.html'],
  ['전기회로 실습판', 'circuit.html'],
  ['릴레이 회로', 'relay.html'],
];

const SHOTS = [
  { src: 'suspension.jpg', href: 'suspension-types.html', cap: '현가장치 형식 5종: 위시본 형식의 캠버·윤거 변화', w: 1500, h: 844 },
  { src: 'differential.jpg', href: 'differential.html', cap: '디퍼렌셜: 한쪽 빙판에서 공회전하는 오픈 디퍼렌셜', w: 1004, h: 566 },
  { src: 'engine.jpg', href: 'engine.html', cap: '4행정 엔진: 흡입 행정', w: 547, h: 630 },
  { src: 'circuit.jpg', href: 'circuit.html', cap: '전기회로 실습판: 멀티미터를 직접 꽂아 측정', w: 1004, h: 566 },
];

// 실제 기출: 2019년 제21회 19번
const VIN = 'KMHMF31WPXU123456';
const Q = {
  from: '2019년 제21회 19번',
  text: '현대자동차 차대번호(KMHMF31WPXU123456)에서 10번째 자리 X 가 나타내는 것은?',
  opts: ['제작연도', '용도 구분', '제작 공장', '제작 일련번호'],
  answer: 0,
  note: '차대번호 17자리 중 10번째는 제작연도(모델 연도) 부호입니다. 11번째(U)는 제작 공장, 12~17번째(123456)는 제작 일련번호입니다.',
};

export const Landing: React.FC<LandingProps> = ({ onOpenAppraiser }) => {
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<number | null>(null);

  // 섹션이 화면에 들어오면 제목 → 글 → 그림 순서로 한 번 떠오른다. 스크립트가 없거나 '동작 줄이기'면 처음부터 보인다.
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.prototype.slice.call(el.querySelectorAll('[data-rise]')) as HTMLElement[];
    items.forEach((n) => n.classList.add('lp-wait'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('lp-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const answered = picked !== null;
  const right = picked === Q.answer;

  return (
    <div className="lp" ref={root}>
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <span className="lp-wordmark">CarLab</span>
          <nav className="lp-nav-links" aria-label="과정">
            <a href={LAB_URL}>산업기사 실습</a>
            <button type="button" onClick={onOpenAppraiser}>진단평가사 기출</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="lp-wrap lp-hero">
          <h1 className="lp-title" data-rise>움직여 보며 공부하는<br />자동차 자격증</h1>
          <div className="lp-hero-row">
            <p className="lp-lead" data-rise style={{ '--d': '80ms' } as React.CSSProperties}>
              자동차산업기사는 시뮬레이터 12개로 공식을 직접 움직여 보고, 자동차진단평가사 2급은 2019–2026년 기출 900문항을 실제 시험지처럼 풉니다.
            </p>
            <div className="lp-actions" data-rise style={{ '--d': '160ms' } as React.CSSProperties}>
              <a className="lp-btn lp-btn-primary" href={LAB_URL}>산업기사 실습 시작</a>
              <button type="button" className="lp-btn lp-btn-quiet" onClick={onOpenAppraiser}>진단평가사 기출 풀기</button>
            </div>
          </div>
          <figure className="lp-hero-shot" data-rise style={{ '--d': '240ms' } as React.CSSProperties}>
            <a href="disc-brake.html" aria-label="디스크 브레이크 단면 모형 열기">
              <img src={IMG + 'disc-brake.jpg'} width={1290} height={1000} alt="디스크 브레이크 단면 모형. 페달을 끝까지 밟아 라인압 19.7 bar, 제동 토크 254 N·m가 표시된 상태" />
            </a>
            <figcaption>디스크 브레이크 단면 모형. 페달 힘 300 N이 라인압 19.7 bar를 거쳐 제동 토크 254 N·m가 됩니다.</figcaption>
          </figure>
        </section>

        <section className="lp-wrap lp-lab" aria-labelledby="lab-h">
          <div className="lp-lab-text">
            <h2 id="lab-h" data-rise>자동차산업기사 실습</h2>
            <p data-rise style={{ '--d': '80ms' } as React.CSSProperties}>
              공식을 손으로 움직입니다. 값을 바꾸면 그림과 계산이 함께 바뀌어서, 외우기 전에 왜 그런 값이 나오는지 먼저 봅니다. 기출 유형 연습 문제 32개와 숫자가 매번 바뀌는 계산 문제도 들어 있습니다.
            </p>
            <ul className="lp-tools" data-rise style={{ '--d': '160ms' } as React.CSSProperties}>
              {TOOLS.map(([name, href]) => (
                <li key={href}><a href={href}>{name}</a></li>
              ))}
            </ul>
            <a className="lp-btn lp-btn-primary" href={LAB_URL} data-rise style={{ '--d': '240ms' } as React.CSSProperties}>전체 목록 보기</a>
          </div>
          <div className="lp-shots">
            {SHOTS.map((s, i) => (
              <figure key={s.src} className={'lp-shot lp-shot-' + i} data-rise style={{ '--d': `${120 + i * 80}ms` } as React.CSSProperties}>
                <a href={s.href}><img src={IMG + s.src} width={s.w} height={s.h} alt={s.cap} loading="lazy" /></a>
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="lp-field" aria-labelledby="exam-h">
          <div className="lp-wrap lp-exam">
            <div className="lp-exam-text">
              <h2 id="exam-h" data-rise>자동차진단평가사 2급, 기출 한 문제부터</h2>
              <p data-rise style={{ '--d': '80ms' } as React.CSSProperties}>
                2019년 제21회부터 2026년 제42회까지 15개 회차, 900문항. 회차를 골라 실제 시험처럼 풀고, 제출하면 바로 채점과 해설을 봅니다.
              </p>
              <button type="button" className="lp-btn lp-btn-light" onClick={onOpenAppraiser} data-rise style={{ '--d': '160ms' } as React.CSSProperties}>기출 900문항 풀기</button>
            </div>

            <div className="lp-q" data-rise style={{ '--d': '120ms' } as React.CSSProperties}>
              <p className="lp-vin" aria-label={'차대번호 ' + VIN.split('').join(' ')}>
                {VIN.split('').map((c, i) => (
                  <span key={i} className={i === 9 ? 'is-key' : undefined}>{c}</span>
                ))}
              </p>
              <p className="lp-q-text">{Q.text}</p>
              <div className="lp-opts" role="group" aria-label="보기">
                {Q.opts.map((o, i) => (
                  <button
                    key={o}
                    type="button"
                    className="lp-opt"
                    data-state={!answered ? undefined : i === Q.answer ? 'right' : i === picked ? 'wrong' : 'dim'}
                    disabled={answered}
                    onClick={() => setPicked(i)}
                  >
                    <span className="lp-opt-n">{i + 1}</span>{o}
                  </button>
                ))}
              </div>
              <p className="lp-q-result" role="status">
                {answered ? (
                  <><b>{right ? '정답입니다.' : `정답은 ${Q.answer + 1}번 ${Q.opts[Q.answer]}입니다.`}</b> {Q.note}</>
                ) : (
                  <>{Q.from} 실제 기출입니다. 보기를 눌러 보세요.</>
                )}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <p className="lp-foot-name" aria-hidden="true">CarLab</p>
          <p className="lp-foot-note">학습용으로 단순화한 모델과 직접 작성한 연습 문제가 들어 있습니다. 정비 기준값은 차종별 정비지침서를 따르세요.</p>
        </div>
      </footer>
    </div>
  );
};
