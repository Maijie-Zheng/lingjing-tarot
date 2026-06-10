# P3-3 洗牌过渡页 · 开发记录

> 日期：2026-06-10 | 状态：已完成

---

## 实际改动

### 修改文件

| 文件 | 改动 |
|------|------|
| `tailwind.config.js` | 追加 8 个 keyframes（shuf0-3/settle/shimmer/textfade）+ 8 个动画定义 |
| `src/pages/ShufflePage.jsx` | 完全重写：4 张牌交叠洗牌 + 收束震动 + 两段式文案，去掉进度条和按钮 |
| `src/App.jsx` | 新增 `/draw` 路由 + import DrawPage |

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/CardBack.jsx` | 可复用牌背组件：深蓝渐变 + 金色星盘 SVG + 可选流光星纹 |
| `src/pages/DrawPage.jsx` | 选牌页：搬迁旧 ShufflePage 的 select 阶段（CardCarousel + 卡槽 + 白屏过渡） |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/pages/MeditatePage.jsx` | 仍跳转 `/shuffle?q=`，不感知下游变化 |
| `src/components/CardCarousel.jsx` | 复用，DrawPage 引用 |
| `src/components/StarField.jsx` | 复用 |
| `src/pages/AskPage.jsx` | 无变更 |

---

## 改动明细

### 一、tailwind.config.js 追加 8 组洗牌动画

```js
// keyframes
shuf0:  rotate 0→-9°→5°→-3°→0 + translateX 0→-30→22→-10→0
shuf1:  rotate 0→8°→-6°→4°→0 + translateX 0→28→-24→12→0
shuf2:  rotate 0→-5°→7°→-2°→0 + translate(14,-22)→(-18,18)→(6,0)→0
shuf3:  rotate 0→11°→-8°→3°→0 + translate(-18,14)→(20,-12)→0→0
settle: scale 1→(80%)1.06→(88%).97→1
shimmer: opacity .4→1→.4 (2s)
textfade: opacity .55→.9→.55 (2s)

// 动画全部 infinite 定义，使用时用 [animation-iteration-count:1] 覆盖
```

### 二、CardBack 可复用牌背组件

- 深蓝渐变 `linear-gradient(150deg, #243056, #1a2444)`
- 金色细线星盘：双圆 + 交叉线 + 四角星点
- `showStar` prop 控制中央八角星是否流光（`animate-shimmer`）
- 尺寸由父组件 `className` 控制，默认无固定尺寸
- 纯 SVG 绘制，无外部图片依赖

### 三、ShufflePage 完全重写

#### 设计对照

| 维度 | 旧版 | 新版 |
|------|------|------|
| 牌数 | 5 张 | 4 张 |
| 动画 | Framer Motion wobble + 进度条 | Tailwind keyframes 交叠错位旋转 |
| 进度条 | 金色渐变 loading bar | 无——动作和文案本身就是进度 |
| 文案 | 「✨ 灵境正在为你洗牌...」 | 星形 SVG + 两段式切换 |
| 按钮 | 「← 换问题」Link | 无任何按钮 |
| 时长 | 1.5s 洗牌 + 手动选牌 | 2.5s 自动跳转 |
| 牌背 | TarotCard size="sm" | CardBack 组件（品牌一致） |

#### 关键实现细节

**transform 冲突解决**：外层 settle 动画操作 `scale()`，内层洗牌动画操作 `rotate() translate()`。如果内外层都在同一元素上会冲突。方案：
- 外层容器 `animate-settle` 负责整体收束缩放
- 内层 wrapper（`ml-[-39px] mt-[-58px]`）用负 margin 居中，不占用 transform
- 最内层 `animate-shuf*` 做洗牌位移旋转

**单轮播放**：Tailwind 动画默认 infinite，通过任意属性 `[animation-iteration-count:1]` 覆盖为只播一轮。

**两段式文案**：
- `SETTLE_AT = 2050ms`（对应 settle 72% 处，收束开始前）
- 0–2050ms：`settled = false` →「灵境正在为你洗牌…」
- 2050–2500ms：`settled = true` →「牌阵已成」
- 文案前星形为内联 SVG 八角星，非 emoji

### 四、DrawPage 新建（搬迁旧选牌逻辑）

从旧 ShufflePage 搬迁 select 阶段，去掉了 shuffle stage 和冥想阶段：

- 直接进入选牌模式（无 stage 状态机）
- 保留 CardCarousel + 3 卡槽 + 星点汇聚 + 白屏过渡
- 保留「换问题」Link 回 `/ask`
- 保留「你在问」磨砂玻璃卡片
- 读取 `?q=` 参数
- 选满 3 张 → 星光汇聚 → 白屏过渡 → navigate('/reading', { state })

注意：DrawPage 暂未做 Phase 3 视觉升级（emoji 标签、进度文案等保留旧版样式），等后续设计文档。

### 五、路由全链路

```
AskPage ─→ /meditate?q=... ─→ MeditatePage (5s, replace)
  ─→ /shuffle?q=... ─→ ShufflePage (2.5s, replace)
  ─→ /draw?q=... ─→ DrawPage (选牌)
  ─→ /reading (state: {question, cards})
```

过渡页全部 `replace: true`，从选牌页返回直接回输入页。

---

## 构建验证

```
npm run build → ✓ built in 1.93s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

把洗牌页从「5 张牌 Framer Motion wobble + 金色进度条」升级为「4 张牌 Tailwind keyframes 交叠错位旋转 + 收束震动 + 两段式文案」。同时抽出可复用的 CardBack 牌背组件，并把旧选牌逻辑搬迁到新 DrawPage。

### 为什么这么做

- **让「洗」真的发生**：旧版 5 张牌只在水平方向交替 wobble，配一根金色 loading 条——像系统 loading，不像洗牌。新版 4 张牌有各自的位移轨迹（左右、斜向、旋转），视觉上牌在真的交错洗动。
- **去掉进度条**：动作和文案本身就是进度。洗完 + 收束一震 = 牌已就绪，不需要进度条告诉用户「快好了」。
- **牌背抽出组件**：CardBack 在洗牌页和后续抽牌页都要用，提前抽成组件避免重复。
- **搬迁选牌逻辑到 DrawPage**：旧 ShufflePage 是「洗牌+选牌」双阶段页面，新版 ShufflePage 只做洗牌动画过渡，选牌功能必须有个新家。新建 DrawPage 保持功能完整。
- **单轮动画**：Tailwind 动画默认 infinite，通过 `[animation-iteration-count:1]` 任意属性覆盖。停在最后一帧（`85%,100%` 是静止态），不会跳回初始位置。
- **负 margin 居中回避 transform 冲突**：settle 和 shuf 动画都操作 transform，如果重叠在一个元素上会互相覆盖。外层 settle、内层 wrapper 用负 margin 居中（不碰 transform）、最内层 shuf 动画——三层分离。

### 学到什么

- Tailwind 任意属性 `[animation-iteration-count:1]` 可以覆盖 config 里定义的 `infinite`，适合「播一轮就停」的一次性动画。
- 多个 transform 动画不能直接叠加在同一个 DOM 元素上——后应用的会覆盖先应用的。分层处理（外层 scale、内层 rotate+translate）或用 CSS `translate()` 的复合写法可以避开。
- `replace: true` 在过渡页链中很关键——冥想→洗牌→选牌，前两屏 replace 后用户从选牌页返回直接到输入页，不会倒退穿过过渡页。
- 牌背星盘 SVG 的 viewBox `0 0 78 116` 对应 78×116 的塔罗牌标准比例（约 2:3），外部 className 设 `h-[116px] w-[78px]` 与 viewBox 一致保证不变形。
