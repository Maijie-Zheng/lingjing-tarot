# P3-7 分享卡片海报重做 · 开发记录

> 日期：2026-06-14 | 状态：已完成 | 对应设计规范 v0.9

---

## 实际改动

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/SharePoster.jsx` | 海报 HTML 结构（品牌头/问题/三牌/关键词/金句/浓缩叙事/二维码/水印），供 html-to-image 截图导出 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/utils/promptBuilder.js` | System Prompt JSON Schema 新增 `shareQuote` + `shareNarrative` 字段 |
| `src/utils/parseResponse.js` | `normalizeJsonResponse()` 补齐新字段；`parseLegacyText()` 两字段返回 `null`（触发降级）|
| `src/utils/shareImage.js` | **重写**：Canvas 绘制全部移除，替换为 `generateShareImage(posterEl)` 调用 html-to-image 导出 |
| `src/components/ShareOverlay.jsx` | 去 emoji（`👆` → lucide `Hand` 图标）、规整按钮间距、加占位防止与操作栏重叠 |
| `src/pages/ReadingPage.jsx` | 接入 SharePoster + html-to-image 流程；合并 picks 图片与 AI keyword；shareQuote 降级逻辑；隐藏 DOM 截图 |
| `src/lib/constants.js` | 新增 `SHARE_URL = 'https://lingjing-tarot.vercel.app?from=share'` |

### 新增依赖

| 包 | 用途 |
|----|------|
| `qrcode.react` | 动态生成二维码 SVG（QRCodeSVG 组件）|
| `html-to-image` | 把海报 DOM 导出为 750×1334 PNG（pixelRatio: 2）|

### 未修改文件

| 文件 | 原因 |
|------|------|
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/CardBack.jsx` | 复用 |
| `src/utils/api.js` | 不改 API 逻辑 |
| `src/utils/storage.js` | 不改存储结构 |

---

## 设计意图

### 之前 vs 之后

```
之前：Canvas 手绘 750×1334，智能打分提取解读片段
      无二维码、文字可能泄露 JSON 字段名/引号、emoji 位置图标

之后：React 组件渲染海报 DOM → html-to-image 导出 PNG
      金句 + 浓缩叙事由 AI 专门生成、二维码指向分享落地页、
      全页金色图标无 emoji、内容层级清晰可读
```

核心变化：**海报从"手工画布"改为"声明式组件"**。Canvas 方案需要手动计算每一行的坐标、换行、样式——像用钢笔描 UI。React + html-to-image 方案直接用 JSX 描述海报结构，排版由浏览器完成，且天然支持嵌入 SVG 二维码。

---

## 改动明细

### 一、AI 数据契约新增

System Prompt JSON Schema 新增两个字段（在 `actions` 数组之后）：

```json
{
  "shareQuote": "用一句话（不超过20字）概括最戳心的洞察",
  "shareNarrative": "3~4行浓缩叙事，体现过去→现在→未来弧线"
}
```

约束：
- `shareQuote` ≤20 字，不加引号，一句洞察
- `shareNarrative` 有画面感，语气温柔有回味
- 安全边界场景（自伤/疾病/无意义）下两字段仍需输出——金句用心理援助热线号码，叙事留空

### 二、响应解析适配

```js
// normalizeJsonResponse() 新增
shareQuote: json.shareQuote || null,
shareNarrative: json.shareNarrative || null,

// parseLegacyText() 返回
shareQuote: null,   // 触发降级
shareNarrative: null,
```

### 三、降级方案

| 场景 | 行为 |
|------|------|
| 无 `shareQuote` | 从 `narrative` 取第一句，截断到 20 字兜底 |
| 无 `shareNarrative` | 该区域不渲染，只保留金句 |
| 均无 | 金句用 narrative 首句截断；无浓缩叙事区 |
| html-to-image 失败 | 静默失败，不报错 |

降级逻辑集中在 ReadingPage 的 `useMemo` 中，SharePoster 只负责渲染——收什么显示什么，`null` 就不显示。

### 四、SharePoster 海报结构（自上而下）

```
品牌头：「灵 境」（48px 宋体渐变金，字距 9px）
标语：「解锁灵境，让心事皆有回响」
── ◆ ── 装饰分隔线
问题：「关于」+「{question}」
三张牌（100×148px，金边，逆位旋转 180° + 金「逆」胶囊标签）
位置图标（Moon/Sparkles/Sun，内联 SVG，非 emoji）+ 牌名
关键词脉络（· 连接，暗金字距 3px）
金句（16px 宋体 #F1DCA0）
浓缩叙事（12.5px / 行高 2 / white-72%）
── ◆ ── 分隔线
水印「灵境」+ 二维码（52×52，浅底 #f3eede）
```

- 固定 375×667 逻辑像素（pixelRatio:2 → 导出 750×1334）
- 全内联样式（保证 html-to-image 捕获一致性）
- 星空粒子 + 星云光斑：确定性伪随机（seed 固定，多次渲染一致）
- 二维码内容：`https://lingjing-tarot.vercel.app?from=share`

### 五、分享流程重构

```
之前：handleShare → generateShareCanvas(Canvas) → toDataURL → 弹窗/分享/下载

之后：handleShare → setIsGeneratingShare(true)
                 → SharePoster 渲染到隐藏 DOM
                 → useEffect 等一帧 RAF + 200ms
                 → generateShareImage(posterRef) → toPng({ pixelRatio: 2 })
                 → 微信 → 弹窗浮层
                 → 支持 Web Share API → navigator.share({ files: [png] })
                 → 降级 → downloadImage()
```

### 六、ShareOverlay 规整

| 之前 | 之后 |
|------|------|
| `👆 长按图片保存到相册` | `<Hand>` lucide 金色手指图标 + 文字 |
| 按钮无占位，可能与底部操作栏重叠 | 底部加 spacer `h-2` |
| 图片 maxHeight: 75vh | 改为 70vh（给提示区更多空间）|
| 关闭按钮 `rounded-full border` 不变 | 描边色略调暗 `rgba(255,255,255,0.18)` |

---

## 构建验证

```
npm run build → ✓ built in 1.15s，零报错
```

## 部署

Vercel 生产环境：https://lingjing-tarot.vercel.app ✅

---

## 回顾

### 做了什么

把分享卡片从 Canvas 手绘方案升级为 React 组件 + html-to-image 导出。AI 新增 `shareQuote`（金句）和 `shareNarrative`（浓缩叙事）两个字段。海报视觉结构完整：品牌头 → 问题 → 三张牌 → 关键词脉络 → 金句 → 浓缩叙事 → 二维码 + 水印。弹窗操作区去 emoji、图标统一用 lucide。

### 为什么这么做

- **修 bug**：旧版 Canvas 渲染 rawText 时可能带出 JSON 字段名和引号。新方案直接从结构化数据取值，字段名永远不会泄露到卡面上。
- **内容升级**：旧版用智能打分从解读全文摘句子——可能摘到客套话。新版让 AI 专门为分享场景写一句金句和一段浓缩叙事，质量更高。
- **二维码**：分享卡是产品唯一的获客渠道。二维码指向 `?from=share`，朋友圈里看到的人扫码就能抽自己的牌。
- **html-to-image > Canvas**：Canvas 画 QR 码 SVG 需要额外加载 qrcode 库生成图片再 drawImage，且文字排版要手动算坐标。React 组件直接用 CSS 排版 + QRCodeSVG 内嵌，维护成本低得多。

### 学到什么

- **隐藏 DOM 截图模式**：海报在 `position:fixed; opacity:0; z-index:-1` 的容器中渲染，html-to-image 可以正常捕获。等一帧 RAF + 200ms 延迟确保图片和 SVG 都加载完成。
- **确定性伪随机**：星空粒子的位置用 seed 固定的公式生成（`(i * 137.508 + 42) % 1000`），多次渲染结果一致，避免 React 重渲染时星星乱跳。
- **降级链**：shareQuote（AI → narrative 首句截断 → null）→ SharePoster（有就显示，null 就跳过）→ 不报错。每一层独立决策，不穿透。
- **合并数据源**：海报需要的牌数据来自两个地方——`cards`（location.state，有 image）和 `readingData.cards`（AI，有 keyword）。`posterCards` 用 useMemo 合并两者，SharePoster 只收一份数据。
