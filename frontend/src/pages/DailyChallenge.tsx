import { useState, useEffect, useCallback } from 'react';
import { contentApi, practiceApi, checkInApi, authApi } from '../api';
import TypingArea from '../components/TypingArea';
import type { User } from '../types';

interface DailyChallengeProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

interface Challenge {
  type: 'words' | 'sentence';
  content: string[];
  text: string;
}

export default function DailyChallenge({ user, onUserUpdate }: DailyChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Array<{
    wpm: number;
    accuracy: number;
    duration: number;
    totalChars: number;
    correctChars: number;
    errorCount: number;
  }>>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 加载每日挑战内容
  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      // 获取 2 组单词 + 2 组句子
      const [words1, words2, sentences1, sentences2] = await Promise.all([
        contentApi.getWords(user.id, 'beginner', 10),
        contentApi.getWords(user.id, 'intermediate', 10),
        contentApi.getSentences(user.id, 'beginner', 2),
        contentApi.getSentences(user.id, 'intermediate', 2),
      ]);

      const challengeList: Challenge[] = [
        { type: 'words', content: words1.data.data, text: words1.data.data.join(' ') },
        { type: 'words', content: words2.data.data, text: words2.data.data.join(' ') },
        { type: 'sentence', content: sentences1.data.data, text: sentences1.data.data.join(' ') },
        { type: 'sentence', content: sentences2.data.data, text: sentences2.data.data.join(' ') },
      ];

      setChallenges(challengeList);
      setCurrentChallengeIndex(0);
      setResults([]);
      setIsCompleted(false);
    } catch (err) {
      console.error('加载挑战内容失败', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // 单个挑战完成
  const handleChallengeComplete = useCallback(async (result: {
    wpm: number;
    accuracy: number;
    duration: number;
    totalChars: number;
    correctChars: number;
    errorCount: number;
  }) => {
    const newResults = [...results, result];
    setResults(newResults);

    const currentChallenge = challenges[currentChallengeIndex];

    // 保存练习记录
    try {
      await practiceApi.saveRecord(user.id, {
        mode: currentChallenge.type === 'words' ? 'WORDS' : 'SENTENCE',
        difficulty: 'BEGINNER',
        wpm: result.wpm,
        accuracy: result.accuracy,
        durationSeconds: result.duration,
        totalChars: result.totalChars,
        correctChars: result.correctChars,
        errorCount: result.errorCount,
      });

      // 记录单词/句子练习次数
      if (currentChallenge.type === 'words') {
        await contentApi.recordWords(user.id, currentChallenge.content);
      } else {
        await contentApi.recordSentences(user.id, currentChallenge.content);
      }
    } catch (err) {
      console.error('保存记录失败', err);
    }

    // 检查是否全部完成
    if (currentChallengeIndex >= challenges.length - 1) {
      // 全部完成，更新打卡
      try {
        await checkInApi.checkIn(user.id);
      } catch (err) {
        // 可能已经打过卡了，忽略错误
      }

      // 刷新用户数据
      try {
        const userRes = await authApi.getProfile(user.id);
        if (userRes.data.code === 200) {
          onUserUpdate(userRes.data.data);
        }
      } catch (err) {
        console.error('刷新用户数据失败', err);
      }

      setIsCompleted(true);
      setShowResult(true);
    } else {
      // 进入下一个挑战
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    }
  }, [user.id, challenges, currentChallengeIndex, results, onUserUpdate]);

  // 重新开始挑战
  const handleRestart = () => {
    loadChallenges();
    setShowResult(false);
  };

  // 计算总结果
  const getTotalResult = () => {
    if (results.length === 0) return null;

    const totalCorrect = results.reduce((sum, r) => sum + r.correctChars, 0);
    const totalChars = results.reduce((sum, r) => sum + r.totalChars, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length);
    const avgAccuracy = Math.round(totalCorrect / totalChars * 100);

    return {
      wpm: avgWpm,
      accuracy: avgAccuracy,
      duration: totalDuration,
      totalChars,
      correctChars: totalCorrect,
      errorCount: totalErrors,
    };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        加载每日挑战...
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        加载失败，请重试
      </div>
    );
  }

  const currentChallenge = challenges[currentChallengeIndex];
  const totalResult = getTotalResult();

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>每日挑战</h1>

      {/* 进度指示器 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        alignItems: 'center',
      }}>
        {challenges.map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              backgroundColor: index < currentChallengeIndex
                ? 'var(--success)'
                : index === currentChallengeIndex
                ? 'var(--accent)'
                : 'var(--bg-card)',
            }}
          />
        ))}
        <span style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }}>
          {currentChallengeIndex + 1} / {challenges.length}
        </span>
      </div>

      {/* 当前挑战类型 */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        display: 'inline-block',
      }}>
        {currentChallenge.type === 'words' ? '📝 单词练习' : '📖 句子练习'}
      </div>

      {/* 打字区域 */}
      <TypingArea
        key={currentChallengeIndex}
        text={currentChallenge.text}
        onComplete={handleChallengeComplete}
      />

      {/* 结果弹窗 */}
      {showResult && totalResult && (
        <div className="result-overlay">
          <div className="result-card">
            <h2>
              {isCompleted ? '🎉 每日挑战完成！' : '挑战进行中'}
            </h2>

            {isCompleted && (
              <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                已自动打卡！用户数据已更新。
              </div>
            )}

            <div className="result-stats">
              <div className="result-stat">
                <div className="value">{totalResult.wpm}</div>
                <div className="label">平均 WPM</div>
              </div>
              <div className="result-stat">
                <div className="value">{totalResult.accuracy}%</div>
                <div className="label">总准确率</div>
              </div>
              <div className="result-stat">
                <div className="value">{totalResult.duration}s</div>
                <div className="label">总用时</div>
              </div>
              <div className="result-stat">
                <div className="value">{totalResult.errorCount}</div>
                <div className="label">总错误</div>
              </div>
            </div>

            {/* 每个挑战的详细结果 */}
            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>详细结果：</h3>
              {results.map((r, index) => (
                <div key={index} style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>
                    {challenges[index].type === 'words' ? '单词' : '句子'} #{index + 1}
                  </span>
                  <span>
                    {r.wpm} WPM · {r.accuracy}% 准确率
                  </span>
                </div>
              ))}
            </div>

            <div className="buttons">
              <button className="btn btn-primary" onClick={handleRestart}>
                再来一次挑战
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
