export interface User {
  id: number;
  username: string;
  nickname: string;
  totalPracticeCount: number;
  totalPracticeSeconds: number;
  bestWpm: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckinDays: number;
  createdAt: string;
}

export interface PracticeRecord {
  id: number;
  mode: 'WORDS' | 'SENTENCE' | 'ARTICLE' | 'CUSTOM';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  wpm: number;
  accuracy: number;
  durationSeconds: number;
  totalChars: number;
  correctChars: number;
  errorCount: number;
  createdAt: string;
}

export interface WordItem {
  word: string;
  translation: string;
}

export interface CheckInStats {
  currentStreak: number;
  longestStreak: number;
  totalCheckinDays: number;
  checkedInToday: boolean;
  today: CheckInRecord | null;
  lastCheckinDate: string | null;
}

export interface CheckInRecord {
  id: number;
  checkinDate: string;
  practiceCountToday: number;
  totalSecondsToday: number;
  bestWpmToday: number;
  streakDay: number;
  createdAt: string;
}

export interface CheckInCalendar {
  year: number;
  month: number;
  checkInDates: string[];
  days: CheckInRecord[];
  totalDays: number;
}

export interface DailyPracticeStat {
  date: string;
  avgWpm: number;
  avgAccuracy: number;
  count: number;
}

export interface GroupedPracticeStat {
  name: string;
  count: number;
  avgWpm: number;
  avgAccuracy: number;
}

export interface PracticeOverview {
  totalRecords: number;
  totalSeconds: number;
  bestWpm: number;
  bestAccuracy: number;
  averageWpm: number;
  averageAccuracy: number;
  totalChars: number;
  correctChars: number;
  errorCount: number;
  practiceDays: number;
  todayRecords: number;
  overallAccuracy: number;
  modeStats: GroupedPracticeStat[];
  difficultyStats: GroupedPracticeStat[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
