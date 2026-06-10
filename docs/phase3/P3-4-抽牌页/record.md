# P3-4 抽牌页 · 开发记录

> 日期：2026-06-10 | 状态：已完成

---

## 实际改动

### 修改文件

| 文件 | 改动 |
|------|------|
| `package.json` | 新增 `embla-carousel-react` 依赖（v8） |
| `src/components/CardCarousel.jsx` | 重写：embla 环形无限循环 + CardBack 牌背 + deck 绑定机制 |
| `src/pages/DrawPage.jsx` | 重写：buildDeck 真随机绑定 + lucide 图标 + pickCard(deckIndex) |

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/lib/drawDeck.js` | Fisher–Yates 洗牌 + 50% 正逆位绑定 + POSITIONS 元数据 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/CardBack.jsx` | 复用（P3-3 创建） |
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/StarField.jsx` | 复用 |
| `src/data/tarotCards.js` | 复用（MAJOR_ARCANA 数据源） |
| `src/App.jsx` | 路由 `/draw` 无变化 |

---

## 改动明细

### 一、drawDeck.js —— 牌堆构建器

```js
// Fisher-Yates 洗牌 → 每张独立 Math.random() < 0.5 正逆位
export function buildDeck() {
  return shuffle(MAJOR_ARCANA).map((card) => ({
    ...card,
    reversed: Math.random() < 0.5,
  }));
}
```

- `shuffle` 不修改原数组（`[...arr]`）
- 返回 22 张乱序牌，每张含 `reversed` 布尔
- `POSITIONS` 三个牌位元数据（key/label/icon）

### 二、CardCarousel —— embla 环形无限循环

#### 设计对照

| 维度 | 旧版 | 新版 |
|------|------|------|
| 滚动机制 | 原生 overflow-x + scroll-snap | embla-carousel-react { loop: true } |
| 无限循环 | 不支持（首尾卡脖子） | 22 张首尾相接，任意方向无缝 |
| 牌背组件 | TarotCard 默认牌背 | CardBack（金色星盘，P3-3 品牌一致） |
| 数据源 | `cards`（卡面数据） | `remaining`（deck 索引数组） |
| 选择回调 | `onSelect(card)` 传卡对象 | `onSelect(deckIndex)` 传 deck 索引 |
| 动态移除 | 不支持 | `reInit()` 实时重建循环 |

#### 关键实现细节

**embla v8 API**：
```js
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', slidesToScroll: 1 });
```
- `emblaRef` 绑定到视口容器，`emblaApi` 提供 `scrollTo`/`reInit`/`on`/`off`/`selectedScrollSnap`
- `align: 'center'` 自动居中当前牌（替代旧版 `scrollSnapAlign: 'center'` + `paddingLeft` 手动计算）
- `loop: true` 在 slide 列表前后自动克隆，实现首尾相接

**环形距离计算**：
```js
let dist = Math.abs(slideIndex - centerIndex);
if (dist > n / 2) dist = n - dist; // 环形取短路径
```
- 22 张牌中，slide 0 和 slide 21 的距离是 1（不是 21）——保证景深缩放对称

**动态移除**：
```js
useEffect(() => {
  if (emblaApi) emblaApi.reInit();
}, [remaining, emblaApi]);
```
- `remaining` 数组变化（抽走一张）→ React 重渲染 → embla 重新测量 slide → 循环无缝接续
- embla v8 的 `reInit()` 默认保持当前滚动位置

**CardBack 替换 TarotCard 牌背**：
- 背面层：`<CardBack showStar={isCenter && !isFull && showGuide} />`（金色星盘 + 可选呼吸星芒）
- 正面层：`<TarotCard card={card} size="lg" />`（翻转后揭示真身）
- 保留 3D `rotateY` 翻转动画 + 星芒闪烁 + 呼吸引导

**保留的既有视觉**：
- 中心光晕（280px 紫色 radial-gradient 呼吸动画）
- 左右渐变遮罩（40px 黑色渐变）
- 景深缩放（center=1, dist1=0.78, dist2=0.58, dist3+=0.42）
- 星芒闪烁层（金色 radial-gradient + 三层 boxShadow）
- 呼吸引导（2.5s 后消失）

### 三、DrawPage —— 真随机绑定 + 无 emoji

#### 设计对照

| 维度 | 旧版 | 新版 |
|------|------|------|
| 牌堆 | `tarotCards` 原序 22 张 | `buildDeck()` Fisher-Yates 乱序 + 绑定正逆位 |
| 选牌 | `onSelect(card)` → 加 `isReversed` | `pickCard(deckIndex)` → `deck[deckIndex]` 已绑定 |
| 顶栏 | `&larr; 换问题` | `<ArrowLeft> 换问题`（lucide strokeWidth 1.6） |
| 进度文案 | emoji 🌙 ✨ 🌟 | 内联 SVG 8角星芒（复用 ShufflePage 星形） |
| 空槽占位 | emoji 字符 | lucide Moon/Sparkles/Sun（`text-white/12`） |
| 选满文案 | `🌟 三张已齐聚...` | `<StarSpark /> 三张已齐聚...` |

#### 关键实现细节

**选择有后果**：
```js
const pickCard = useCallback((deckIndex) => {
  const card = deck[deckIndex];
  setPicks(prev => [...prev, card]);
  setRemaining(prev => prev.filter(i => i !== deckIndex));
}, [picks.length, deck]);
```
- `deckIndex` 是用户点中的那张牌在 `deck` 里的真实索引
- 抽到的就是 `deck[deckIndex]` —— 绝不用 `deck[picks.length]`

**传给 ReadingPage 的数据**：
```js
navigate('/reading', {
  state: {
    question,
    cards: picks.map((card, i) => ({ ...card, position: POSITIONS[i] })),
  },
});
```
- 每张卡附 `position`（含 key/label/icon），与旧版格式兼容

**槽位图标映射**：
```js
const POS_ICONS = { Moon, Sparkles, Sun };
// 空槽：<IconComp size={28} strokeWidth={1.6} className="text-white/12" />
```

---

## 构建验证

```
npm run build → ✓ built in 1.72s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

把抽牌页从「原生 scroll-snap 有首尾死角的轮播 + emoji 图标 + 按点选次序发牌」升级为「embla 环形无限循环 + lucide 金色细线图标 + 牌背绑定真身点哪张抽哪张」。

### 为什么这么做

- **无限环形循环**：旧版 22 张牌滑到首/尾会停住，用户需要反向滑。embla `{ loop: true }` 让 22 张首尾相接，直觉上更像「在一大圈牌里凭直觉挑」。
- **牌背绑定真身**：旧版 `handleSelectCard` 在选牌时调用 `Math.random()` 随机正逆位——不管用户点哪张，卡片身份和上一次选牌动作无关。新版 `buildDeck()` 在进入页面时就为每张牌背绑定了确定身份，用户的选择直接影响结果。配合 Fisher-Yates 每局重洗，保证了「选择有后果 + 无法背牌」。
- **去 emoji**：与 P3-1/P3-2/P3-3 保持一致的设计语言——金色细线图标（lucide strokeWidth 1.6）+ 内联 SVG 星芒。
- **CardBack 复用**：牌背从 TarotCard 默认深蓝底 + 星盘换为 P3-3 创建的 CardBack 组件，品牌视觉统一。

### 学到什么

- **embla-carousel-react v8**：`useEmblaCarousel(options)` 返回 `[ref, api]`；`loop: true` 自动克隆首尾 slide 实现无缝循环；`align: 'center'` 无需手动计算 padding；`reInit()` 在数据变化后重建循环，保持滚动位置。
- **环形距离计算**：`dist > n/2 ? n - dist : dist` 把线性距离转为环形最短路径，保证景深效果在环的任意位置都对称。
- **牌背绑定策略**：`buildDeck()` 一次构建 → `remaining` 索引数组 → `pickCard(deckIndex)` 拿到绑定真身。这个三段式设计让「随机性」和「用户选择」各自独立：随机性在构建时确定，选择在交互时发生。
- **stale closure 注意**：`pickCard` 的 `useCallback` 依赖 `picks.length`，确保每次 `picks` 变化后回调能读到最新的 `picks.length`（用于 `convergeSlot` 索引）。如果漏掉这个依赖，连续快速选牌时 slotIdx 可能错位。
