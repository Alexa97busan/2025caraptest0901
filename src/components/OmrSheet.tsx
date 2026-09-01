import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Question } from '../data/quizData';
import { haptics } from '../utils/haptics';

interface OmrSheetProps {
  questions: Question[];
  answers: Array<{ selected: number; correct: boolean } | null>;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  onClose: () => void;
  yearLabel: string;
  gradingMode?: 'instant' | 'exam';
}

export const OmrSheet: React.FC<OmrSheetProps> = ({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
  onClose,
  yearLabel,
  gradingMode = 'instant'
}) => {
  const isExamMode = gradingMode === 'exam';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#fdfbf7] paper-texture-lined rounded-xl paper-shadow-vintage border-2 border-[#d0c5b4] overflow-hidden max-h-[90vh] flex flex-col">
        {/* OMR Header styled like photo #4 */}
        <div className="px-5 py-3.5 bg-[#f5efe4] border-b-2 border-[#d5cbba] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#d92424] text-white text-[11px] font-bold rounded tracking-wider">
                OMR 답안지
              </span>
              <h3 className="font-serif-kr font-bold text-base text-[#2e261f]">
                {yearLabel} 자동차진단평가사 2급
              </h3>
            </div>
            <p className="text-[11px] font-mono-custom text-[#756a5c] mt-0.5">
              전체 60문항 · 마킹 진행률: {answers.filter(Boolean).length} / {questions.length}
            </p>
          </div>
          <button
            id="closeOmrBtn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#e4dbca] text-[#4a3f33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bubble Grid Layout (15 rows x 4 columns) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fcfaf5]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[0, 1, 2, 3].map((colIdx) => {
              const startIdx = colIdx * 15;
              const colQuestions = questions.slice(startIdx, startIdx + 15);

              return (
                <div
                  key={colIdx}
                  className="bg-white/90 rounded-lg p-2.5 border border-[#e2d8c7] shadow-2xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#eee6d8] text-[10px] font-mono-custom text-[#8c7d6b] px-1">
                    <span>문항</span>
                    <div className="flex gap-2.5 mr-1 font-bold">
                      <span>①</span>
                      <span>②</span>
                      <span>③</span>
                      <span>④</span>
                    </div>
                  </div>

                  {colQuestions.map((q, qIndexInCol) => {
                    const absIdx = startIdx + qIndexInCol;
                    const ans = answers[absIdx];
                    const isCurrent = absIdx === currentIndex;

                    return (
                      <div
                        key={q.n}
                        onClick={() => {
                          haptics.triggerOMR();
                          onSelectIndex(absIdx);
                          onClose();
                        }}
                        className={`flex items-center justify-between px-1.5 py-1 rounded cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#ffeec7] border border-[#f59e0b]'
                            : 'hover:bg-[#f6f2e8]'
                        }`}
                      >
                        <span className="font-mono-custom text-xs font-bold text-[#44382e] w-7">
                          {String(q.n).padStart(2, '0')}
                        </span>

                        <div className="flex items-center gap-2">
                          {[0, 1, 2, 3].map((choiceNum) => {
                            const isSelected = ans?.selected === choiceNum;
                            const isCorrectAns = q.answer === choiceNum;

                            return (
                              <div
                                key={choiceNum}
                                className="relative flex items-center justify-center w-4 h-4"
                              >
                                {/* OMR Bubble circle */}
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-mono-custom ${
                                    isSelected
                                      ? 'bg-[#1f2937] text-white border-[#111827] shadow-inner font-bold'
                                      : 'border-[#a89b88] text-[#786c5c] bg-[#faf8f2]'
                                  }`}
                                >
                                  {isSelected ? '' : choiceNum + 1}
                                </div>

                                {/* Graded red pen markings if answered (Instant Mode Only) */}
                                {!isExamMode && ans && isSelected && (
                                  ans.correct ? (
                                    <div className="absolute -inset-1 pointer-events-none flex items-center justify-center">
                                      <div className="w-5 h-5 rounded-full border-2 border-red-600 animate-draw-circle" />
                                    </div>
                                  ) : (
                                    <div className="absolute -inset-0.5 pointer-events-none text-red-600 font-bold text-xs flex items-center justify-center">
                                      /
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#f0e8d8] border-t border-[#d8cdb8] flex items-center justify-between text-xs text-[#5c5042]">
          <div className="flex items-center gap-4">
            {!isExamMode ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  정답: {answers.filter(a => a?.correct).length}개
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  오답: {answers.filter(a => a && !a.correct).length}개
                </span>
              </>
            ) : (
              <span className="font-serif-kr font-medium text-[#3b3228]">
                📝 마킹 완료: <strong>{answers.filter(Boolean).length}</strong> / {questions.length}문항 (시험 제출 시 채점)
              </span>
            )}
          </div>
          <span className="font-hand text-sm text-[#7a6b57]">
            클릭하여 해당 문항으로 바로 이동할 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
};
