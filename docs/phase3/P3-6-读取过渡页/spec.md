# P3-6 读取过渡页 · 规格说明

> 状态：已完成 | 日期：2026-06-12 | 对应设计规范 v0.7

---

## 目标

把"等 AI 解读"从一个页面内部的转圈 loading 升级为有仪式感的独立过渡页。中央 CardBack 悬浮 + 呼吸光晕 + 三牌位轮流点亮，暗示"正在逐张解读"。AI 调用从解读页移到过渡页，返回结果后直接传给解读页。

本次只做视觉与一致性。异步等待 AI 的完整状态机（最短停留、超时、失败重试）**本期不实现**，仅预留注释占位。

---

## 用户提供的设计提示词

用户直接提供了完整设计规范文档「灵境 · 设计规范 v0.7」，包含：

1. **5 组新 CSS 动画** — cardglow / halo / txtbreathe / floaty / slotcycle
2. **中央 CardBack** — 复用 P3-3 牌背，上下浮动 + 呼吸光晕 + 牌身辉光
3. **三牌位依次点亮** — 过去→现在→未来轮流发光循环
4. **全页去 emoji** — 统一金色 lucide 图标 + 内联 SVG 星芒
5. **异步状态机不实现** — 仅最小接口 + TODO 占位

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `tailwind.config.js` | 修改 | 新增 cardglow / halo / txtbreathe / floaty / slotcycle keyframes 和 animations |
| `src/pages/ReadingLoadingPage.jsx` | **新建** | 读取过渡页完整视觉 + AI API 调用 |
| `src/App.jsx` | 修改 | 导入 + 注册 `/reading-loading` 路由 |
| `src/pages/DrawPage.jsx` | 修改 | 导航目标改为 `/reading-loading`，state key 改为 `picks` |
| `src/pages/ReadingPage.jsx` | 修改 | 支持 `preReading` / `preError` 预取结果 |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/components/CardBack.jsx` | 复用（P3-3 创建，`showStar` 星芒流光） |
| `src/components/StarField.jsx` | 复用 |
| `src/utils/promptBuilder.js` | 复用 |
| `src/utils/api.js` | 复用 |

---

## 一、CSS 动画

### keyframes

```css
cardglow:   boxShadow 26px/.28 ↔ 46px/.5（4s 循环）——牌身呼吸辉光
halo:       opacity .4↔.7 + scale 1↔1.12（4s 循环）——背景光晕呼吸
txtbreathe: opacity .6↔.92（3s 循环）——文案呼吸
floaty:     translateY 0↔-6px（5s 循环）——牌背上下浮动
slotcycle:  0%-11% 金色亮起，33%-100% 暗金色（3.6s 循环）——三牌位轮流点亮
```

### 三牌位接力

三个图标使用同一个 `animate-slotcycle`，动画延迟三等分：

| 图标 | 含义 | animationDelay |
|------|------|----------------|
| Moon | 过去 · 溯源 | 0s |
| Sparkles | 现在 · 当下 | 1.2s |
| Sun | 未来 · 趋势 | 2.4s |

周期 3.6s ÷ 3 = 1.2s 间隔，实现过去→现在→未来依次点亮循环。

亮起态：`opacity:1, color:#F3E3B0, drop-shadow(0 0 8px rgba(230,201,130,.7))`
暗态：`opacity:.3, color:#9A8A5E, drop-shadow(0 0 0 transparent)`

---

## 二、页面视觉布局

```
┌──────────────────────────────────────┐
│ ← 重新抽牌                           │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │         你问的是                  │ │
│ │       TA对我是什么感觉            │ │
│ └──────────────────────────────────┘ │
│                                      │
│                                      │
│           ┌─────────────┐            │
│           │ ○ 呼吸光晕   │  animate-halo
│           │  ┌───────┐  │  (200px 径向渐变)
│           │  │ CardBack │  │  animate-floaty（浮动）
│           │  │ showStar │  │  animate-cardglow（辉光）
│           │  └───────┘  │
│           └─────────────┘
│                                      │
│         ★ 灵境读取中，               │
│           牌意正在浮现…   animate-txtbreathe
│                                      │
│       🌙      ✨      🌞             │
│      过去    现在    未来   animate-slotcycle
│     0s延迟  1.2s    2.4s            │
│                                      │
└──────────────────────────────────────┘
```

### 背景

```css
background: radial-gradient(
  120% 80% at 50% 40%,
  #211748 0%,
  #150E30 52%,
  #0C0820 100%
);
```

比解读页略深一档——读取是"沉入"的过渡。StarField 密度 4200，金色占比 32%。

---

## 三、流程重构

### 之前

```
DrawPage → navigate('/reading', { question, cards })
              → ReadingPage 自己调 AI（LoadingSpinner 转圈）
```

### 之后

```
DrawPage → navigate('/reading-loading', { question, picks })
              → ReadingLoadingPage 调 AI（视觉动画）
                 → navigate('/reading', { replace:true, question, cards, preReading })
                    → ReadingPage 直接用预取结果（秒开）
```

### 关键细节

- **`replace: true`**：过渡页不进历史栈，用户点返回不会卡在过渡页
- **state key 变更**：`cards` → `picks`（过渡页需要原始数据调 `buildUserPrompt`）
- **ReadingPage 三分支**：
  1. 有 `preReading` → 直接解析展示
  2. 有 `preError` → 显示错误态
  3. 都没有 → 自己调 AI（兼容直接访问/刷新/历史记录）

---

## 四、异步状态机（本期不实现）

`ReadingLoadingPage` 中预留 TODO 注释：

```
// TODO(后续单独实现完整状态机):
//   - 请求时机：建议在"选完第三张牌"时就发起
//   - 最短停留：至少 ~1.5s，避免一闪而过
//   - 超时安抚：~8s 未回 → 切换更耐心的文案
//   - 失败/超时：~30s → 显示失败态 + 重试（只重发请求，不重新抽牌）
```

本期最小接口：调 API → 成功就跳 → 失败就传 preError。

---

## 验证标准

- [x] 中央牌背为统一 CardBack 样式，带轻微上下浮动 + 呼吸光晕 + 辉光
- [x] 文案「灵境读取中，牌意正在浮现…」，前置星形为 SVG 非 emoji，文字随呼吸轻微明暗
- [x] 底部三牌位图标为金色 Moon/Sparkles/Sun，过去→现在→未来依次轮流点亮循环
- [x] 全页无 emoji
- [x] 顶部「你问的是 + 问题」与「重新抽牌」正常显示
- [x] 异步逻辑仅保留最小钩子 + TODO 注释，未自行实现状态机
- [x] 开启"减少动态效果"时动画减弱（`reducedMotion="user"` 全局生效）
- [x] `npm run build` 零报错
