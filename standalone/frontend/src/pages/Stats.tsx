import { useEffect, useMemo, useState } from 'react';
import { practiceApi } from '../api';
import type {
  DailyPracticeStat,
  GroupedPracticeStat,
  PracticeOverview,
  PracticeRecord,
  User,
} from '../types';

interface StatsProps {
  user: User;
}

const modeLabels: Record<string, string> = {
  WORDS: '单词',
  SENTENCE: '句子',
  ARTICLE: '文章',
  CUSTOM: '自定义',
};

const difficultyLabels: Record<string, string> = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  ADVANCED: '高级',
  EXPERT: '专家',
};

export default function Stats({ user }: StatsProps) {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyPracticeStat[]>([]);
  const [overview, setOverview] = useState<PracticeOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [recordsRes, dailyRes, overviewRes] = await Promise.all([
          practiceApi.getRecords(user.id, 0, 50),
          practiceApi.getDailyStats(user.id, 30),
          practiceApi.getOverview(user.id),
        ]);
        setRecords(recordsRes.data.data);
        setDailyStats(dailyRes.data.data);
        setOverview(overviewRes.data.data);
      } catch (err) {
        console.error('加载统计数据失败', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user.id]);

  const maxDailyCount = useMemo(
    () => Math.max(1, ...dailyStats.map(stat => stat.count)),
    [dailyStats],
  );

  const maxDailyWpm = useMemo(
    () => Math.max(1, ...dailyStats.map(stat => stat.avgWpm)),
    [dailyStats],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    if (minutes > 0) return `${minutes}分钟${sec}秒`;
    return `${sec}秒`;
  };

  const renderGroupedStats = (
    title: string,
    stats: GroupedPracticeStat[],
    labels: Record<string, string>,
  ) => (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      {stats.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {stats.map(stat => (
            <div key={stat.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>{labels[stat.name] || stat.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {stat.count} 次 · {stat.avgWpm} WPM · {stat.avgAccuracy}%
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px' }}>
                <div
                  style={{
                    width: `${Math.max(8, (stat.count / Math.max(1, overview?.totalRecords || 1)) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          暂无数据
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>加载中...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>练习统计</h1>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{overview?.totalRecords || 0}</div>
          <div className="stat-label">总练习次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview?.averageWpm || 0}</div>
          <div className="stat-label">平均 WPM</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview?.overallAccuracy || 0}%</div>
          <div className="stat-label">总体准确率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(overview?.totalSeconds || 0)}</div>
          <div className="stat-label">总练习时长</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{overview?.bestWpm || 0}</div>
          <div className="stat-label">最高 WPM</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview?.bestAccuracy || 0}%</div>
          <div className="stat-label">最高准确率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview?.todayRecords || 0}</div>
          <div className="stat-label">今日练习</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview?.practiceDays || 0}</div>
          <div className="stat-label">练习天数</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>最近 30 天趋势</h3>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'end', height: '180px', overflowX: 'auto' }}>
          {dailyStats.map(stat => {
            const countHeight = (stat.count / maxDailyCount) * 100;
            const wpmHeight = (stat.avgWpm / maxDailyWpm) * 100;
            return (
              <div
                key={stat.date}
                title={`${stat.date}：${stat.count} 次，${stat.avgWpm} WPM，${stat.avgAccuracy}%`}
                style={{ minWidth: '28px', flex: '1 0 28px', textAlign: 'center' }}
              >
                <div style={{ height: '130px', display: 'flex', alignItems: 'end', gap: '3px', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '9px',
                      height: `${Math.max(stat.count ? 8 : 2, countHeight)}%`,
                      backgroundColor: stat.count ? 'var(--accent)' : 'var(--border)',
                      borderRadius: '5px 5px 0 0',
                    }}
                  />
                  <div
                    style={{
                      width: '9px',
                      height: `${Math.max(stat.avgWpm ? 8 : 2, wpmHeight)}%`,
                      backgroundColor: stat.avgWpm ? 'var(--success)' : 'var(--border)',
                      borderRadius: '5px 5px 0 0',
                    }}
                  />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {formatDate(stat.date)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span><span style={{ color: 'var(--accent)' }}>■</span> 练习次数</span>
          <span><span style={{ color: 'var(--success)' }}>■</span> 平均 WPM</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {renderGroupedStats('模式分布', overview?.modeStats || [], modeLabels)}
        {renderGroupedStats('难度分布', overview?.difficultyStats || [], difficultyLabels)}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>最近练习记录</h3>
        {records.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>时间</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>模式</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>难度</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>WPM</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>准确率</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>用时</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>错误</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{formatDate(record.createdAt)}</td>
                    <td style={{ padding: '0.75rem' }}>{modeLabels[record.mode]}</td>
                    <td style={{ padding: '0.75rem' }}>{difficultyLabels[record.difficulty]}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--accent)' }}>{record.wpm}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{record.accuracy}%</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatDuration(record.durationSeconds)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--error)' }}>{record.errorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            暂无练习记录
          </div>
        )}
      </div>
    </div>
  );
}
