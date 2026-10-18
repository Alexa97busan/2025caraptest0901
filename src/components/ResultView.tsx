import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';
import { Question } from '../data/quizData';
import { StampBadge } from './StampBadge';
import { QuestionDiagram } from './QuestionDiagram';
import { sound } from '../utils/audio';

interface ResultViewProps {
  yearLabel: string;
  questions: Question[];
  answers: Array<{ selected: number; correct: boolean } | null>;
  onRetryWrongOnly: () => void;
  onRestartAll: () => void;
  onGoHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  yearLabel,
  questions,
  answers,
  onRetryWrongOnly,
  onRestartAll,
  onGoHome
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const total = questions.length;
  const correctCount = answers.filter(a => a?.correct).length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const isPassed = scorePercent >= 60;

  // Category breakdown stats calculations
  const categoryOrder = ['법규·제도', '구조·섀시', '외판·도장', '견적·평가'];
  const categoriesMap: Record<string, { total: number; correct: number; wrong: number }> = {};
  
  questions.forEach((q, idx) => {
    const cat = q.category || '기타';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { total: 0, correct: 0, wrong: 0 };
    }
    categoriesMap[cat].total += 1;
    if (answers[idx]?.correct) {
      categoriesMap[cat].correct += 1;
    } else {
      categoriesMap[cat].wrong += 1;
    }
  });

  const categoryKeys = Object.keys(categoriesMap).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const categoryStats = categoryKeys.map(catName => {
    const info = categoriesMap[catName];
    const pct = info.total > 0 ? Math.round((info.correct / info.total) * 100) : 0;
    return {
      name: catName,
      total: info.total,
      correct: info.correct,
      wrong: info.wrong,
      pct
    };
  });

  // Sort by accuracy to identify strongest & weakest subjects
  const sortedByPct = [...categoryStats].sort((a, b) => b.pct - a.pct);
  const strongestCategory = sortedByPct[0];
  const weakestCategory = sortedByPct[sortedByPct.length - 1];

  const wrongQuestions = questions
    .map((q, idx) => ({ q, ans: answers[idx], originalIndex: idx }))
    .filter(item => item.ans && !item.ans.correct);

  React.useEffect(() => {
    if (isPassed) {
      sound.playStampSound();
      sound.playCorrectChime();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    } else {
      sound.playStampSound();
    }
  }, [isPassed]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-3 sm:px-4">
      {/* Graded Test Report Card Container */}
      <div className="relative bg-(--a-card) paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-(--a-sep) p-6 sm:p-8 overflow-hidden">
        
        {/* Washi Tape Header */}

        {/* Official Header */}
        <div className="text-center pb-4 mb-6 border-b border-(--a-sep) pt-2">
          <span className="font-mono-custom text-xs font-bold text-(--a-label-2) px-3 py-1 bg-(--a-fill) rounded-full border border-(--a-sep)">
            국가공인 자동차진단평가사 2급 필기시험 채점표
          </span>
          <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-(--a-label) mt-2">
            {yearLabel} 검정 결과
          </h1>
        </div>

        {/* Score & Stamp Showcase Area */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-(--a-fill) rounded-2xl border border-(--a-sep) mb-6 relative">
          
          {/* Big Score with Red Pen Circle */}
          <div className="relative flex flex-col items-center justify-center p-4">
            <div className="relative">
              <span className="font-mono-custom text-6xl sm:text-7xl font-extrabold text-(--a-red) tracking-tight">
                {scorePercent}
              </span>
              <span className="text-2xl font-bold text-(--a-red) ml-1">점</span>

              {/* Hand-drawn Red Circle around score */}
              <svg
                viewBox="0 0 160 120"
                className="absolute -inset-6 w-full h-full pointer-events-none scale-125"
                style={{ overflow: 'visible' }}
              >
                <path
                  d="M 25,60 C 25,25 70,12 110,12 C 148,12 165,38 162,65 C 158,95 125,115 80,112 C 38,110 15,88 18,55 C 22,20 80,8 120,10"
                  fill="none"
                  stroke="#ff3b30"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-draw-circle"
                />
              </svg>
            </div>

            <div className="text-xs font-serif-kr text-(--a-label-2) font-semibold mt-3">
              정답 {correctCount}개 / 총 {total}문항
            </div>
          </div>

          {/* Official Stamp badge */}
          <div className="flex flex-col items-center gap-2">
            {isPassed ? (
              <StampBadge type="passed" />
            ) : (
              <StampBadge type="review" />
            )}

            <p className="font-serif-kr text-xs text-center text-(--a-label) max-w-[200px]">
              {isPassed
                ? '축하합니다! 합격 기준 60점을 달성하셨습니다. 완벽한 실전 감각입니다.'
                : '합격 기준(60점)에 미치지 못했습니다. 아래 오답노트를 다시 복습해 보세요.'}
            </p>
          </div>
        </div>

        {/* Statistics Summary: Category Performance Breakdown */}
        <div className="mb-6 p-4 sm:p-5 bg-(--a-card) rounded-xl border border-(--a-sep) shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-(--a-sep) mb-3">
            <h3 className="font-serif-kr font-bold text-sm text-(--a-label) flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-(--a-accent)" /> 과목 영역별 정답률 통계 요약
            </h3>
            <span className="font-mono-custom text-xs font-bold text-(--a-label-2) px-2 py-0.5 bg-(--a-fill) rounded border border-(--a-sep)">
              전체 정답률 {scorePercent}%
            </span>
          </div>

          {/* Strongest & Weakest Diagnostic Insight */}
          {categoryStats.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 p-3 bg-(--a-fill) rounded-lg border border-(--a-sep) text-xs font-serif-kr">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-(--a-green-soft) border border-(--a-green-line) text-(--a-green) flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="text-(--a-label-2) text-[11px] block">최고 득점 영역</span>
                  <span className="font-bold text-(--a-label)">
                    {strongestCategory.name} ({strongestCategory.pct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-(--a-red-soft) border border-(--a-red-line) text-(--a-red) flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="text-(--a-label-2) text-[11px] block">집중 보강 영역</span>
                  <span className="font-bold text-(--a-red)">
                    {weakestCategory.name} ({weakestCategory.pct}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryStats.map(stat => {
              const isHigh = stat.pct >= 80;
              const isPass = stat.pct >= 60;

              return (
                <div 
                  key={stat.name}
                  className="p-3 bg-(--a-card) rounded-lg border border-(--a-sep) flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif-kr font-bold text-xs text-(--a-label)">
                      {stat.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-serif-kr ${
                        isHigh 
                          ? 'bg-(--a-green-soft) text-(--a-green) border border-(--a-green-line)' 
                          : isPass 
                          ? 'bg-(--a-yellow-soft) text-(--a-orange) border border-(--a-yellow-line)'
                          : 'bg-(--a-red-soft) text-(--a-red) border border-(--a-red-line)'
                      }`}>
                        {isHigh ? '우수' : isPass ? '합격권' : '보강필요'}
                      </span>
                      <span className="font-mono-custom font-extrabold text-xs text-(--a-label)">
                        {stat.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-(--a-fill) rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh 
                          ? 'bg-(--a-green)' 
                          : isPass 
                          ? 'bg-(--a-orange)' 
                          : 'bg-(--a-red)'
                      }`}
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>

                  {/* Detailed Counts */}
                  <div className="flex items-center justify-between text-[11px] font-mono-custom text-(--a-label-2)">
                    <span>정답 <strong className="text-(--a-green) font-bold">{stat.correct}</strong>문항</span>
                    <span>오답 <strong className="text-(--a-red) font-bold">{stat.wrong}</strong>문항</span>
                    <span>총 {stat.total}문항</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {wrongQuestions.length > 0 && (
            <button
              id="retryWrongOnlyBtn"
              onClick={onRetryWrongOnly}
              className="py-3 px-4 bg-(--a-red) hover:bg-(--a-red) text-white font-serif-kr font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>틀린 {wrongQuestions.length}문제만 다시 풀기</span>
            </button>
          )}

          <button
            id="restartAllBtn"
            onClick={onRestartAll}
            className="py-3 px-4 bg-(--a-accent) hover:opacity-90 text-white font-serif-kr font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>처음부터 다시 풀기</span>
          </button>
        </div>

        {/* Wrong Questions Notebook Review Section */}
        {wrongQuestions.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-(--a-sep)">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif-kr font-bold text-base text-(--a-label) flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-(--a-red)" />
                <span>오답 노트 ({wrongQuestions.length}문항)</span>
              </h2>
              <span className="text-[11px] font-hand text-(--a-label-2)">
                터치하여 상세 해설 보기
              </span>
            </div>

            <div className="space-y-3">
              {wrongQuestions.map(({ q, ans, originalIndex }) => {
                const isExpanded = expandedIndex === originalIndex;

                return (
                  <div
                    key={q.n}
                    className="p-4 bg-(--a-card) paper-texture-lined rounded-xl border border-(--a-sep) shadow-2xs transition-all"
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                      className="flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono-custom text-xs font-bold px-2 py-0.5 bg-(--a-red) text-white rounded">
                            Q{q.n}
                          </span>
                          <span className="text-xs font-mono-custom text-(--a-label-2)">
                            내 답: <strong className="text-(--a-red)">{(ans?.selected ?? 0) + 1}번</strong> · 
                            정답: <strong className="text-(--a-green)">{q.answer + 1}번</strong>
                          </span>
                        </div>
                        <p className="font-serif-kr text-sm font-semibold text-(--a-label)">
                          {q.q}
                        </p>
                      </div>

                      <button className="text-(--a-label-2) p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-(--a-sep) text-xs font-serif-kr text-(--a-label) leading-relaxed animate-fadeIn space-y-3">
                        {/* Diagram if available */}
                        {q.diagram && (
                          <QuestionDiagram type={q.diagram} />
                        )}

                        {/* Choice list breakdown */}
                        <div className="bg-(--a-fill) p-3 rounded-lg border border-(--a-sep) space-y-1.5">
                          <div className="text-[11px] font-bold text-(--a-label-2) mb-1 font-mono-custom">
                            [선택지 검토]
                          </div>
                          {q.opts.map((opt, optIdx) => {
                            const isUserPick = ans?.selected === optIdx;
                            const isCorrectPick = q.answer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`p-1.5 rounded flex items-start gap-2 text-xs ${
                                  isCorrectPick
                                    ? 'bg-(--a-green-soft) text-(--a-green) font-bold border border-(--a-green-line)'
                                    : isUserPick
                                    ? 'bg-(--a-red-soft) text-(--a-red) font-medium border border-(--a-red-line)'
                                    : 'text-(--a-label-2)'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-(--a-card)/70 flex items-center justify-center font-mono-custom text-[10px] font-bold flex-shrink-0 mt-0.5">
                                  {optIdx + 1}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                                {isCorrectPick && (
                                  <span className="text-[10px] bg-(--a-green) text-white px-1.5 py-0.5 rounded flex-shrink-0">
                                    정답
                                  </span>
                                )}
                                {isUserPick && !isCorrectPick && (
                                  <span className="text-[10px] bg-(--a-red) text-white px-1.5 py-0.5 rounded flex-shrink-0">
                                    내 오답 선택
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed In-Depth Examiner Note */}
                        <div className="p-3 bg-(--a-fill) rounded-lg border border-(--a-sep)">
                          <div className="font-bold text-(--a-red) mb-1.5 font-hand text-sm flex items-center gap-1">
                            <span>해설</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed text-(--a-label)">
                            {q.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Go to Home Cover Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onGoHome}
            className="text-xs font-serif-kr text-(--a-label-2) hover:text-(--a-label) hover:underline font-bold"
          >
            ← 메인 시험지 선택으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
