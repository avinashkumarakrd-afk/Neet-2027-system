export type StatType = 'physics' | 'chemistry' | 'biology' | 'mocks';

export interface Quest {
  id: string;
  title: string;
  stat: StatType;
  chaptersValue: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PlayerStats {
  physics: number;
  chemistry: number;
  biology: number;
  mocks: number;
  systemPoints: number;
  streak: number;
  lastLoginDate?: string;
}

export const MAX_STATS = {
  physics: 20,
  chemistry: 20,
  biology: 32,
  mocks: 100, // arbitrary max for mocks
};

export const RANK_THRESHOLDS = {
  E: 0,
  D: 10,
  C: 25,
  B: 45,
  A: 70,
  S: 100,
};

export const getRank = (totalChapters: number): string => {
  if (totalChapters >= RANK_THRESHOLDS.S) return 'S-Rank Monarch';
  if (totalChapters >= RANK_THRESHOLDS.A) return 'A-Rank Legend';
  if (totalChapters >= RANK_THRESHOLDS.B) return 'B-Rank Master';
  if (totalChapters >= RANK_THRESHOLDS.C) return 'C-Rank Elite';
  if (totalChapters >= RANK_THRESHOLDS.D) return 'D-Rank Hunter';
  return 'E-Rank Aspirant';
};

export const getLevel = (totalChapters: number): number => {
  return Math.floor(totalChapters / 2) + 1; // 1 level every 2 chapters
};

export const getNextLevelChapters = (level: number): number => {
  return level * 2;
};
