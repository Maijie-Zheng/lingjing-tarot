# P3-5 解读页重构 · 开发记录

> 日期：2026-06-10 | 状态：已完成 | 对应设计规范 v0.6

---

## 实际改动

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/NarrativeThread.jsx` | 三牌关键词脉络——金线上三个节点（过去/现在/未来），中位更大更亮，显示 keyword 而非牌名 |
| `src/components/ActionItem.jsx` | 行动建议单条——金色编号徽章 + 标题 +「源自 · 某张牌」标签 + 正文 |
| `src/components/Divider.jsx` | 装饰分隔线——两道金色渐变细线向中央 45° 金色菱形汇聚 |
| `src/lib/constants.js` | 共享常量——POSITION_LABEL 位置名映射 |
| `src/utils/parseResponse.js` | AI 响应解析器——三层降级：纯 JSON → markdown 代码块提取 → 旧版【标题】文本正则 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/utils/promptBuilder.js` | System Prompt 重写：从 markdown 章节输出改为严格 JSON 格式，新增 `keyword`（每牌两字）+ `sourceCard`（建议来源牌）字段 |
| `src/components/ReadingText.jsx` | 大量重写：三个内容模块（整体叙事 / 单牌解读 ×3 / 行动建议），支持新版 `data` 和旧版 `rawText` 双格式 |
| `src/pages/ReadingPage.jsx` | 去 emoji 换 lucide 金色图标、已保存按钮改为金色、分享/保存/历史按钮图标化 |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/TarotCard.jsx` | 复用 |
| `src/pages/HistoryPage.jsx` | 兼容（ReadingText 已支持旧版文本格式） |

---

## 改动明细

### 一、AI 数据契约变更

**System Prompt 从 markdown 改为 JSON**。之前 AI 输出是 `【整体叙事】\n...` 这样的自由文本，现在要求返回：

```json
{
  "narrative": "整体叙事。50-70字...",
  "cards": [
    { "position": "past", "name": "牌名", "reversed": true, "keyword": "两字", "reading": "解读..." }
  ],
  "actions": [
    { "title": "建议一句话", "sourceCard": "牌名+正逆位", "body": "2-3句展开" }
  ]
}
```

新增字段：
- `cards[].keyword`：恰好 2 个汉字，三牌 keyword 连起来应体现情绪弧线（如「失衡→暂停→觉醒」）
- `actions[].sourceCard`：必须来自本次三张牌中的某一张，格式为「牌名+正逆位」

安全边界保留——涉及自伤/自杀/疾病/法律时 JSON 中 `narrative` 承载提示语，`cards` 和 `actions` 留空数组。

### 二、parseResponse —— 三层解析降级

```
1. 直接 JSON.parse(rawText)        ← 新版 AI 直接返回
2. 正则提取 ```json ... ``` 代码块  ← AI 偶尔包一层
3. 旧版【标题】格式正则解析         ← 历史记录 / AI 不听话
```

`parseLegacyText()` 用 `【...】` 标题匹配章节，提取整体叙事/过去/现在/未来/行动建议各段，补 `keyword: null` 和 `sourceCard: null`。

### 三、NarrativeThread —— 三牌关键词脉络

三组节点排列在一条金线上（`linear-gradient` 半透明渐变线）：

| 位置 | 尺寸 | 描边 | 光晕 |
|------|------|------|------|
| 过去 / 未来 | 11×11px | `rgba(230,201,130,.6)` | `0 0 8px .25` |
| 现在（中间） | 13×13px | `rgba(230,201,130,.85)` | `0 0 12px .45` |

节点下方显示位置名（`font-size:10px`）+ keyword（`font-size:12px`）。无 keyword 时只显示位置名。

### 四、ActionItem —— 行动建议单条

- 左侧：30×30px 金色描边圆徽章 + 渐变金数字 + 微光
- 右侧：标题（`text-white/95`）→「源自 · 某张牌」金色标签（`bg-gold/10` + `<Layers>` 图标）→ 正文（`leading-[1.85]`）
- 每条底部 hairline 金色分隔（`border-b border-gold/[.12]`）
- 入场动画 stagger：delay = `(index-1) × 0.12s`

### 五、Divider —— 装饰分隔线

两条 40px 金色渐变细线（`linear-gradient` 两端透明），向中央汇聚到一颗 45° 旋转的金色菱形（6×6px，`rgba(230,201,130,.5)`）。

### 六、ReadingText 模块化重写

**双格式入口**：
```js
const structured = useMemo(() => {
  if (data && data.cards?.length) return data;           // 新版：直接用
  if (typeof rawText === 'object' && rawText.cards) return rawText; // localStorage 取出的对象
  if (typeof rawText === 'string') return parseReadingResponse(rawText, cards); // 旧版文本
  return null;
}, [rawText, data, cards]);
```

**三个内容模块**：

| 模块 | 容器 | 标题图标 | 内容 |
|------|------|----------|------|
| 整体叙事 | GlassCard | `<Sparkles>` | NarrativeThread + 叙事正文 |
| 单牌解读 ×3 | 卡牌居中 + 金色光晕 | Moon/Sparkles/Sun | 保持原样不动 |
| 行动建议 | GlassCard | `<Route>` | ActionItem ×3 |

**分段动画节奏**：整体叙事 → 350ms 间隔 → 三张牌各 600ms → 行动建议，每段 `fadeIn + slideUp`。

**单牌解读保持原样**：卡牌居中 + 三层金色光晕呼吸 + 浮动 `translateY` + 大号金色衬线体标题 + 逆位金色胶囊标签 + `·` 引导正文（牌名金色高亮 `highlightCardNames`）。

### 七、ReadingPage 视觉一致性

| 之前 | 之后 |
|------|------|
| ✨ emoji 图标 | `<Sparkles>` lucide `strokeWidth={1.6}` |
| 💾 保存按钮 | `<Check>` 金色图标 |
| 📤 分享卡片 | `<Upload>` 金色图标 |
| 📜 历史记录 | `<BookOpen>` 金色图标 |
| 🏠 首页 | `<Home>` 金色图标 |
| 🌙 错误提示 | `<Moon size={48}>` 金色图标 |
| 已保存绿色 `text-green-400` | 金色 `#c9a96e` |

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

把解读页从"一大段 AI 返回的 markdown 文本"升级为"三个视觉层次分明的模块"——整体叙事在磨砂玻璃卡 + 三牌关键词脉络，单牌解读卡牌居中带金辉光晕，行动建议带金色编号徽章和来源牌标签。AI 输出从自由文本改为结构化 JSON。

### 为什么这么做

- **信息层级**：之前的一切都是平铺文字，用户不知道该先看哪。现在叙事→牌→建议三个模块各自有容器和标题，扫一眼就能抓重点。
- **AI 可控性**：旧版让 AI 自由输出 markdown，偶尔不按格式来。JSON 约束了字段和长度，`keyword` 和 `sourceCard` 让前端能做出 NarrativeThread 和来源标签这样的交互层。
- **向后兼容**：三层解析降级 + ReadingText 双格式入口，确保旧版历史记录不会坏。
- **去 emoji**：统一到金色 lucide 图标，品牌一致性。

### 学到什么

- **JSON prompt 工程**：描述字段含义比描述格式更难——比如何让 AI 理解"keyword 三牌连起来是一条情绪弧线"。在 System Prompt 里给了一个示例（「失衡→暂停→觉醒」），比约束语句更有效。
- **降级设计**：`parseResponse` 三个 try-catch 层级不是炫技——DeepSeek 确实偶尔会在 JSON 外包 markdown 代码块，或者格式出错。最外层兜底的旧版正则解析救了旧记录。
- **结构化数据流转**：`parseResponse` → `ReadingPage state` → `localStorage` → `ReadingText useMemo`。每一步都要考虑"前一环可能给什么格式"。HistoryPage 读旧记录时 `reading` 是纯文本字符串，需要 ReadingText 检测类型后走 parseLegacyText。
