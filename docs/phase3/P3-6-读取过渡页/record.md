# P3-6 读取过渡页 · 开发记录

> 日期：2026-06-12 | 状态：已完成 | 对应设计规范 v0.7

---

## 实际改动

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/pages/ReadingLoadingPage.jsx` | 读取过渡页——CardBack 浮动 + 呼吸光晕 + 三牌位轮流点亮 + 后台调 AI |

### 修改文件

| 文件 | 改动 |
|------|------|
| `tailwind.config.js` | 新增 5 组 keyframes + animations：`cardglow` / `halo` / `txtbreathe` / `floaty` / `slotcycle` |
| `src/App.jsx` | 导入 `ReadingLoadingPage` + 注册 `/reading-loading` 路由 |
| `src/pages/DrawPage.jsx` | 选满 3 张后导航目标从 `/reading` 改为 `/reading-loading`，state key 从 `cards` 改为 `picks` |
| `src/pages/ReadingPage.jsx` | 从 `location.state` 解构 `preReading` / `preError`——有预取结果则跳过 AI 调用直接展示 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/CardBack.jsx` | 复用（P3-3 创建，`showStar` 星芒流光） |
| `src/components/StarField.jsx` | 复用 |
| `src/utils/promptBuilder.js` | 复用 |
| `src/utils/api.js` | 复用 |

---

## 设计意图

### 之前 vs 之后

```
之前：抽牌页 → 白屏闪现 → 解读页（转圈等 AI）→ 展示结果

之后：抽牌页 → 过渡页（牌背悬停 + 动画 + 后台调 AI）→ 解读页（结果就绪，秒开）
```

核心变化：**AI 调用的位置从解读页移到了过渡页**。解读页之前一边调 AI 一边显示一个 `<LoadingSpinner>` 转圈——纯粹的功能性等待。过渡页把这段时间变成了有仪式感的视觉体验。

---

## 改动明细

### 一、tailwind.config.js —— 5 组新动画

| keyframes | 用途 | 周期 | 效果 |
|-----------|------|------|------|
| `cardglow` | 牌身呼吸辉光 | 4s | `boxShadow` 从 26px/.28 亮到 46px/.5 再回落 |
| `halo` | 背景光晕呼吸 | 4s | `opacity` .4↔.7 + `scale` 1↔1.12 |
| `txtbreathe` | 文案呼吸 | 3s | `opacity` .6↔.92 |
| `floaty` | 牌背上下浮动 | 5s | `translateY` 0↔-6px |
| `slotcycle` | 三牌位轮流点亮 | 3.6s | 前 11% 时间金色亮起（`#F3E3B0` + dropShadow），剩下时间暗金色（`#9A8A5E`） |

**三牌位接力原理**：三个图标都用 `animate-slotcycle`，动画延迟分别为 `0s / 1.2s / 2.4s`（周期 3.6s 三等分），实现过去→现在→未来依次点亮的循环。

### 二、ReadingLoadingPage —— 视觉布局

```
┌─ 重新抽牌（<ArrowLeft> 按钮）
├─ 你问的是：{问题}（磨砂玻璃卡）
├─
├─  ┌─────────────┐
├─  │ 浮动光晕     │  ← animate-halo（200px 径向渐变圆）
├─  │  ┌───────┐  │
├─  │  │ CardBack │  │  ← animate-floaty（-6px）+ animate-cardglow（辉光呼吸）
├─  │  │ showStar │  │  ← 中央星芒流光
├─  │  └───────┘  │
├─  └─────────────┘
├─
├─  ★ 灵境读取中，牌意正在浮现…  ← 内联 SVG 星芒 + animate-txtbreathe
├─
├─  🌙    ✨    🌞               ← animate-slotcycle + delay 错开接力
├─  过去   现在   未来
└─
```

背景比解读页略深一档（`#211748 → #150E30 → #0C0820`），表达"沉入"的过渡感。

### 三、流程重构

#### DrawPage 侧

```js
// 之前
navigate('/reading', { state: { question, cards: picks.map(...) } })

// 之后
navigate('/reading-loading', { state: { question, picks: picks.map(...) } })
```

state key 从 `cards` 改为 `picks`，因为过渡页需要原始牌数据来调 `buildUserPrompt`。

#### ReadingLoadingPage 侧（最小接口）

```js
useEffect(() => {
  // 调 AI
  const text = await callDeepSeek(systemPrompt, userPrompt)
  // 拿到结果 → 跳解读页，把结果带过去
  navigate('/reading', { replace: true, state: { question, cards: picks, preReading: text } })
}, [])
```

- `replace: true`：不进历史栈，用户点返回不会回到过渡页
- 失败时传 `preError` 而非 `preReading`，解读页显示错误态

#### ReadingPage 侧（兼容预取）

```js
const { question, cards, preReading, preError } = location.state || {}

useEffect(() => {
  if (preReading) {
    // 过渡页已经拿到结果 → 直接解析展示
    setReadingData(parseReadingResponse(preReading, cards))
    setStatus('ready')
    return
  }
  if (preError) {
    // 过渡页返回了错误
    setStatus('error')
    setErrorMessage(preError)
    return
  }
  // 降级：没有预取数据 → 自己调 AI（兼容直接访问 / 刷新 / 历史记录）
  fetchReading()
}, [])
```

### 四、异步状态机占位

过渡页 `useEffect` 上方留了 TODO 注释，标记后续要实现的完整状态机：

```
// TODO(后续单独实现完整状态机):
//   - 请求时机：建议在"选完第三张牌"时就发起
//   - 最短停留：至少 ~1.5s，避免一闪而过
//   - 超时安抚：~8s 未回 → 切换更耐心的文案
//   - 失败/超时：~30s → 显示失败态 + 重试（只重发请求，不重新抽牌）
```

本期仅实现"调 API → 拿到就跳"这一条路径，其余状态由用户后续设计。

---

## 构建验证

```
npm run build → ✓ built in 1.89s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

把解读页内部的 `<LoadingSpinner>` 转圈等待提取为一个独立页面——中央 CardBack 悬浮 + 呼吸光晕 + 三牌位轮流点亮。AI 调用从解读页移到过渡页，返回结果后直接传给解读页。

### 为什么这么做

- **仪式感**：旧版读完牌直接进结果页转圈——像点外卖等出餐。新版先进入一个有氛围的等候区，牌悬在你面前、光影呼吸、三个牌位依次亮起——像朋友在专注感应。
- **职责分离**：解读页之前既要调 AI、又要等结果、又要展示，三种状态搅在一起。现在调+等归过渡页，展示归解读页，各自只做一件事。
- **可扩展**：过渡页的 `useEffect` 是预留的接入点，后续可以无痛加入最短停留、超时安抚、失败重试，不用动解读页。

### 学到什么

- **动画接力**：`slotcycle` 三个图标用同一个 keyframes + 不同 `animationDelay` 实现接力。比写三组 keyframes 维护成本低，调整周期只需改 delay 分配。
- **replace: true**：过渡页是"用完即弃"的页面，`navigate(..., { replace: true })` 确保用户返回时不会卡在过渡页回不去。
- **降级兼容**：ReadingPage 的三分支（preReading / preError / 自己调）确保了任何路径进来的用户都能正常工作——过渡页来的、直接刷新的、点历史记录的。
- **预取结果透传**：`preReading` 传递原始文本而非解析后的对象，把解析逻辑留在 ReadingPage 一处维护，避免过渡页和解读页各写一套解析。
