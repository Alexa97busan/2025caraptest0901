import React from 'react';
import { Award, CheckCircle, Sparkles } from 'lucide-react';

interface StampProps {
  type: 'praise' | 'perfect' | 'passed' | 'review' | 'correct';
  className?: string;
}

// 결과 상태를 알려주는 알약형 배지. 등장할 때 살짝 커졌다 자리 잡으며 상태 변화를 알린다(.animate-stamp).
const PILL = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold animate-stamp';

export const StampBadge: React.FC<StampProps> = ({ type, className = '' }) => {
  if (type === 'praise' || type === 'correct') {
    return (
      <div className={`${PILL} bg-(--a-green-soft) text-(--a-green) ${className}`}>
        <Award className="w-4 h-4" />
        <span>참 잘했어요</span>
      </div>
    );
  }

  if (type === 'perfect') {
    return (
      <div className={`${PILL} bg-(--a-accent-soft) text-(--a-accent) ${className}`}>
        <Sparkles className="w-4 h-4" />
        <span>100점 만점</span>
      </div>
    );
  }

  if (type === 'passed') {
    return (
      <div className={`${PILL} bg-(--a-green-soft) text-(--a-green) ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span>합격 · 60% 이상</span>
      </div>
    );
  }

  return (
    <div className={`${PILL} bg-(--a-red-soft) text-(--a-red) ${className}`}>
      <span>오답 집중 복습</span>
    </div>
  );
};
