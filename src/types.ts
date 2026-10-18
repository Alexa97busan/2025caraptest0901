export interface CompletedExamInfo {
  lastCompletedAt: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  isPassed: boolean;
  mode: 'full' | 'quick20' | 'wrongOnly';
  timesTaken: number;
  bestScore: number;
}
