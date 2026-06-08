import axios from 'axios';
import type {
  ApiResponse,
  User,
  PracticeRecord,
  CheckInStats,
  CheckInCalendar,
  CheckInRecord,
  DailyPracticeStat,
  PracticeOverview,
  WordItem,
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

// 认证
export const authApi = {
  register: (username: string, password: string, nickname?: string) =>
    api.post<ApiResponse<User>>('/auth/register', { username, password, nickname }),

  login: (username: string, password: string) =>
    api.post<ApiResponse<User>>('/auth/login', { username, password }),

  getProfile: (userId: number) =>
    api.get<ApiResponse<User>>(`/auth/profile/${userId}`),
};

// 练习
export const practiceApi = {
  saveRecord: (userId: number, record: {
    mode: string;
    difficulty: string;
    wpm: number;
    accuracy: number;
    durationSeconds: number;
    totalChars?: number;
    correctChars?: number;
    errorCount?: number;
  }) => api.post<ApiResponse<any>>(`/practice/record?userId=${userId}`, record),

  getRecords: (userId: number, page = 0, size = 20) =>
    api.get<ApiResponse<PracticeRecord[]>>(`/practice/records?userId=${userId}&page=${page}&size=${size}`),

  getRecentRecords: (userId: number, days = 7) =>
    api.get<ApiResponse<PracticeRecord[]>>(`/practice/recent?userId=${userId}&days=${days}`),

  getDailyStats: (userId: number, days = 30) =>
    api.get<ApiResponse<DailyPracticeStat[]>>(`/practice/daily-stats?userId=${userId}&days=${days}`),

  getOverview: (userId: number) =>
    api.get<ApiResponse<PracticeOverview>>(`/practice/overview?userId=${userId}`),
};

// 打卡
export const checkInApi = {
  checkIn: (userId: number) =>
    api.post<ApiResponse<any>>(`/checkin?userId=${userId}`),

  getStats: (userId: number) =>
    api.get<ApiResponse<CheckInStats>>(`/checkin/stats?userId=${userId}`),

  getCalendar: (userId: number, year: number, month: number) =>
    api.get<ApiResponse<CheckInCalendar>>(`/checkin/calendar?userId=${userId}&year=${year}&month=${month}`),

  getHistory: (userId: number, limit = 30) =>
    api.get<ApiResponse<CheckInRecord[]>>(`/checkin/history?userId=${userId}&limit=${limit}`),
};

// 练习内容
export const contentApi = {
  getWords: (userId: number, level = 'beginner', count = 20) =>
    api.get<ApiResponse<string[]>>(`/content/words?userId=${userId}&level=${level}&count=${count}`),

  getWordItems: (userId: number, level = 'beginner', count = 20) =>
    api.get<ApiResponse<WordItem[]>>(`/content/word-items?userId=${userId}&level=${level}&count=${count}`),

  getSentences: (userId: number, level = 'beginner', count = 5) =>
    api.get<ApiResponse<string[]>>(`/content/sentences?userId=${userId}&level=${level}&count=${count}`),

  getArticles: (topic = 'technology', count = 1) =>
    api.get<ApiResponse<string[]>>(`/content/articles?topic=${topic}&count=${count}`),

  recordWords: (userId: number, words: string[]) =>
    api.post<ApiResponse<string>>(`/content/record-words?userId=${userId}`, words),

  recordSentences: (userId: number, sentences: string[]) =>
    api.post<ApiResponse<string>>(`/content/record-sentences?userId=${userId}`, sentences),

  getWordStats: (userId: number) =>
    api.get<ApiResponse<any>>(`/content/word-stats?userId=${userId}`),

  getSentenceStats: (userId: number) =>
    api.get<ApiResponse<any>>(`/content/sentence-stats?userId=${userId}`),
};
