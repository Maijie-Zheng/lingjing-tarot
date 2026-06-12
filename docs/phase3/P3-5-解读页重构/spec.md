# P3-5 解读页重构 · 规格说明

> 状态：已完成 | 日期：2026-06-10 | 对应设计规范 v0.6

---

## 目标

解读页是核心体验的终点站。把 AI 返回的一大段文字升级为三个视觉层次分明的模块——整体叙事（含三牌关键词脉络）、单牌解读 ×3（保持原样）、行动建议（含来源牌标签）。同时 AI 输出从自由文本改为结构化 JSON，让前端能基于数据做更有层次的渲染。

---

## 用户提供的设计提示词

用户直接提供了完整设计规范文档「灵境 · 设计规范 v0.6」，包含：

1. **AI 数据契约变更** — `cards[].keyword`（每牌两字）+ `actions[].sourceCard`（建议来源牌）
2. **NarrativeThread 组件** — 金线上三个节点（过去/现在/未来），显示 keyword 而非牌名，中位更亮更大
3. **ActionItem 组件** — 金色编号徽章 + 标题 +「源自 · 某张牌」标签 + 正文
4. **Divider 组件** — 金色渐变装饰分隔线，中央菱形
5. **全页去 emoji** — 统一 lucide 金色细线图标
6. **单牌解读模块不动** — 用户明确表示满意

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/lib/constants.js` | 新建 | POSITION_LABEL 共享常量 |
| `src/components/NarrativeThread.jsx` | 新建 | 三牌关键词脉络 |
| `src/components/ActionItem.jsx` | 新建 | 行动建议单条 |
| `src/components/Divider.jsx` | 新建 | 金色渐变装饰分隔线 |
| `src/utils/parseResponse.js` | 新建 | AI 响应三层解析降级 |
| `src/utils/promptBuilder.js` | 修改 | System Prompt 改为 JSON 输出 |
| `src/components/ReadingText.jsx` | 大量重写 | 三个内容模块 + 双格式入口 |
| `src/pages/ReadingPage.jsx` | 修改 | 去 emoji + lucide 图标 + 已保存改金色 |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/CardBack.jsx` | 复用 |
| `src/pages/HistoryPage.jsx` | 兼容（ReadingText 双格式入口覆盖） |

---

## 一、AI 数据契约

### System Prompt 变更

| 之前 | 之后 |
|------|------|
| markdown 自由文本（`【整体叙事】...`） | 严格 JSON（必须可被 `JSON.parse()` 解析） |

### JSON Schema

```json
{
  "narrative": "整体叙事。50-70字。一句话讲三张牌如何串联回应用户的问题。",
  "cards": [
    {
      "position": "past",
      "name": "牌名",
      "reversed": true,
      "keyword": "两字",
      "reading": "过去位解读。60-80字。"
    },
    {
      "position": "present",
      "name": "牌名",
      "reversed": false,
      "keyword": "两字",
      "reading": "现在位解读。60-80字。"
    },
    {
      "position": "future",
      "name": "牌名",
      "reversed": true,
      "keyword": "两字",
      "reading": "未来位解读。60-80字。"
    }
  ],
  "actions": [
    {
      "title": "建议一句话概括",
      "sourceCard": "牌名+正逆位",
      "body": "2-3句展开。必须是用户明天就可以做的具体行动。"
    }
  ]
}
```

### 新增字段约束

| 字段 | 约束 |
|------|------|
| `cards[].keyword` | 恰好 2 个汉字。三牌 keyword 连起来应体现情绪弧线（如「失衡→暂停→觉醒」） |
| `actions[].sourceCard` | 必须是本次三张牌中的某一张，格式为牌名+正逆位（如「皇后逆位」） |
| `actions` 数组 | 恰好 3 条建议 |

### 安全边界

| 场景 | 行为 |
|------|------|
| 自伤/自杀 | `narrative` 承载提示语 + 心理援助热线 400-161-9995，`cards` 和 `actions` 留空数组 |
| 疾病诊断/法律纠纷 | `narrative` 回复"塔罗无法替代专业医生/律师…"，`cards`/`actions` 留空 |
| 无意义内容 | `narrative` 回复"你似乎还没有写下你的问题…"，`cards`/`actions` 留空 |
| 问题模糊 | `narrative` 追问引导，`cards`/`actions` 留空 |

---

## 二、响应解析

### 三层降级

```
1. 直接 JSON.parse(rawText)           ← 新版 AI 直接返回
2. 正则提取 ```json ... ``` 代码块    ← AI 偶尔包一层
3. 旧版【标题】格式正则解析            ← 历史记录 / AI 不听话
```

### 标准化

`normalizeJsonResponse()` 确保 3 张牌按 past/present/future 排序，补全缺失字段（`keyword: null` / `sourceCard: null`）。

### 旧版降级

`parseLegacyText()` 用 `【...】` 标题正则匹配章节，提取整体叙事/过去/现在/未来/行动建议各段，构建伪结构化数据（keyword 和 sourceCard 均为 null）。

---

## 三、NarrativeThread —— 三牌关键词脉络

### 视觉规格

```
     ●                    ●                    ●
   过去                  现在                  未来
  「束缚」             「觉醒」             「自由」
```

| 位置 | 圆点尺寸 | 描边色 | 光晕 |
|------|----------|--------|------|
| 过去 / 未来 | 11×11px | `rgba(230,201,130,.6)` | `0 0 8px rgba(230,201,130,.25)` |
| 现在（中间） | 13×13px | `rgba(230,201,130,.85)` | `0 0 12px rgba(230,201,130,.45)` |

- 连接线：`linear-gradient(90deg, rgba(230,201,130,.15), rgba(230,201,130,.5), rgba(230,201,130,.15))`，高 1px
- 位置名：`font-size:10px`，`letter-spacing:2px`，`text-gold-200/60`
- keyword：`font-size:12px`，`text-white/[.82]`
- 无 keyword → 只显示位置名，不报错

---

## 四、ActionItem —— 行动建议单条

### 视觉规格

```
┌──────────────────────────────────────────┐
│ ①  明天早上写下3件感激的小事             │
│    源自 · 星星正位                       │
│    这会帮你重新连接生活中的积极面...      │
├──────────────────────────────────────────┤
│ ②  约一个很久没见的朋友喝咖啡             │
│    源自 · 太阳正位                       │
│    ...                                   │
└──────────────────────────────────────────┘
```

- **编号徽章**：30×30px 金色描边圆 + 渐变金数字 + `boxShadow: 0 0 12px rgba(230,201,130,0.15)`
- **标题**：`font-size:14px`，`text-white/95`
- **来源牌标签**：`bg-gold/10` + `<Layers size={11}>` + 牌名，`text-[10.5px] text-gold-200/75`
  - `sourceCard` 为 null 时不渲染
- **正文**：`font-size:13px`，`leading-[1.85]`，`text-white/72`
- **分隔**：`border-b border-gold/[.12]`，最后一条无底边线
- **动画**：stagger 入场，`delay = (index-1) × 0.12s`

---

## 五、Divider —— 装饰分隔线

```
──────────── ◆ ────────────
```

两条 40px 金色渐变线（两端透明），向中央汇聚到一颗 45° 旋转的金色菱形（6×6px）。

用于模块标题与内容之间。

---

## 六、ReadingText 模块化结构

### 三个模块

| 序号 | 模块 | 容器 | 标题图标 | 入场延迟 |
|------|------|------|----------|----------|
| 1 | 整体叙事 | GlassCard + SectionTitle(Sparkles) + Divider + NarrativeThread + 正文 | Sparkles | 80ms |
| 2 | 单牌解读 ×3 | 卡牌居中 + 三层金色光晕 + 悬浮呼吸 | Moon/Sparkles/Sun | +600ms 每张 |
| 3 | 行动建议 | GlassCard + SectionTitle(Route) + Divider + ActionItem×3 | Route | +350ms |

### 双格式入口

```
data（object）→ 直接用
rawText（string）→ parseReadingResponse()
rawText（object with .cards）→ 直接用（localStorage 取出）
```

### 单牌解读保持不变

- 卡牌居中（`size="lg"`）+ 三层金色呼吸光晕 + `translateY` 浮动
- 大号金色衬线体标题：`{Icon} {位置} · {牌名}` + 逆位金色胶囊标签
- 金色短分隔线（80px）
- `·` 引导正文，牌名在正文中出现时用金色高亮（`highlightCardNames`）

---

## 七、ReadingPage 去 emoji

| 之前 | 之后 |
|------|------|
| ✨ | `<Sparkles>` |
| 💾 / ✅ | `<Check>` |
| 📤 | `<Upload>` |
| 📜 | `<BookOpen>` |
| 🏠 | `<Home>` |
| 🌙（错误态） | `<Moon size={48}>` |
| 已保存 `text-green-400` | `color: #c9a96e`（金色） |

所有图标 `strokeWidth={1.6}` 或 `1.8`，颜色 `#c9a96e` 或 `rgba(201,169,110,0.6)`。

---

## 验证标准

- [x] 「逐张牌解读」模块未被改动
- [x] 整体叙事顶部有「三牌关键词脉络」
- [x] 无 keyword 字段时脉络只显示位置名
- [x] 行动建议每条为金色编号徽章 + 标题 + 来源牌标签
- [x] 无 sourceCard 字段时不渲染「源自」标签
- [x] 正文里的牌名高亮为金色
- [x] 两模块均用 GlassCard + 装饰分隔线
- [x] 全页无 emoji，统一金色细线图标
- [x] AI 接口已新增 keyword 与 sourceCard 字段
- [x] 旧版历史记录仍可正常显示
- [x] `npm run build` 零报错
