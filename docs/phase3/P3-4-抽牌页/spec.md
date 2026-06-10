# P3-4 抽牌页 · 规格说明

> 设计文档：灵境 · 设计规范 v0.5（修订版）
> 日期：2026-06-10

---

## 范围

在现有抽牌页视觉风格不变的前提下做三处改动。

**不改**：布局、轮播景深、选中飞入牌位动画、白屏过渡、磨砂玻璃问题卡。

---

## 改动一：去 emoji → 金色细线图标

| 位置 | 旧 | 新 |
|------|-----|-----|
| 顶栏「换问题」 | `&larr;` 文本箭头 | `ArrowLeft` lucide `strokeWidth={1.6}` |
| 进度文案前缀 | emoji ✨ | 内联 SVG 8角星芒（复用 ShufflePage 样式） |
| 牌位标签图标 | emoji 🌙 ✨ 🌟 | lucide `Moon` / `Sparkles` / `Sun` |
| 空牌位占位 | emoji 字符 | 对应 lucide 图标 `text-white/12` |

牌位文案保持：「过去 · 溯源」「现在 · 当下」「未来 · 趋势」。

---

## 改动二：真随机洗牌 + 50% 正逆位 + 牌背绑定真身

### 核心原则

- 每张牌背已绑定确定的真身（乱序牌堆中的一张 + 独立 50% 正逆位）
- 用户点哪张抽哪张 → **选择有后果**
- 每次进入抽牌页重新洗牌 → 位置↔身份映射每局不同 → 无法背牌

### 数据流

```
buildDeck() → 22 张乱序 deck（每张含 reversed）
         ↓
remaining = [0..21]  ← 环中剩余牌的 deck 索引
         ↓
用户点中心牌 → pickCard(deckIndex)
         ↓
deck[deckIndex] 加入 picks → remaining 移除 deckIndex → 环长度 -1
         ↓
3 张集齐 → navigate('/reading', { state: { question, cards: picks + position } })
```

### 正逆位登记

- `reversed: true` → 解读页插画 `rotate-180`，文字标签不旋转
- 抽牌页是牌背阶段，不显示正逆位

---

## 改动三：全部 22 张环形无限循环

- 使用 `embla-carousel-react` `{ loop: true, align: 'center' }`
- 22 张首尾相接，任意方向无缝滚动
- 每张 slide 渲染 `CardBack` + 背面绑定 `deck[deckIndex]` 真身
- 抽走一张 → 从环移除 → embla `reInit()` → 环长度 -1
- 保留全部既有视觉：中心光晕、渐变遮罩、景深缩放、星芒闪烁、3D 翻转、呼吸引导

---

## 涉及文件

| 文件 | 改动 |
|------|------|
| `package.json` | 新增 `embla-carousel-react` 依赖 |
| `src/lib/drawDeck.js` | 新建：`buildDeck()` + `POSITIONS` |
| `src/components/CardCarousel.jsx` | 重写：embla loop + CardBack + deck binding |
| `src/pages/DrawPage.jsx` | 重写：buildDeck 绑定 + lucide 图标 + pickCard |

### 未修改

| 文件 | 原因 |
|------|------|
| `src/components/CardBack.jsx` | 复用 |
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/StarField.jsx` | 复用 |
| `src/data/tarotCards.js` | 复用（MAJOR_ARCANA 数据源） |
| `src/App.jsx` | 路由无变化 |

---

## 验收清单

- [x] 布局、轮播景深、飞入动画与改动前一致
- [x] 全页无 emoji
- [x] 点不同的牌抽到不同的牌（选择有后果）
- [x] 每次进入抽牌页牌堆重新随机
- [x] 每张牌正/逆位各约 50%、独立随机
- [x] 左右滑动为全部剩余牌的环形无限循环
- [x] 点中央确认 → 飞入对应牌位 → 从环移除 → 三张集齐自动进解读页
- [x] 传给解读页的数据为用户实际点中的三张牌及各自 `reversed` 状态
