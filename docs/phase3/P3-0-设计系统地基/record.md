# P3-0 设计系统地基 · 开发记录

> 日期：2026-06-10 | 状态：已完成

---

## 实际改动

### 修改文件

| 文件 | 改动 |
|------|------|
| `tailwind.config.js` | 重写：新增 ink/gold 色板 + 6 个 keyframe + 7 个 animation，保留旧 brand/mystic 兼容 |
| `index.html` | 修改：添加 Google Fonts preconnect + link（Noto Serif SC + Noto Sans SC） |
| `src/index.css` | 重写：body 改用 bg-ink-900 + font-sans；新增 `.text-gold-gradient` / `.bg-cosmos`；保留 `.btn-gold` / `.page-container` / `.mystic-card` 向后兼容 |
| `src/App.jsx` | 修改：`<MotionConfig reducedMotion="user">` 包裹全局；StarField 替换 StarBackground；LandingPage 替换 HomePage |
| `package.json` | 新增 lucide-react 依赖 |

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/StarField.jsx` | Canvas 粒子星空——density 3200 / goldRatio 0.34 / DPR 感知 / prefers-reduced-motion 适配 |
| `src/components/GlassCard.jsx` | 磨砂玻璃卡片容器——rounded-card + border-gold/20 + bg-white/[0.045] + backdrop-blur-sm |
| `src/components/GoldButton.jsx` | 渐变金 CTA 按钮——from-gold-200 via-gold to-gold-600 + animate-breath + lucide 图标 |
| `src/components/SectionTitle.jsx` | 区块标题——lucide 金色图标 + text-gold-gradient + animate-shine |
| `src/components/OrbitalEmblem.jsx` | 灵境之眼——双层 SVG 轨道反向旋转 + 星芒核心自转 + radial-gradient 呼吸光晕 |
| `src/pages/LandingPage.jsx` | 新落地页——bg-cosmos + OrbitalEmblem + 渐变金标题 + 错落 fade-up 进场 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/StarBackground.jsx` | 保留不删，旧代码可能引用 |
| `src/components/StarEye.jsx` | 保留不删，OrbitalEmblem 是其升级版 |
| `src/pages/AskPage.jsx` | 后续单独迭代 |
| `src/pages/ShufflePage.jsx` | 后续单独迭代 |
| `src/pages/ReadingPage.jsx` | 后续单独迭代 |
| `src/pages/HistoryPage.jsx` | 后续单独迭代 |
| `src/components/TarotCard.jsx` | 无需改动 |
| `src/components/LoadingSpinner.jsx` | 无需改动 |
| `src/components/ReadingText.jsx` | 无需改动 |

---

## 改动明细

### 一、设计 Tokens 落地

#### 1.1 tailwind.config.js

合并新旧两套色板：
- **新色板**：`ink`（4 阶深紫黑）、`gold`（5 阶金色）——供新组件使用
- **旧色板**：`brand`（gold/purple）、`mystic`（dark/deeper）——保留，确保旧页面不报错
- **圆角**：`card: '18px'`（从 12px 升级）、新增 `btn: '16px'`
- **字体**：`sans` 从 `PingFang SC, Noto Sans SC` 改为 `Noto Sans SC, system-ui, sans-serif`

新增 6 个 keyframe + 7 个 animation：
- `shine` → 背景位移动画，驱动渐变金文字流光
- `spin` / `spinr` → 正反向旋转，驱动轨道环
- `twinkle` → opacity + drop-shadow，驱动星芒呼吸
- `glow` → opacity + scale，驱动光晕缩放
- `breath` → boxShadow 变化，驱动按钮光晕

#### 1.2 字体加载

从 CSS `@import` 改为 HTML `<link>` 加载（性能更好），同时保留 `@import` 兜底。字体规格：
- Noto Serif SC: weight 400/500/600（标题）
- Noto Sans SC: weight 300/400（正文）

#### 1.3 全局样式

```css
body { @apply bg-ink-900 font-sans text-white antialiased; }
```

新增工具类：
- `.text-gold-gradient` — 渐变金文字（background-clip: text），配合 `animate-shine` 实现流光
- `.bg-cosmos` — 深空径向渐变（星云紫→深紫→黑，125%×90% at 50% 34%）

---

### 二、5 个复用组件

#### 2.1 StarField

对比旧 StarBackground 的改进：

| 维度 | StarBackground（旧） | StarField（新） |
|------|---------------------|----------------|
| 粒子数 | 固定 40 个 | 密度自适应（w*h/density），375×812 屏约 95 个 |
| 金色比例 | 固定 80% | 可配（默认 34%） |
| DPR | 无适配 | 最高 2x |
| reduced-motion | 无适配 | 停止上浮，保持静态 |
| 粒子大小 | 0.5-2px | 0.3-1.6px（更细腻） |
| 闪烁算法 | 正弦波独立计算 | 正弦波 + phase 偏移 |

#### 2.2 GlassCard

极简组件——一个 div 包装，提供统一的磨砂玻璃视觉：
- 半透明背景 `bg-white/[0.045]`
- 金色微光边框 `border-gold/20`
- 内阴影 `inset 0 1px 18px rgba(230,201,130,0.06)`
- 18px 圆角 + backdrop-blur

#### 2.3 GoldButton

全站主要 CTA 按钮的统一实现：
- 三阶渐变金背景（200→DEFAULT→600）
- 深褐色文字 `#3a2c0a`（在金色背景上可读）
- 宽字距 `tracking-[0.18em]`
- 呼吸光晕 `animate-breath`
- 点击缩放反馈 `active:scale-[0.98]`
- 键盘焦点可见 `focus-visible:outline-gold-200`

#### 2.4 SectionTitle

供解读页等场景的模块标题行：
- lucide 图标 + 渐变金衬线体文字
- 图标带金色 drop-shadow
- 文字带 `animate-shine` 流光

#### 2.5 OrbitalEmblem

落地页核心视觉，三层结构：
1. **呼吸光晕**：`radial-gradient` 金色圆 → 透明，`animate-glow` 缩放呼吸
2. **双层轨道**：SVG circle + 节点（小圆点 + 菱形 rect），外层 72r 顺时针 42s，内层 49r 逆时针 56s
3. **星芒核心**：SVG path 四芒星 + 渐变填充 + 中心亮点 + 四角辅点，外层 div 居中 + 内层 div 自转 55s + SVG `animate-twinkle` 明暗呼吸

三层分离避免 CSS transform 互相覆盖。

---

### 三、落地页

#### 3.1 与原 HomePage 的对比

| 维度 | HomePage（旧） | LandingPage（新） |
|------|---------------|-------------------|
| 核心视觉 | StarEye 双层环（镂空） | OrbitalEmblem（光晕+轨道+星芒） |
| 标题 | `text-4xl text-brand-gold` 实心金 | `text-gold-gradient animate-shine` 渐变金流光 |
| 按钮 | `.btn-gold` + emoji ✨ | GoldButton + lucide Sparkles |
| 历史入口 | emoji 📜 + 文字 | lucide BookOpen + 文字 |
| 进场 | 核心 scale+fade → 品牌 fade → CTA fade | 统一 fade-up 错落 0.15s（variants+custom） |
| 背景 | 依赖全局 StarBackground + body 渐变 | `bg-cosmos` 径向渐变 + 全局 StarField |

#### 3.2 路由行为

- 点击「开启灵境」→ `navigate('/ask')`
- 点击「历史记录」→ `navigate('/history')`
- 不使用 `<Link>`，用 `useNavigate` 编程式导航（与 GoldButton 的 button 语义一致）

---

### 四、App.jsx 改动

```diff
- import StarBackground from './components/StarBackground'
- import HomePage from './pages/HomePage'
+ import { MotionConfig } from 'framer-motion'
+ import StarField from './components/StarField'
+ import LandingPage from './pages/LandingPage'

+ <MotionConfig reducedMotion="user">
-   <StarBackground />
+   <StarField className="fixed inset-0" />
-   <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
+   <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
+ </MotionConfig>
```

---

## 构建验证

```
npm run build → ✓ built in 2.20s，零报错
```

---

## 回顾

### 做了什么

建立了 Phase 3 的全局设计地基：设计 tokens（ink/gold 色板、6 个 keyframe 动画、字体/圆角规范）、图标策略（lucide-react 替代 emoji）、动效策略（Tailwind 循环 + Framer Motion 编排 + reduced-motion 适配）、5 个复用组件（StarField/GlassCard/GoldButton/SectionTitle/OrbitalEmblem）、1 个新落地页（深空背景 + 灵境之眼 + 渐变金标题 + 错落进场）。

### 为什么这么做

- **地基先行**：如果每做一个页面都重新定义颜色/圆角/动画，各页面视觉会不一致。统一 tokens + 组件确保品牌统一。
- **旧代码兼容**：保留 brand/mystic 色值和 .btn-gold/.page-container 等旧类名，让 AskPage/ShufflePage/ReadingPage/HistoryPage 不下线就能逐步升级——后续逐个替换时不需要改地基。
- **图标去 emoji**：emoji 在不同 OS 上渲染不一致（iOS/Android/Win 的 ✨ 长得完全不同），lucide-react 的 SVG 图标保证跨平台一致。
- **StarField 替代 StarBackground**：密度从固定 40 个改为自适应（375×812 ≈ 95 个），约 1/3 金色调让星空有"灵境"的品牌感（不是通用白点星空），DPR 适配避免高分屏模糊，reduced-motion 适配是 a11y 底线。
- **OrbitalEmblem 替代 StarEye**：StarEye 是纯 CSS 环（border + transform），OrbitalEmblem 用 SVG 轨道 + 节点 + 星芒，视觉层次更丰富——光晕→外轨→内轨→星芒四层深度。

### 学到什么

- 设计 tokens 的落地不是简单的"复制粘贴到 config"——Tailwind 的 keyframe 和 animation 必须在 `theme.extend` 里声明，否则 `animate-*` 不生成对应的 class
- `bg-cosmos` 放 utility 层而非 component 层：因为不同页面可能需要不同尺寸/位置的径向渐变，utility 比 component 更灵活
- 旧组件保留不删是正确的——如果删了 StarEye 和 StarBackground，旧页面（尤其是还在用 StarEye 的 HomePage 原代码）会直接报错，后续逐页替换时再清理
- 向后兼容的代价很小（多了几行 config），但收益很大——每次 build 通过就说明新旧代码能共存
