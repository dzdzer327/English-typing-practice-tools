import { useCallback, useEffect, useState } from 'react';
import { authApi, checkInApi } from '../api';
import type { CheckInCalendar, CheckInRecord, CheckInStats, User } from '../types';

interface CheckInProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function CheckIn({ user, onUserUpdate }: CheckInProps) {
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [calendar, setCalendar] = useState<CheckInCalendar | null>(null);
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInResult, setCheckInResult] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (minutes > 0) return `${minutes}分钟${sec}秒`;
    return `${sec}秒`;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, calendarRes, historyRes] = await Promise.all([
        checkInApi.getStats(user.id),
        checkInApi.getCalendar(user.id, currentYear, currentMonth),
        checkInApi.getHistory(user.id, 10),
      ]);
      setStats(statsRes.data.data);
      setCalendar(calendarRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      console.error('加载打卡数据失败', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshUser = async () => {
    const userRes = await authApi.getProfile(user.id);
    if (userRes.data.code === 200) {
      onUserUpdate(userRes.data.data);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await checkInApi.checkIn(user.id);
      setCheckInResult(res.data.message);
    } catch (err: any) {
      setCheckInResult(err.response?.data?.message || '打卡失败');
      return;
    }

    try {
      await Promise.all([loadData(), refreshUser()]);
    } catch (err) {
      console.error('刷新打卡数据失败', err);
    }
  };

  const renderCalendar = () => {
    if (!calendar) return null;

    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const checkInDates = new Set(calendar.checkInDates || []);
    const detailByDate = new Map(calendar.days.map(day => [day.checkinDate, day]));
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ minHeight: '74px' }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCheckedIn = checkInDates.has(dateStr);
      const isToday = day === now.getDate();
      const detail = detailByDate.get(dateStr);

      days.push(
        <div
          key={day}
          title={detail ? `${detail.practiceCountToday} 次练习，最佳 ${detail.bestWpmToday} WPM` : dateStr}
          style={{
            minHeight: '74px',
            padding: '0.65rem',
            borderRadius: '8px',
            backgroundColor: isCheckedIn ? 'rgba(59, 130, 246, 0.22)' : isToday ? 'var(--bg-card)' : 'transparent',
            border: isToday ? '1px solid var(--accent)' : '1px solid transparent',
            color: isCheckedIn ? 'var(--text-primary)' : isToday ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: isToday ? 'bold' : 'normal' }}>{day}</div>
          {isCheckedIn && (
            <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <div>{detail?.practiceCountToday || 0} 次</div>
              <div>{detail?.bestWpmToday || 0} WPM</div>
            </div>
          )}
        </div>,
      );
    }

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
          {['日', '一', '二', '三', '四', '五', '六'].map(dayName => (
            <div key={dayName} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '0.5rem' }}>
              {dayName}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>加载中...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>每日打卡</h1>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{stats?.currentStreak || 0}</div>
          <div className="stat-label">连续打卡天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.longestStreak || 0}</div>
          <div className="stat-label">最长连续天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalCheckinDays || 0}</div>
          <div className="stat-label">总打卡天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.today?.practiceCountToday || 0}</div>
          <div className="stat-label">今日练习次数</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {stats?.checkedInToday ? (
          <>
            <div style={{ color: 'var(--success)', fontSize: '1.25rem', marginBottom: '1rem' }}>
              今天已打卡
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.today?.bestWpmToday || 0}</div>
                <div className="stat-label">今日最佳 WPM</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatDuration(stats.today?.totalSecondsToday || 0)}</div>
                <div className="stat-label">今日练习时长</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleCheckIn} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
              立即打卡
            </button>
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              完成一次练习也会自动打卡
            </div>
          </>
        )}
        {checkInResult && (
          <div style={{ marginTop: '1rem', color: 'var(--accent)' }}>
            {checkInResult}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>
          {currentYear}年{currentMonth}月 打卡日历
        </h3>
        {renderCalendar()}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>最近打卡记录</h3>
        {history.length > 0 ? (
          <div>
            {history.map((record, index) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 0',
                  borderBottom: index < history.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)' }}>{record.checkinDate}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    连续第 {record.streakDay} 天 · {formatDuration(record.totalSecondsToday)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--accent)' }}>{record.bestWpmToday} WPM</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {record.practiceCountToday} 次练习
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            暂无打卡记录
          </div>
        )}
      </div>
    </div>
  );
}
