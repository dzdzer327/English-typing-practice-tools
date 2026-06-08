import { useState, useEffect, useCallback } from 'react';
import { authApi, contentApi, practiceApi } from '../api';
import TypingArea from '../components/TypingArea';
import type { User, WordItem } from '../types';

interface PracticeProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function Practice({ user, onUserUpdate }: PracticeProps) {
  const [mode, setMode] = useState<'WORDS' | 'SENTENCE' | 'ARTICLE'>('WORDS');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [text, setText] = useState('');
  const [currentContent, setCurrentContent] = useState<string[]>([]);
  const [wordHints, setWordHints] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    duration: number;
    totalChars: number;
    correctChars: number;
    errorCount: number;
  } | null>(null);

  // 加载练习内容
  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      const level = difficulty.toLowerCase();
      switch (mode) {
        case 'WORDS':
          res = await contentApi.getWordItems(user.id, level, 15);
          setWordHints(res.data.data);
          setCurrentContent(res.data.data.map(item => item.word));
          setText(res.data.data.map(item => item.word).join(' '));
          break;
        case 'SENTENCE':
          setWordHints([]);
          res = await contentApi.getSentences(user.id, level, 3);
          setCurrentContent(res.data.data);
          setText(res.data.data.join(' '));
          break;
        case 'ARTICLE':
          setWordHints([]);
          res = await contentApi.getArticles('technology', 1);
          setCurrentContent(res.data.data);
          setText(res.data.data[0]);
          break;
      }
    } catch (err) {
      console.error('加载内容失败', err);
      setWordHints([]);
      setText('The quick brown fox jumps over the lazy dog. Practice makes perfect.');
    } finally {
      setLoading(false);
    }
  }, [user.id, mode, difficulty]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // 练习完成
  const handleComplete = useCallback(async (result: {
    wpm: number;
    accuracy: number;
    duration: number;
    totalChars: number;
    correctChars: number;
    errorCount: number;
  }) => {
    setResult(result);

    // 保存练习记录
    try {
      await practiceApi.saveRecord(user.id, {
        mode,
        difficulty,
        wpm: result.wpm,
        accuracy: result.accuracy,
        durationSeconds: result.duration,
        totalChars: result.totalChars,
        correctChars: result.correctChars,
        errorCount: result.errorCount,
      });

      // 记录单词/句子练习次数
      if (mode === 'WORDS' && currentContent.length > 0) {
        await contentApi.recordWords(user.id, currentContent);
      } else if (mode === 'SENTENCE' && currentContent.length > 0) {
        await contentApi.recordSentences(user.id, currentContent);
      }

    } catch (err) {
      console.error('保存记录失败', err);
    }

    try {
      const userRes = await authApi.getProfile(user.id);
      if (userRes.data.code === 200) {
        onUserUpdate(userRes.data.data);
      }
    } catch (err) {
      console.error('刷新用户数据失败', err);
    }
  }, [user.id, mode, difficulty, currentContent, onUserUpdate]);

  // 重新开始
  const handleRestart = () => {
    setResult(null);
    loadContent();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>打字练习</h1>

      {/* 模式选择 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          className={`btn ${mode === 'WORDS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('WORDS')}
        >
          单词
        </button>
        <button
          className={`btn ${mode === 'SENTENCE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('SENTENCE')}
        >
          句子
        </button>
        <button
          className={`btn ${mode === 'ARTICLE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('ARTICLE')}
        >
          文章
        </button>
      </div>

      {/* 难度选择 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${difficulty === 'BEGINNER' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDifficulty('BEGINNER')}
        >
          初级
        </button>
        <button
          className={`btn ${difficulty === 'INTERMEDIATE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDifficulty('INTERMEDIATE')}
        >
          中级
        </button>
        <button
          className={`btn ${difficulty === 'ADVANCED' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDifficulty('ADVANCED')}
        >
          高级
        </button>
      </div>

      {/* 打字区域 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          加载中...
        </div>
      ) : (
        <TypingArea text={text} wordHints={wordHints} onComplete={handleComplete} />
      )}

      {/* 重新开始按钮 */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button className="btn btn-secondary" onClick={handleRestart}>
          换一批内容
        </button>
      </div>

      {/* 结果弹窗 */}
      {result && (
        <div className="result-overlay">
          <div className="result-card">
            <h2>练习完成！</h2>
            <div className="result-stats">
              <div className="result-stat">
                <div className="value">{result.wpm}</div>
                <div className="label">WPM</div>
              </div>
              <div className="result-stat">
                <div className="value">{result.accuracy}%</div>
                <div className="label">准确率</div>
              </div>
              <div className="result-stat">
                <div className="value">{result.duration}s</div>
                <div className="label">用时</div>
              </div>
              <div className="result-stat">
                <div className="value">{result.errorCount}</div>
                <div className="label">错误数</div>
              </div>
            </div>
            <div className="buttons">
              <button className="btn btn-primary" onClick={handleRestart}>
                再来一次
              </button>
              <button className="btn btn-secondary" onClick={() => setResult(null)}>
                返回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
