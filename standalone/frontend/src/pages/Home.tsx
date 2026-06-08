import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { practiceApi, checkInApi } from '../api';
import type { User } from '../types';

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const [overview, setOverview] = useState<any>(null);
  const [checkInStats, setCheckInStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, checkInRes] = await Promise.all([
          practiceApi.getOverview(user.id),
          checkInApi.getStats(user.id),
        ]);
        setOverview(overviewRes.data.data);
        setCheckInStats(checkInRes.data.data);
      } catch (err) {
        console.error('加载数据失败', err);
      }
    };
    loadData();
  }, [user.id]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>
        欢迎回来，{user.nickname || user.username} 👋
      </h1>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{user.bestWpm || 0}</div>
          <div className="stat-label">最高 WPM</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.bestAccuracy || 0}%</div>
          <div className="stat-label">最高准确率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{checkInStats?.currentStreak || 0}</div>
          <div className="stat-label">连续打卡天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(user.totalPracticeSeconds || 0)}</div>
          <div className="stat-label">总练习时长</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/challenge" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
          🎯 每日挑战
        </Link>
        <Link to="/practice" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
          自由练习
        </Link>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>练习总览</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{overview?.totalRecords || 0}</div>
            <div className="stat-label">总练习次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview?.bestWpm || 0}</div>
            <div className="stat-label">历史最高 WPM</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview?.bestAccuracy || 0}%</div>
            <div className="stat-label">历史最高准确率</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{checkInStats?.totalCheckinDays || 0}</div>
            <div className="stat-label">总打卡天数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
