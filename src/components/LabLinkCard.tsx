import React from 'react';
import { FlaskConical, ArrowUpRight } from 'lucide-react';

// 인터랙티브 시뮬레이터 모음(public/lab.html)으로 가는 카드.
// 정적 HTML 페이지라 React 라우팅 대신 새 탭 링크로 연다. (상대 경로라 하위 경로 배포에서도 동작)
const LAB_URL = './lab.html';

const TOPICS = ['단진자', '엔진', '현가장치', '브레이크', '조향', '변속기', '전기회로', '릴레이', '마력·토크'];

export const LabLinkCard: React.FC = () => (
  <div className="w-full max-w-xl mx-auto px-4">
    <a
      href={LAB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative bg-(--a-card) paper-texture-ivory rounded-2xl paper-shadow-vintage border border-(--a-sep) p-5 sm:p-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--a-accent) focus-visible:outline-offset-2"
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-11 h-11 rounded-xl bg-(--a-accent-soft) flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-(--a-accent)" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-typewriter text-[11px] font-bold px-2 py-0.5 bg-(--a-fill-2) border border-(--a-sep) text-(--a-label) rounded">
              LAB
            </span>
            <span className="font-mono-custom text-[11px] text-(--a-label-2)">인터랙티브 시뮬레이터</span>
          </div>
          <h2 className="font-serif-kr text-lg sm:text-xl font-bold text-(--a-label) tracking-tight">
            물리 시스템 알기
          </h2>
          <p className="font-hand text-base text-(--a-label-2) mt-0.5 leading-snug">
            공식을 직접 움직여 보며 익히는 시뮬레이터 8개, 마력·토크 계산기, 연습 문제
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {TOPICS.map((t) => (
              <span
                key={t}
                className="text-[11px] font-serif-kr px-2 py-0.5 rounded-md bg-(--a-card) border border-(--a-sep) text-(--a-label-2)"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <ArrowUpRight className="shrink-0 w-5 h-5 text-(--a-label-2) transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  </div>
);
