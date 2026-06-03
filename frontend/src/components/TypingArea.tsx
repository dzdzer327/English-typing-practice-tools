import { useState, useEffect, useCallback, useRef } from 'react';

interface TypingAreaProps {
  text: string;
  onComplete: (result: {
    wpm: number;
    accuracy: number;
    duration: number;
    totalChars: number;
    correctChars: number;
    errorCount: number;
  }) => void;
}

export default function TypingArea({ text, onComplete }: TypingAreaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charStates, setCharStates] = useState<Map<number, 'correct' | 'incorrect'>>(new Map());
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // 重置状态
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setCharStates(new Map());
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(0);
    containerRef.current?.focus();
  }, []);

  // 文本变化时重置
  useEffect(() => {
    reset();
  }, [text, reset]);

  // 自动聚焦
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // 光标自动滚动到可见区域
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [currentIndex]);

  // 处理键盘输入
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isFinished) return;

    // Tab 重新开始
    if (e.key === 'Tab') {
      e.preventDefault();
      reset();
      return;
    }

    // 忽略功能键
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
      return;
    }

    // 开始计时
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // 退格键 - 回退并清除错误标记
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        setCharStates(prev => {
          const next = new Map(prev);
          next.delete(newIndex);
          return next;
        });
      }
      return;
    }

    // 忽略非字符键
    if (e.key.length > 1) return;

    e.preventDefault();

    const expectedChar = text[currentIndex];
    const isCorrect = e.key === expectedChar;

    // 记录当前字符状态
    setCharStates(prev => {
      const next = new Map(prev);
      next.set(currentIndex, isCorrect ? 'correct' : 'incorrect');
      return next;
    });

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    // 完成
    if (newIndex === text.length) {
      setIsFinished(true);
      const duration = (Date.now() - startTime) / 1000;

      // 计算统计
      let correctCount = 0;
      let errorCount = 0;
      const totalChars = newIndex;

      // 遍历所有字符状态
      charStates.forEach((state) => {
        if (state === 'correct') correctCount++;
        else errorCount++;
      });

      // 加上当前这一个
      if (isCorrect) correctCount++;
      else errorCount++;

      const wpm = duration > 0 ? Math.round((correctCount / 5) / (duration / 60)) : 0;
      const accuracy = totalChars > 0 ? Math.round((correctCount / totalChars) * 100) : 0;

      onComplete({
        wpm,
        accuracy,
        duration: Math.round(duration),
        totalChars,
        correctChars: correctCount,
        errorCount,
      });
    }
  }, [currentIndex, isStarted, isFinished, startTime, text, charStates, onComplete, reset]);

  // 渲染字符
  const renderChars = () => {
    return text.split('').map((char, index) => {
      let className = 'char';
      const state = charStates.get(index);

      if (index < currentIndex) {
        className += state === 'incorrect' ? ' incorrect' : ' correct';
      } else if (index === currentIndex) {
        className += ' current';
      } else {
        className += ' pending';
      }

      const isCursor = index === currentIndex;

      return (
        <span
          key={index}
          ref={isCursor ? cursorRef : undefined}
          className={className}
        >
          {char === ' ' ? ' ' : char}
        </span>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="typing-area"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {!isStarted && (
        <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          点击此处开始输入 · 按退格键删除 · 按 Tab 重新开始
        </div>
      )}
      {renderChars()}
    </div>
  );
}
