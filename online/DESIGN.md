# 英语打字练习 — 设计文档

## 1. 项目概述

一款轻量级的英语打字练习桌面应用，帮助用户提升英文打字速度和准确率。

### 目标用户
- 希望提升英文打字速度的学习者
- 程序员、翻译、学生等需要大量英文输入的人群

### 核心价值
- 实时反馈打字速度（WPM）和准确率
- 循序渐进的练习内容
- 简洁无干扰的界面

---

## 2. 技术选型

| 层面 | 方案 | 理由 |
|------|------|------|
| 框架 | **Electron + React + TypeScript** | 跨平台桌面应用，生态成熟 |
| 构建 | Vite | 快速开发体验 |
| 样式 | Tailwind CSS | 高效 UI 开发 |
| 数据存储 | electron-store (JSON) | 轻量，存储用户设置和练习记录 |
| 打包 | electron-builder | 生成 Windows/macOS/Linux 安装包 |

---

## 3. 功能设计

### 3.1 练习模式

| 模式 | 说明 |
|------|------|
| **单词练习** | 随机常见英文单词，适合初学者 |
| **句子练习** | 完整英文句子，模拟真实输入场景 |
| **文章练习** | 段落级练习，训练持续打字能力 |
| **自定义练习** | 用户粘贴任意文本进行练习 |

### 3.2 核心机制

#### 打字流程
```
1. 展示待输入文本（灰色）
2. 用户按键输入
3. 正确 → 字符变绿，光标后移
4. 错误 → 字符变红，记录错误
5. 完成 → 展示统计结果
```

#### 实时统计
- **WPM (Words Per Minute)**: 每分钟输入单词数（1 word = 5 characters）
- **准确率**: 正确字符数 / 总输入字符数 × 100%
- **用时**: 当前练习耗时
- **错误数**: 打错次数

#### 难度等级
| 等级 | 内容 | 目标 WPM |
|------|------|----------|
| 初级 | 常见短单词 (a, the, is...) | 20-30 |
| 中级 | 日常句子 | 30-50 |
| 高级 | 复杂文章、代码片段 | 50-80 |
| 专家 | 无限制，挑战自我 | 80+ |

### 3.3 数据统计

#### 练习记录
- 每次练习保存：日期、模式、WPM、准确率、用时、错误数
- 最多保留 1000 条记录

#### 统计面板
- WPM 趋势图（近 7 天 / 30 天）
- 凳确率趋势图
- 总练习时长
- 最高 WPM 记录
- 各字母键错误率热力图

---

## 4. 界面设计

### 4.1 页面结构

```
┌─────────────────────────────────────────────┐
│  [首页]  [练习]  [统计]  [设置]              │  ← 导航栏
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   待输入文本展示区                   │   │
│   │   (灰/绿/红 三色标记)               │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  输入区域 (光标闪烁)                 │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│   │ WPM  │  │ 准确率│  │ 用时  │  │ 错误 │   │
│   │  45  │  │ 96%  │  │ 2:30 │  │  3   │   │
│   └──────┘  └──────┘  └──────┘  └──────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 配色方案

- **背景**: 深色模式为主 (#1a1a2e)，可切换浅色
- **正确字符**: 绿色 (#4ade80)
- **错误字符**: 红色 (#f87171)，带下划线
- **待输入字符**: 灰色 (#6b7280)
- **当前字符**: 白色 + 底部光标高亮
- **强调色**: 蓝色 (#3b82f6)

### 4.3 动画效果
- 字符输入：轻微缩放反馈
- 完成练习：庆祝动画（WPM 超过历史最高时）
- 页面切换：平滑过渡

---

## 5. 数据结构

### 练习记录
```typescript
interface PracticeRecord {
  id: string;
  date: string;           // ISO 8601
  mode: 'words' | 'sentence' | 'article' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  wpm: number;
  accuracy: number;       // 0-100
  duration: number;       // 秒
  totalChars: number;
  correctChars: number;
  errors: number;
  errorKeys: Record<string, number>;  // 各键错误次数
}
```

### 用户设置
```typescript
interface UserSettings {
  theme: 'dark' | 'light';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  practiceMode: 'words' | 'sentence' | 'article' | 'custom';
  soundEnabled: boolean;
  showKeyboard: boolean;    // 是否显示虚拟键盘
  fontSize: number;         // 字体大小 16-32
}
```

---

## 6. 项目结构

```
英语打字练习/
├── DESIGN.md                 # 本文档
├── package.json
├── electron/
│   ├── main.ts              # Electron 主进程
│   └── preload.ts           # 预加载脚本
├── src/
│   ├── main.tsx             # React 入口
│   ├── App.tsx              # 根组件 + 路由
│   ├── components/
│   │   ├── Layout.tsx       # 布局组件
│   │   ├── Navbar.tsx       # 导航栏
│   │   ├── TypingArea.tsx   # 打字区域（核心组件）
│   │   ├── StatsBar.tsx     # 实时统计条
│   │   ├── ResultModal.tsx  # 练习结果弹窗
│   │   ├── Keyboard.tsx     # 虚拟键盘（可选）
│   │   └── Charts.tsx       # 统计图表
│   ├── pages/
│   │   ├── Home.tsx         # 首页
│   │   ├── Practice.tsx     # 练习页
│   │   ├── Stats.tsx        # 统计页
│   │   └── Settings.tsx     # 设置页
│   ├── hooks/
│   │   ├── useTyping.ts     # 打字逻辑 hook
│   │   ├── useTimer.ts      # 计时器 hook
│   │   └── useStats.ts      # 统计数据 hook
│   ├── data/
│   │   ├── words.json       # 单词库
│   │   ├── sentences.json   # 句子库
│   │   └── articles.json    # 文章库
│   ├── store/
│   │   └── index.ts         # electron-store 封装
│   └── utils/
│       ├── wpm.ts           # WPM 计算
│       └── random.ts        # 随机抽取工具
├── public/
└── dist/                    # 构建输出
```

---

## 7. 开发计划

### Phase 1 — MVP（最小可用版本）
- [x] 项目初始化（Electron + React + Vite）
- [ ] 基础打字组件（TypingArea）
- [ ] 单词练习模式
- [ ] WPM 和准确率实时计算
- [ ] 练习完成结果展示

### Phase 2 — 完善体验
- [ ] 句子和文章练习模式
- [ ] 练习记录持久化
- [ ] 统计页面和趋势图
- [ ] 深色/浅色主题切换

### Phase 3 — 进阶功能
- [ ] 虚拟键盘显示
- [ ] 自定义文本练习
- [ ] 错误键位热力图
- [ ] 音效反馈
- [ ] 多语言 UI 支持

---

## 8. WPM 计算公式

```
WPM = (正确输入字符数 / 5) / 练习时间(分钟)

示例：
- 输入 250 个正确字符，用时 2 分钟
- WPM = (250 / 5) / 2 = 25 WPM
```

准确率：
```
准确率 = 正确字符数 / 总尝试字符数 × 100%
```

---

## 9. 练习文本示例

### 单词库（初级）
```json
["the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
 "it", "for", "not", "on", "with", "he", "as", "you", "do", "at"]
```

### 句子库（中级）
```json
[
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect when you keep trying.",
  "Every great journey begins with a single step."
]
```

---

## 10. 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Tab + Enter` | 重新开始当前练习 |
| `Esc` | 暂停/退出练习 |
| `Ctrl + 1/2/3/4` | 切换练习模式 |
| `Ctrl + D` | 切换深色/浅色主题 |
