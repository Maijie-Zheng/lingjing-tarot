# P3-0 设计系统地基 · 规格说明

> 状态：已完成 | 日期：2026-06-10

---

## 目标

建立 Phase 3 全局设计系统地基。包含设计 tokens、全局样式、图标策略、动效策略、5 个复用组件、1 个新落地页。后续所有页面美化都基于这套地基展开。

---

## 用户提供的设计提示词

用户与 Claude 沟通后，产出了一份完整的设计文档，包含：

1. **设计 Tokens** — ink 深紫黑 / gold 金色系色板，Noto Serif SC + Noto Sans SC 字体，18px 卡片圆角
2. **6 个 keyframe 动画** — shine / spin / spinr / twinkle / glow / breath
3. **全局样式** — 深空径向渐变 `.bg-cosmos` + 渐变金文字 `.text-gold-gradient`
4. **图标策略** — 全站 lucide-react 描边图标，禁用 emoji
5. **动效策略** — Tailwind animate-* 做循环动画，Framer Motion 做进场/交互，MotionConfig 全局尊重 reduced-motion
6. **5 个复用组件** — StarField / GlassCard / GoldButton / SectionTitle / OrbitalEmblem
7. **落地页** — 深空背景 + 灵境之眼核心视觉 + 渐变金标题 + 错落进场

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `tailwind.config.js` | 重写 | 新增 ink/gold 色板 + 6 个 keyframe + 7 个 animation，保留旧 brand/mystic 兼容 |
| `index.html` | 修改 | 添加 Google Fonts preconnect + link 标签 |
| `src/index.css` | 重写 | 新 base 样式 + `.bg-cosmos` + `.text-gold-gradient`，保留旧 .btn-gold/.page-container 兼容 |
| `package.json` | 修改 | 新增 lucide-react 依赖 |
| `src/components/StarField.jsx` | 新建 | Canvas 粒子星空，替代 StarBackground |
| `src/components/GlassCard.jsx` | 新建 | 磨砂玻璃卡片容器 |
| `src/components/GoldButton.jsx` | 新建 | 渐变金 CTA 按钮 |
| `src/components/SectionTitle.jsx` | 新建 | 金色图标 + 渐变金文字标题 |
| `src/components/OrbitalEmblem.jsx` | 新建 | 灵境之眼——双层轨道 + 星芒核心 |
| `src/pages/LandingPage.jsx` | 新建 | 新落地页，替代 HomePage |
| `src/App.jsx` | 修改 | MotionConfig + StarField + LandingPage |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/pages/AskPage.jsx` | 后续单独迭代 |
| `src/pages/ShufflePage.jsx` | 后续单独迭代 |
| `src/pages/ReadingPage.jsx` | 后续单独迭代 |
| `src/pages/HistoryPage.jsx` | 后续单独迭代 |
| `src/components/StarBackground.jsx` | 保留不删（向后兼容），新代码用 StarField |
| `src/components/StarEye.jsx` | 保留不删，OrbitalEmblem 是其升级版 |
| `src/components/TarotCard.jsx` | 不改 |
| `src/components/LoadingSpinner.jsx` | 不改 |
| `src/components/ReadingText.jsx` | 不改 |

---

## 一、设计 Tokens

### 1.1 色板

```
ink:
  900: #0E0A1F  ← body 背景色
  800: #14102A
  700: #16102F
  nebula: #251A4D  ← 星云紫

gold:
  50:  #FFF8E6
  100: #F6E8BC
  200: #F3E3B0
  DEFAULT: #E6C982  ← 主金色
  600: #C9A24E       ← 深金色

brand（向后兼容）:
  gold: #c9a96e
  purple: #8b5cf6

mystic（向后兼容）:
  dark: #1a0a2e
  deeper: #0d0221
```

### 1.2 字体

| 用途 | Font Family |
|------|------------|
| 标题 | Noto Serif SC（衬线体） |
| 正文 | Noto Sans SC, system-ui, sans-serif |

### 1.3 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `rounded-card` | 18px | 卡片、玻璃容器 |
| `rounded-btn` | 16px | 按钮 |

### 1.4 动画

| 动画名 | 时长 | 用途 |
|--------|------|------|
| `animate-shine` | 7s 循环 | 渐变金文字流光 |
| `animate-spin-slow` | 42s 循环 | 外层轨道顺时针 |
| `animate-spin-rev` | 56s 循环 | 内层轨道逆时针 |
| `animate-spin-core` | 55s 循环 | 星芒核心自转 |
| `animate-twinkle` | 4.5s 循环 | 星芒明暗呼吸 |
| `animate-glow` | 5s 循环 | 光晕缩放呼吸 |
| `animate-breath` | 4s 循环 | 按钮光晕呼吸 |

---

## 二、图标策略

- 安装 `lucide-react`
- 全站图标统一使用其描边图标，`strokeWidth={1.6}`
- 颜色统一用 `text-gold`（新）或 `text-brand-gold`（旧）
- 常用映射：开启灵境→`Sparkles`，历史记录→`BookOpen`，整体叙事→`Sparkles`，行动建议→`Route`，过去/现在/未来→`Moon`/`Sparkles`/`Sun`
- **全站禁用 emoji 当图标**

---

## 三、动效策略

| 类型 | 实现方式 | 用途 |
|------|---------|------|
| 环境型循环动画 | Tailwind `animate-*` | 旋转、呼吸、流光、星空 |
| 进场/路由切换/交互编排 | Framer Motion | 落地页进场、页面过渡 |
| reduced-motion 适配 | `<MotionConfig reducedMotion="user">` | 全局自动尊重系统设置 |

---

## 四、复用组件规格

### 4.1 StarField（粒子星空背景）

- Canvas 实现，密度由 `density` 控制（默认 3200，越大越稀疏）
- 粒子约 1/3 为金色调（`goldRatio=0.34`）
- 粒子缓慢上浮，出画后从底部重新生成
- DPR 适配（最高 2x）
- `prefers-reduced-motion` 下粒子静止
- 替代旧的 `StarBackground`

### 4.2 GlassCard（磨砂玻璃卡片）

- `rounded-card` + `border-gold/20` + `bg-white/[0.045]` + `backdrop-blur-sm`
- 金色微光内阴影

### 4.3 GoldButton（金色 CTA 按钮）

- 渐变金背景 `from-gold-200 via-gold to-gold-600`
- 文字深褐色 `#3a2c0a`
- `animate-breath` 呼吸光晕
- 前置 lucide 图标
- `focus-visible` 键盘焦点态

### 4.4 SectionTitle（区块标题）

- 金色图标 + 渐变金衬线体文字
- 文字带 `animate-shine` 流光

### 4.5 OrbitalEmblem（灵境之眼）

- 双层反向旋转金色轨道（SVG circle + 节点）
- 中心星芒核心（SVG path 四芒星 + 渐变填充）
- 外层呼吸光晕（radial-gradient + animate-glow）
- 三层分离：外层居中 → 内层自转 → SVG 明暗呼吸

---

## 五、落地页（LandingPage）

### 5.1 布局

```
┌────────────────────────────┐
│                    📖 历史  │  ← BookOpen 图标，右上角
│                            │
│         ⭕ 灵境之眼         │  ← OrbitalEmblem（208px）
│                            │
│          灵 境             │  ← 渐变金宋体 32px，14px 字距
│   解锁灵境，让心事皆有回响  │  ← 白色/50，13.5px
│                            │
│      [ ✨ 开启灵境 ]       │  ← GoldButton + Sparkles
│                            │
└────────────────────────────┘
```

### 5.2 背景

- `bg-cosmos` 径向渐变（星云紫→深紫→黑）
- 全局 StarField 粒子叠加

### 5.3 进场动画

- 核心 → 标题 → 副标题 → 按钮，依次 fade-up
- Framer Motion `variants` + `custom` 索引
- 每层延迟 0.15s，duration 0.9s

### 5.4 路由

- `/ask` → 开启灵境（输入页）
- `/history` → 历史记录

---

## 验证标准

- [ ] `bg-cosmos` 径向深空渐变 + StarField 粒子
- [ ] OrbitalEmblem：星芒核心 + 双层轨道反向旋转 + 呼吸光晕
- [ ] 标题「灵境」宋体渐变金 + 14px 字距 + 流光
- [ ] 副标题白色 50% 透明度
- [ ] GoldButton 渐变金 + 呼吸光晕 + Sparkles 图标
- [ ] 右上角 BookOpen 图标 +「历史记录」
- [ ] 全页无 emoji
- [ ] 进场动画：核心→标题→副标题→按钮依次 fade-up
- [ ] MotionConfig `reducedMotion="user"` 全局尊重系统设置
- [ ] 旧页面（Ask/Shuffle/Reading/History）向后兼容不报错
- [ ] iPhone SE（375px）布局不溢出
- [ ] `npm run build` 零报错
