import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, BookOpen, ChevronRight, Hash, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { QUIZ_DATABASE, Question } from '../data/quizData';
import { CompletedExamInfo } from '../types';
import { RedPenCheckMark } from './RedPenCircle';
import { sound } from '../utils/audio';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (roundKey: string, question: Question) => void;
  completedExams: Record<string, CompletedExamInfo>;
}

interface SearchItem {
  roundKey: string;
  roundLabel: string;
  roundYear: string;
  q: Question;
  fullText: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
  completedExams
}) => {
  const [query, setQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all questions with metadata
  const allIndexedQuestions = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [];
    Object.entries(QUIZ_DATABASE).forEach(([roundKey, roundData]) => {
      roundData.questions.forEach((q) => {
        const fullText = `${q.q} ${q.opts.join(' ')} ${q.note || ''} ${q.category || ''} ${roundData.label} ${q.n}번`.toLowerCase();
        list.push({
          roundKey,
          roundLabel: roundData.label,
          roundYear: roundData.year,
          q,
          fullText
        });
      });
    });
    return list;
  }, []);

  // Extract unique categories and years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(Object.values(QUIZ_DATABASE).map(s => s.year)));
    return years.sort((a, b) => Number(b) - Number(a));
  }, []);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allIndexedQuestions.forEach(item => {
      if (item.q.category) {
        cats.add(item.q.category);
      }
    });
    return Array.from(cats).sort();
  }, [allIndexedQuestions]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedYearFilter('ALL');
      setSelectedCategoryFilter('ALL');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const terms = trimmed.split(/\s+/).filter(Boolean);

    return allIndexedQuestions.filter(item => {
      // Year filter
      if (selectedYearFilter !== 'ALL' && item.roundYear !== selectedYearFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'ALL' && item.q.category !== selectedCategoryFilter) {
        return false;
      }
      // Keyword search
      if (terms.length === 0) {
        // If no search query, only show when filter is applied or show top 30
        return selectedYearFilter !== 'ALL' || selectedCategoryFilter !== 'ALL';
      }
      return terms.every(term => item.fullText.includes(term));
    });
  }, [allIndexedQuestions, query, selectedYearFilter, selectedCategoryFilter]);

  if (!isOpen) return null;

  const handlePickQuestion = (roundKey: string, question: Question) => {
    sound.playPencilMark();
    onSelectQuestion(roundKey, question);
    onClose();
  };

  // Helper to highlight matched terms
  const highlightMatches = (text: string, searchWords: string[]) => {
    if (!searchWords.length || !text) return text;
    const regex = new RegExp(`(${searchWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-(--a-orange) text-(--a-orange) font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const currentSearchWords = query.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-(--a-card) paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-(--a-sep) overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search Input */}
        <div className="p-4 sm:p-5 border-b border-(--a-sep) bg-(--a-fill)">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-typewriter text-[11px] font-bold px-2 py-0.5 bg-(--a-fill-2) border border-(--a-sep) text-(--a-label) rounded">
                SEARCH ENGINE
              </span>
              <h3 className="font-serif-kr font-bold text-lg text-(--a-label) flex items-center gap-1.5">
                <span>900문항 통합 기출문제 검색</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-(--a-label-2) hover:bg-(--a-fill) transition-colors cursor-pointer"
              title="검색창 닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--a-label-2)">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 차대번호, 프런트 펜더, 보증기간, 용접, A필러, 노킹..."
              className="w-full pl-11 pr-10 py-3 bg-(--a-fill) border border-(--a-sep) focus:border-(--a-accent) focus:ring-2 focus:ring-(--a-accent)/20 rounded-xl font-serif-kr text-sm sm:text-base text-(--a-label) placeholder:text-(--a-label-3) shadow-inner transition-all outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--a-label-2) hover:text-(--a-label) cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters (Year / Category) */}
          <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-(--a-sep) text-xs">
            <div className="flex items-center gap-1 text-(--a-label-2) font-medium mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>필터:</span>
            </div>

            {/* Year filter chips */}
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-(--a-card) border border-(--a-sep) text-(--a-label) font-serif-kr rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer hover:border-(--a-sep)"
            >
              <option value="ALL">전체 연도 (2019~2026)</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}년도 기출</option>
              ))}
            </select>

            {/* Category filter */}
            {availableCategories.length > 0 && (
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-(--a-card) border border-(--a-sep) text-(--a-label) font-serif-kr rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer hover:border-(--a-sep)"
              >
                <option value="ALL">전체 분야 카테고리</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Clear filters shortcut */}
            {(selectedYearFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' || query) && (
              <button
                onClick={() => {
                  setSelectedYearFilter('ALL');
                  setSelectedCategoryFilter('ALL');
                  setQuery('');
                }}
                className="ml-auto text-[11px] text-(--a-red) hover:underline cursor-pointer font-hand"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-(--a-sep)">
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-(--a-label-2) font-mono-custom pb-1">
                <span>
                  검색 결과: <strong className="text-(--a-label)">{searchResults.length}</strong>개 문항
                </span>
                <span className="text-[11px]">클릭 시 해당 시험지로 즉시 이동</span>
              </div>

              {searchResults.slice(0, 50).map(({ roundKey, roundLabel, q }, idx) => {
                const isCompleted = !!completedExams[roundKey];

                return (
                  <div
                    key={`${roundKey}-${q.n}-${idx}`}
                    onClick={() => handlePickQuestion(roundKey, q)}
                    className="pt-3 group cursor-pointer"
                  >
                    <div className="p-3.5 rounded-xl border border-(--a-sep) bg-(--a-card) hover:bg-(--a-fill) hover:border-(--a-accent) transition-all shadow-2xs hover:shadow-sm">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono-custom text-[11px] font-bold px-2 py-0.5 rounded bg-(--a-inverse-bg) text-(--a-inverse-fg)">
                            Q{q.n}
                          </span>
                          <span className="font-serif-kr text-xs font-semibold text-(--a-accent) bg-(--a-accent-soft) px-2 py-0.5 rounded border border-(--a-sep)">
                            {roundLabel}
                          </span>
                          {q.category && (
                            <span className="font-serif-kr text-[11px] text-(--a-label) bg-(--a-fill) px-1.5 py-0.5 rounded">
                              {q.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCompleted && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-hand font-bold text-(--a-red) bg-(--a-red-soft) px-1.5 py-0.5 rounded border border-(--a-red-line)">
                              <RedPenCheckMark size="xs" animate={false} />
                              <span>응시함</span>
                            </span>
                          )}
                          <span className="text-xs text-(--a-label-2) group-hover:text-(--a-accent) flex items-center font-medium">
                            풀어보기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <p className="font-serif-kr text-sm text-(--a-label) leading-relaxed line-clamp-3 mb-2 font-medium">
                        {highlightMatches(q.q, currentSearchWords)}
                      </p>

                      {/* Options Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-(--a-label-2) font-serif-kr bg-(--a-card)/70 p-2 rounded-lg border border-(--a-sep)">
                        {q.opts.map((opt, optIdx) => (
                          <div key={optIdx} className="truncate">
                            <span className="font-mono-custom text-(--a-label-2) mr-1">
                              {['①', '②', '③', '④'][optIdx]}
                            </span>
                            <span>{highlightMatches(opt, currentSearchWords)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {searchResults.length > 50 && (
                <div className="text-center py-3 text-xs text-(--a-label-2) font-hand">
                  결과가 많아 상위 50개 문항만 표시되었습니다. 검색어를 더 구체적으로 입력해보세요.
                </div>
              )}
            </div>
          ) : query || selectedYearFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-(--a-fill) text-(--a-label-2) flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-serif-kr font-bold text-base text-(--a-label) mb-1">
                일치하는 기출문제를 찾지 못했습니다
              </h4>
              <p className="font-serif-kr text-xs text-(--a-label-2)">
                검색어 철자를 확인하거나 다른 키워드(예: 펜더, 차대번호, 용접, 엔진오일)로 검색해 보세요.
              </p>
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-(--a-fill) border border-(--a-sep) text-(--a-accent) flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-serif-kr font-bold text-base text-(--a-label) mb-1.5">
                  궁금한 단어나 문제 키워드를 입력하세요
                </h4>
                <p className="font-serif-kr text-xs text-(--a-label-2) leading-relaxed mb-4">
                  2019년부터 2026년까지 수록된 전체 900개 기출문제 지문, 4지선다 보기, 해설에서 실시간으로 찾아냅니다.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                  <span className="text-[11px] text-(--a-label-2) font-medium mr-1">추천 검색어:</span>
                  {['차대번호', '침수', '프런트 펜더', '인하우스', '보증기간', '용접', '도장', '디스크 샌더'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 rounded-full bg-(--a-fill) hover:bg-(--a-fill-2) text-(--a-label) font-serif-kr border border-(--a-sep) transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-(--a-fill) border-t border-(--a-sep) flex items-center justify-between text-xs text-(--a-label-2)">
          <div className="font-mono-custom text-[11px]">
            총 15개 회차 · 900문항 수록
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-(--a-accent) hover:opacity-90 text-white font-serif-kr font-medium cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
