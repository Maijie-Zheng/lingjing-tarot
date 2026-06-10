# P3-2 冥想引导页 · 规格说明

> 状态：进行中 | 日期：2026-06-10

---

## 目标

在输入页提交后、抽牌页之前，插入一个几秒钟的「冥想引导过渡页」。作用是从「打字提问」切换到「等待揭示」的心境。仪式感来自缓慢呼吸的光和静态氛围文案，5 秒后自动进入抽牌页。

---

## 用户提供的设计提示词

v0.3 设计文档，核心约束：

1. **不要任何需要用户盯着看或学习的引导**——不做「吸气/呼气」逐字提示、不做呼吸进度点
2. 仪式感只来自「缓慢呼吸的光」+ 一行静态氛围文案
3. 背景比其他屏更暗、星点更稀更淡，但绝不全黑
4. 呼吸周期统一 7 秒，光晕/外环/核心/文案四者同步起伏

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `tailwind.config.js` | 追加 | 4 个新 keyframes（breathe/breathering/corepulse/textbreath）+ 4 个动画 |
| `src/pages/MeditatePage.jsx` | 新建 | 冥想引导过渡页 |
| `src/App.jsx` | 微改 | 添加 `/meditate` 路由 |
| `src/pages/AskPage.jsx` | 微改 | 提交跳转从 `/shuffle` 改为 `/meditate` |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/components/StarField.jsx` | 复用，参数不同（density=6200, goldRatio=0.28） |
| `src/pages/ShufflePage.jsx` | 仍接收 `?q=` 参数，不感知冥想页 |

---

## 一、路由适配

设计文档写的是 `/draw`，项目实际路由是 `/shuffle`。适配：

- AskPage 提交 → `/meditate?q=问题文本`
- MeditatePage 5秒后 / 跳过 → `/shuffle?q=问题文本`（replace: true）
- MeditatePage 换问题 → `navigate(-1)` 回 AskPage
- `replace: true` 确保冥想页不进历史栈，从抽牌页返回直接回输入页

---

## 二、tailwind.config.js 追加

在 v0.1 的 keyframes/animation 基础上追加 4 组：

```js
keyframes: {
  breathe:     { '0%,100%': { transform: 'translate(-50%,-50%) scale(.8)',  opacity: '.3'  },
                 '50%':     { transform: 'translate(-50%,-50%) scale(1.16)', opacity: '.66' } },
  breathering: { '0%,100%': { transform: 'translate(-50%,-50%) scale(.82)', opacity: '.22' },
                 '50%':     { transform: 'translate(-50%,-50%) scale(1.18)', opacity: '.44' } },
  corepulse:   { '0%,100%': { opacity: '.5'  }, '50%': { opacity: '.95' } },
  textbreath:  { '0%,100%': { opacity: '.42' }, '50%': { opacity: '.72' } },
},
animation: {
  breathe:     'breathe 7s ease-in-out infinite',
  breathering: 'breathering 7s ease-in-out infinite',
  corepulse:   'corepulse 7s ease-in-out infinite',
  textbreath:  'textbreath 7s ease-in-out infinite',
},
```

---

## 三、MeditatePage 组件规格

### 3.1 背景

```css
background: radial-gradient(120% 90% at 50% 46%, #1A1336 0%, #0D0A1E 55%, #08060F 100%)
```

比其他页更暗，但最亮点 `#1A1336` 不是纯黑（避免被误认为加载失败）。

### 3.2 StarField

`density={6200}` `goldRatio={0.28}`——比全局（3200/0.34）更稀更淡。

### 3.3 顶部

- 「换问题」按钮：ArrowLeft 图标，`text-gold-200/40`，hover 到 `/70`，`navigate(-1)`
- 「你在问」卡片：极淡磨砂 `border-gold/[.12]` + `bg-white/[0.02]`，整体 `opacity: 0.55`

### 3.4 中央呼吸光

220×220px 容器，三个元素叠加：

| 元素 | 动画 | 说明 |
|------|------|------|
| 光晕 | animate-breathe | 180px 径向渐变圆，金→透明 |
| 外环 | animate-breathering | 128px 圆，金色细边框 |
| 星芒核心 | animate-corepulse | 22px 八角星 SVG，金色渐变填充 |

三个元素都用 `left-1/2 top-1/2` + keyframe 内 `translate(-50%,-50%)` 居中，**不额外加 Tailwind 平移类**。

### 3.5 氛围文案

```
闭上眼睛，深呼吸
在心中默念你的问题…
```

- 宋体 15px，字距 3px，行高 2.1
- `animate-textbreath`：7 秒周期明暗呼吸
- 第二行 13.5px 略小

### 3.6 底部跳过

`跳过 →` 按钮，白色 38% 透明度，hover 到 60%，点击立即进抽牌。

### 3.7 自动跳转

`useEffect` 中 `setTimeout(goDraw, 5000)`，cleanup 中 `clearTimeout`。

---

## 四、AskPage 改动

仅改一行：`navigate(`/shuffle?q=...`)` → `navigate(`/meditate?q=...`)`

---

## 五、App.jsx 改动

新增路由：`<Route path="/meditate" element={<PageWrapper><MeditatePage /></PageWrapper>} />`

加 import MeditatePage。

---

## 验证标准

- [ ] 背景明显比其他页更暗，但不是纯黑
- [ ] 中央呼吸光 7 秒周期，光晕/外环/核心同步起伏
- [ ] 无「吸气/呼气」文字、无进度点
- [ ] 氛围文案宋体，随光轻微明暗
- [ ] 顶部「你在问」卡片极淡不抢戏
- [ ] 5 秒后自动跳转抽牌页
- [ ] 「跳过 →」立即进抽牌；「换问题」回上一页
- [ ] 冥想页不进历史栈（replace）
- [ ] 全页无 emoji
- [ ] iPhone SE（375px）不溢出
- [ ] `npm run build` 零报错
