# P3-2 冥想引导页 · 开发记录

> 日期：2026-06-10 | 状态：已完成

---

## 实际改动

### 修改文件

| 文件 | 改动 |
|------|------|
| `tailwind.config.js` | 追加 4 个 keyframes（breathe/breathering/corepulse/textbreath）+ 4 个动画，统一 7s 周期 |
| `src/App.jsx` | 新增 `/meditate` 路由 + import MeditatePage |
| `src/pages/AskPage.jsx` | 提交跳转从 `/shuffle` 改为 `/meditate`（传 `?q=` 参数） |
| `src/pages/ShufflePage.jsx` | 删除旧冥想遮罩（meditate stage + 呼吸文字 + 跳过 + 倒计时），初始 stage 改为 `'shuffle'` |

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/pages/MeditatePage.jsx` | 冥想引导过渡页 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/StarField.jsx` | 复用，参数不同（density=6200, goldRatio=0.28） |

---

## 改动明细

### 一、tailwind.config.js 追加 4 组呼吸动画

```js
breathe:     translate(-50%,-50%) scale(.8→1.16) + opacity(.3→.66)
breathering: translate(-50%,-50%) scale(.82→1.18) + opacity(.22→.44)
corepulse:   opacity(.5→.95)
textbreath:  opacity(.42→.72)
```

全部 7s ease-in-out infinite，光晕/外环/核心/文案四者同周期同步起伏。

### 二、MeditatePage 路由适配

设计文档写的是路由 `/draw`、`location.state?.question`。项目实际：
- 抽牌页路由是 `/shuffle`
- 问题通过 URL 参数 `?q=` 传递（ShufflePage 用 `useSearchParams` 读取）

适配方案：
- AskPage → `/meditate?q=问题文本`
- MeditatePage 用 `useSearchParams` 读 `?q=`
- 5 秒后 / 跳过 → `/shuffle?q=问题文本`（`replace: true`）
- 换问题 → `navigate(-1)` 回 AskPage

### 三、背景与星空

径向渐变 `#1A1336 → #0D0A1E → #08060F`，比其他页更暗但最亮点不是纯黑。

StarField `density={6200}` `goldRatio={0.28}`——比全局（3200/0.34）粒子更稀疏、金色占比更低，视觉更"静"。

### 四、中央呼吸光

220×220px 容器，三层叠加：

| 层 | DOM | 动画 |
|----|-----|------|
| 光晕 | 180px 径向渐变圆，金→透明 | animate-breathe |
| 外环 | 128px 圆，`border-gold/[.28]` | animate-breathering |
| 星芒核心 | 22px 八角星 SVG，金色渐变 | animate-corepulse |

三个元素用 `left-1/2 top-1/2` + keyframe 内 `translate(-50%,-50%)` 居中，不加额外 Tailwind 平移类。

星芒核心 SVG 复用 LandingPage OrbitalEmblem 中的八角星路径和渐变（品牌一致）。

### 五、氛围文案

「闭上眼睛，深呼吸 / 在心中默念你的问题…」
- 宋体 15px，字距 3px，行高 2.1
- `animate-textbreath` 7 秒周期明暗呼吸
- 无「吸气/呼气」逐字引导、无进度点

### 六、顶部「你在问」卡片

```jsx
<div className="... border-gold/[.12] bg-white/[0.02] opacity-[.55]">
  <div className="text-[11px] text-white/30">你在问</div>
  <div className="text-[13.5px] text-white/60">{question}</div>
</div>
```

极淡磨砂，不抢中央呼吸光。

### 七、5 秒自动跳转

```js
useEffect(() => {
  const t = setTimeout(goDraw, 5000);
  return () => clearTimeout(t);
}, []);
```

cleanup 中 clearTimeout 防止组件卸载后仍触发跳转。

### 八、ShufflePage 旧冥想逻辑清理

ShufflePage 内置了一套旧的静心引导遮罩（`meditate` stage），存在两个问题：

1. **功能冗余**：MeditatePage 已独立处理冥想引导，ShufflePage 内置的遮罩不再需要
2. **体验割裂**：半透明黑遮罩 + Framer Motion opacity 呼吸文字，无品牌呼吸光设计

删除内容：
- `MEDITATE_DURATION` 常量
- `skipMeditate` callback
- `meditate` → `shuffle` 的 useEffect 倒计时
- 整个 `<AnimatePresence>` 遮罩 JSX（opacity 呼吸文字 + 跳过按钮）
- `stage` 初始值从 `'meditate'` 改为 `'shuffle'`
- JSDoc 阶段流程注释更新

---

## 构建验证

```
npm run build → ✓ built in 3.40s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

在输入页和抽牌页之间插入一个冥想引导过渡页。页面极简——中央呼吸光晕 + 一行静态文案，5 秒后自动进入抽牌页。

### 为什么这么做

- **留白与过渡**：从「打字提问」到「等待揭示」需要心理切换。几秒钟的呼吸光让用户沉下来。
- **不让人盯着看**：设计明确废弃了早期「吸气/呼气逐字引导 + 呼吸进度点」方案——既让人闭眼又让人看字，逻辑矛盾。最终方案只有光和一行静态文字，用户瞄一眼即可闭眼。
- **背景更暗但不全黑**：全黑会被误认为加载失败/bug。最亮点 `#1A1336` 确保用户知道页面在工作。
- **replace: true**：冥想页不进历史栈，从抽牌页按返回直接回输入页，不会卡在冥想页。
- **呼吸周期 7 秒**：比一般呼吸动画（3-4秒）慢一倍，配合「闭上眼睛深呼吸」的暗示。

### 学到什么

- `replace: true` 在 `navigate()` 中的作用是替换当前历史条目而非追加——适合过渡页这种"用完即弃"的场景。
- 三个独立 DOM 元素用同一个 keyframe 模式（translate(-50%,-50%) + scale）各自独立动画，比用一个容器包裹后整体动画更灵活——光晕、外环、核心可以有各自的 scale 范围和 opacity 范围。
- StarField 的 `density` 参数越高粒子越稀疏（因为密度 = 每个粒子占用的像素面积），6200 比默认 3200 稀疏约一倍。
