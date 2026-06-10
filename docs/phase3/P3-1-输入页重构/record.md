# P3-1 输入页重构 + 预设问题系统 · 开发记录

> 日期：2026-06-10 | 状态：已完成

---

## 实际改动

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/pages/AskPage.jsx` | 重写：卡片式预设 + lucide 图标 + 选中态交互 + GoldButton + StarField 背景 |

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/data/questions.json` | 题库配置：30 条问题 + 4 个分类元数据 + 6 条时段规则 |
| `src/hooks/useQuestionBatch.js` | 出题 Hook：分层配额（2+1+1+1）+ 洗牌队列 + 机动位时段匹配 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/StarField.jsx` | 复用，`density={3600}` |
| `src/components/GoldButton.jsx` | 复用，加 `disabled` 态样式 |
| `src/App.jsx` | 路由不变，AskPage 仍挂 `/ask` |
| `src/pages/ShufflePage.jsx` | 路由不变，仍接收 `?q=` 参数 |

---

## 改动明细

### 一、题库 JSON 抽离

#### 1.1 结构

```json
{
  "categories": { /* love/career/self/daily，含 label + icon 名 */ },
  "questions": [ /* 30 条，含 id/cat/state/text/when(可选) */ ]
}
```

#### 1.2 四个分类

| 分类 | 图标 | 题目数 | 时段规则 |
|------|------|--------|---------|
| 感情 (love) | Heart | 10 条 | 无 |
| 事业 (career) | Briefcase | 8 条 | 无 |
| 自我 (self) | Sparkles | 6 条 | 无 |
| 日常 (daily) | Moon | 8 条 | 6 条有时段规则 |

#### 1.3 时段规则（daily 分类 8 条中 6 条）

| ID | 命中条件 |
|----|---------|
| flex-01 | 5:00–11:00（早晨） |
| flex-02 | 5:00–11:00（早晨） |
| flex-03 | 18:00–24:00（夜晚） |
| flex-04 | 0:00–5:00（深夜） |
| flex-05 | 周日（getDay()=0） |
| flex-06 | 周五（getDay()=5） |
| flex-07/08 | 无限制（通用兜底） |

---

### 二、出题 Hook（useQuestionBatch）

#### 2.1 配额

每批 5 条，固定配额：`[['love', 2], ['career', 1], ['self', 1], ['daily', 1]]`

#### 2.2 洗牌队列算法

1. 首次渲染：每个分类 `shuffle()` 生成初始队列
2. 每轮 draw：从各分类队列前端按配额取题（移除已取）
3. 队列耗尽 → 重新 shuffle 补充
4. 机动位（daily）：优先找 `matchesNow()` 为 true 的第一条，若无则找无 `when` 字段的通用题，兜底取第一条

#### 2.3 与旧实现的对比

| 维度 | 旧（pickExamples） | 新（useQuestionBatch） |
|------|-------------------|----------------------|
| 数据源 | 组件内 20 条硬编码 | questions.json 30 条 |
| 出题策略 | 全量随机打乱取前 5 | 分层配额 2+1+1+1 |
| 重复控制 | 无（同一题连续出现） | 洗牌队列保证池子耗尽前不重复 |
| 时段感知 | 无 | daily 机动位根据时段/星期匹配 |
| 分类均衡 | 不保证 | 保证每批感情 2 事业 1 自我 1 |

---

### 三、AskPage 视觉重构

#### 3.1 背景

从复用全局 StarField 改为页面独立背景：
- 径向渐变 `radial-gradient(125% 90% at 50% 0%, #251A4D 0%, #16102F 50%, #0E0A1F 100%)`
- StarField `density={3600}`（比全局 3200 略稀疏，减少视觉噪音）

#### 3.2 输入框

从磨砂玻璃 div 包裹改为直接 textarea：
- `rounded-card`（18px 圆角）
- `border-gold/[.22]` 默认 / `focus:border-gold/60` 聚焦
- `h-[108px]` 固定高度
- `shadow-[inset_0_1px_18px_rgba(230,201,130,0.05)]` 金色微光内阴影
- placeholder 白色 32% 透明度

#### 3.3 隐私提示

从 `✨ 你的心事，仅存于你的掌心` 改为 `Lock` 图标 + 文字，字号 11.5px 金色半透明。

#### 3.4 预设卡片

从 emoji 胶囊 chip 改为 lucide 图标卡片：

```
[ Heart 图标 | 感情 | ┆ | 问题文字 | ✓ ]
  ↑ 16px      ↑ 11.5px  ↑ 1px  ↑ 13.5px   ↑ 选中时出现
                             竖线
```

- **默认态**：`border-gold/[.16]` / `bg-white/[0.04]`，hover 时 `border-gold/40`
- **选中态**：`border-gold/[.65]` + `bg-gold/10` + `shadow-[0_0_16px_rgba(230,201,130,0.18)]` + Check 对勾

#### 3.5 选中交互

与设计文档精确对照：

| 操作 | 行为 | 实现 |
|------|------|------|
| 点击预设 | 填入 + 高亮 + 对勾 | `pickQuestion(q)` |
| 再点同一张 | 取消选中 + 清空 | `selectedId === q.id` 分支 |
| 手动编辑 | 保留选中 | `onChange` 不清 `selectedId` |
| 清空输入框 | 取消选中 | `v.trim() === ''` → `setSelectedId(null)` |
| 换批不丢失文字 | 选中消失、文字保留 | `batch` 变但 `text` 不受影响 |

#### 3.6 CTA 按钮

从 `.btn-gold` + 内嵌流光 div 改为 GoldButton 组件：
- 无内容时：`animate-none cursor-not-allowed opacity-40`
- 有内容时：恢复默认呼吸动画
- 图标：`Sparkles`

#### 3.7 进场动画

统一 fade-up 错落（variants + custom 索引）：
- 0: 返回按钮
- 1: 标题
- 2: 输入框
- 3: 「试试这些问题」行
- 4-8: 5 条预设卡片

#### 3.8 emoji 清除清单

| 旧元素 | 新元素 |
|--------|--------|
| 💫 / ⚡ / 🌙 / 🔮 分类图标 | Heart / Briefcase / Sparkles / Moon（lucide） |
| 🔄 换一批 | RefreshCw（lucide） |
| ✨ 隐私提示 | Lock（lucide） |
| ✨ 开启灵境 | Sparkles（lucide，GoldButton 内置） |

---

## 构建验证

```
npm run build → ✓ built in 2.43s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

把输入页从"emoji 胶囊 chip + 硬编码题库"升级为"卡片式预设 + JSON 题库 + 分层配额出题"。新建了 `questions.json`（30 条带时段规则）、`useQuestionBatch` hook（Fisher-Yates 洗牌 + 分层队列）、重写了 AskPage（lucide 图标 + 选中态交互闭环 + GoldButton 禁用态）。

### 为什么这么做

- **题库 JSON 化**：原 20 条硬编码在组件里，改文案要改组件代码。抽成 JSON 后运营/产品可以直接改题库，甚至未来可以接远程配置。
- **分层配额**：原实现全量随机取 5 条——极端情况可能 5 条全是同一分类（比如全是感情题），用户看了会觉得"这 App 只会问感情吗"。固定 2+1+1+1 保证每批都有多样性。
- **洗牌队列**：普通随机每次独立，同一题可能连续出现——用户连点两次"换一批"看到上一批的题会很出戏。队列模式池子耗尽前不出重复。
- **时段机动位**：深夜看到"今天适合做重要决定吗？"很违和。凌晨 2 点推"睡不着在想的那件事"比推通用题更懂用户。
- **选中态交互闭环**：旧实现点了 chip 就填入，没视觉反馈（不知道哪个被选中）、不能取消。新方案点击高亮+对勾，再点取消，编辑保留高亮，清空取消——交互闭环完整。
- **全页 emoji 清零**：分类图标、换批、隐私提示、CTA 全部换成 lucide-react 描边图标，跨平台一致。

### 学到什么

- JSON 导入在 Vite 中自动解析为对象，不需要 `fetch()` 或 `JSON.parse()`——`import data from './questions.json'` 就行。
- 洗牌队列的不可变更新要小心：`q[cat] = pool.filter((_, i2) => i2 !== idx)` 创建新数组引用，但 `q` 对象本身是浅拷贝 `{ ...queues }`，所以 React 能检测到变化。
- GoldButton 的 `disabled` prop 通过 className 拼 `animate-none opacity-40 cursor-not-allowed` 实现——原生 button 的 `:disabled` 伪类被 Tailwind 的 `animate-breath` 覆盖了，需要手动关掉动画。
- 输入页的路由保持 `/shuffle?q=` 不变——设计文档写的是 `/meditate`，但项目实际路由是 `/shuffle`，遵循了"路由地址按项目实际改"的指示。
