# P3-7 分享卡片海报重做 · 规格说明

> 状态：待确认 | 日期：2026-06-14 | 对应设计规范 v0.9

---

## 目标

分享卡片是产品的获客闭环——二维码是朋友圈里唯一的入口。本次从三方面重做：

1. **修 bug**：卡片上出现 `"narrative":` 等原始 JSON 字段名和引号，改为只取字段值
2. **内容升级**：AI 新增 `shareQuote`（金句≤20字）+ `shareNarrative`（浓缩叙事3~4行），替代当前的智能打分提取
3. **海报重设计**：品牌头 → 问题 → 三张牌 → 关键词脉络 → 金句 → 浓缩叙事 → 二维码+水印，全页无 emoji
4. **弹窗规整**：去 emoji、按钮不重叠、模态背景全暗不透底层

技术路线：Canvas 方案改为 **HTML 渲染 + html-to-image 导出**——因为需要嵌入 qrcode.react 生成的 SVG 二维码 + 复杂排版，Canvas 手绘成本太高。

---

## 用户提供的设计提示词

用户直接提供了完整设计规范文档「灵境 · 设计规范 v0.9」，包含：

1. **Bug 修复**：字段泄漏——当前卡片渲染了原始 JSON key 和引号，改为只取值
2. **数据契约**：新增 `shareQuote` + `shareNarrative` 两个 AI 字段
3. **海报结构**：品牌头 → 问题 → 三张牌 → 关键词脉络 → 金句 → 浓缩叙事 → 二维码+水印
4. **二维码**：`qrcode.react` 生成，指向 `https://lingjing-tarot.vercel.app?from=share`
5. **弹窗操作区**：去 emoji、长按保存提示 + 关闭按钮、模态背景全暗

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/utils/promptBuilder.js` | 修改 | System Prompt 新增 `shareQuote` + `shareNarrative` 字段 |
| `src/utils/parseResponse.js` | 修改 | 解析 + 标准化新增字段，旧版降级补 null |
| `src/components/SharePoster.jsx` | **新建** | 海报 HTML 结构（品牌头/问题/三牌/关键词/金句/浓缩叙事/二维码/水印） |
| `src/components/ShareOverlay.jsx` | 重写 | 弹窗操作区——去 emoji、规整按钮、模态全暗 |
| `src/utils/shareImage.js` | 重写 | Canvas 绘制改为 html-to-image 导出 PNG |
| `src/pages/ReadingPage.jsx` | 修改 | 分享时传入 `shareQuote`/`shareNarrative` + 降级逻辑 |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/CardBack.jsx` | 复用 |
| `src/utils/api.js` | 不改 API 逻辑 |
| `src/utils/storage.js` | 不改存储结构 |

### 新增依赖

| 包 | 用途 |
|----|------|
| `qrcode.react` | 动态生成二维码 SVG |
| `html-to-image` | 把海报 DOM 导出为 PNG |

---

## 一、数据契约变更

### System Prompt 新增字段

在已有 `narrative` / `cards` / `actions` 基础上，JSON Schema 新增：

```jsonc
{
  // …已有字段…
  "shareQuote": "这张 offer 像一面镜子，照出你内心真正的渴望与恐惧",
  "shareNarrative": "过去的你被「必须接受」的执念束缚…"
}
```

| 字段 | 约束 | 用于海报 |
|------|------|----------|
| `shareQuote` | ≤20 字，一句，不加引号 | 金句区（宋体 16px，色 #F1DCA0，居中） |
| `shareNarrative` | 3~4 行，约 60~90 字，体现过去→现在→未来弧线 | 浓缩叙事区（12.5px / 行高 2 / white-72） |

### 降级方案

| 场景 | 行为 |
|------|------|
| 无 `shareQuote` | 从 `narrative` 取第一句，截断到 20 字兜底 |
| 无 `shareNarrative` | 该区域不渲染，只保留金句 |
| 均无 | 金句用兜底文案「牌面已揭示你的答案」，不显示浓缩叙事 |
| 任何情况 | 不报错、不露字段名 |

### parseResponse 适配

`normalizeJsonResponse()` 补齐：

```js
shareQuote: json.shareQuote || null,
shareNarrative: json.shareNarrative || null,
```

旧版降级 `parseLegacyText()` 两个字段均为 `null`（触发降级方案）。

---

## 二、海报视觉结构（自上而下）

```
┌─────────────────────────────────────┐
│         灵 境（宋体渐变金，字距9px）   │  品牌头
│     解锁灵境，让心事皆有回响          │  标语
│  ─────────── ◆ ───────────          │  装饰分隔线
│             关于                     │
│         「{question}」               │  问题
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 牌图 │  │ 牌图 │  │ 牌图 │      │  三张牌（视觉主角）
│  │      │  │      │  │      │      │  逆位插画旋转180°
│  └──────┘  └──────┘  └──────┘      │
│  🌙 过去   ✨ 现在   ☀️ 未来        │  位置图标+标签
│   女祭司    星星      世界           │  牌名（逆位加「逆」）
│                                      │
│       束缚 · 内省 · 真相             │  关键词脉络（暗金，字距3px）
│                                      │
│  这张offer像一面镜子，照出你          │  金句（宋体16px，#F1DCA0）
│  内心真正的渴望与恐惧                │
│                                      │
│  过去的你被「必须接受」的执念         │  浓缩叙事（12.5px/行高2）
│  束缚，现在需要像隐士一样独自         │  3~4行，体现弧线
│  看清自己真正在乎的…                 │
│                                      │
│  ─────────── ◆ ───────────          │  装饰分隔线
│                                      │
│  灵境               ┌──────┐        │  底部：左水印 + 右二维码
│  让心事皆有回响      │  QR  │        │  二维码浅底白边
│                      └──────┘        │
│                    扫码·抽你的牌      │
└─────────────────────────────────────┘
```

### 尺寸

- 750×1334（3:4 竖版），同当前 Canvas 尺寸
- 导出 pixelRatio: 2（保证清晰度）

### 品牌头

- 「灵 境」：`font-size: 48px`，`font-weight: bold`，`font-family: 'Noto Serif SC', serif`，金色渐变（`#E6C982` → `#c9a96e`），`letter-spacing: 9px`，居中
- 标语：`font-size: 20px`，`#ffffff/0.55`，`'PingFang SC'`，居中

### 三张牌

- 每张牌：130×195px（同当前），圆角 10px，金色边框
- 逆位：插画 `rotate(180deg)`，牌面右上角金色「逆」胶囊标签，牌名文字保持正向
- 牌下方：金色位置图标（Moon/Sparkles/Sun 内联 SVG，**非 emoji**）+ 位置名 + 牌名
- 逆位牌名后跟金色「逆」字

### 关键词脉络

- 取自 `cards[].keyword`，用 `·` 连接
- `font-size: 12px`，`color: rgba(201,169,110,0.7)`，`letter-spacing: 3px`，居中
- 无 keyword → 该行不渲染

### 金句

- `shareQuote`，`font-size: 16px`，`color: #F1DCA0`，`font-family: 'Noto Serif SC', serif`，居中，`line-height: 1.85`

### 浓缩叙事

- `shareNarrative`，`font-size: 12.5px`，`color: rgba(255,255,255,0.72)`，`line-height: 2`，居中

### 底部

- 左：小水印「灵境」+「让心事皆有回响」
- 右：二维码 52×52，浅底（`#f3eede`），白边 5px
- 二维码下方：「扫码 · 抽你的牌」（9px，暗金）

---

## 三、二维码

- 库：`qrcode.react`（`npm i qrcode.react`）
- 内容：`https://lingjing-tarot.vercel.app?from=share`
- 渲染：`<QRCodeSVG>` 组件，size=42，bgColor="#f3eede"，fgColor="#1a1338"，level="M"
- 常量集中管理：`src/lib/constants.js` 新增 `SHARE_URL`

---

## 四、弹窗操作区

### 当前问题

- `👆 长按图片保存到相册` 用了 emoji
- 按钮与底部操作栏重叠
- 模态遮罩不够暗

### 改为

```
┌─────────────────────────────────┐
│         （全暗遮罩 bg-black/92） │
│                                  │
│     ┌──────────────────┐        │
│     │   海报图片 PNG    │        │
│     └──────────────────┘        │
│                                  │
│   ✋ 长按图片保存到相册           │  ← HandFingers 图标，非emoji
│   保存后可在微信/朋友圈分享       │
│                                  │
│   ┌── 关 闭 ──┐                 │  ← 幽灵按钮，细描边
│   └───────────┘                 │
└─────────────────────────────────┘
```

- 遮罩：`background: rgba(0,0,0,0.92)`（同当前）
- 手指图标：lucide `Hand` 或自定义 SVG（内联 24px 金色线条手指）
- 提示文案：白色/80，16px
- 次行文案：白色/30，12px
- 关闭按钮：细描边幽灵按钮（`border: 1px solid rgba(255,255,255,0.2)`），居中
- 弹窗打开时底部解读页操作栏不穿透

---

## 五、html-to-image 导出

### 流程

```
SharePoster（React 组件，渲染为 DOM）
  → 等牌面图片 + 二维码 SVG + 字体全部加载
  → html-to-image toPng(posterRef.current, { pixelRatio: 2 })
  → Data URL
  → 弹窗显示 <img> + 长按保存 / Web Share API / 下载
```

### 关键细节

- **等资源加载**：所有 `<img>` `onLoad` + 二维码 SVG 渲染完成后再导出
- **字体**：确保 Noto Serif SC / PingFang SC 已加载（已在页面中使用，无需额外等待）
- **尺寸**：海报 DOM 固定 375×667（逻辑像素），`pixelRatio: 2` 导出 750×1334
- **圆角**：海报本身不留圆角（导出图是矩形），内部卡片元素可带圆角

### 降级

html-to-image 失败时 → 兜底用 Canvas 简化版（只含品牌头+三牌+金句，无二维码）

---

## 六、文件变更明细

### 6.1 `src/utils/promptBuilder.js`

System Prompt JSON Schema 中新增两个字段描述（在 `actions` 数组之后）：

```
额外输出两个用于分享卡的字段：
1. "shareQuote": 用一句话（不超过20字、不加引号）概括本次解读最戳心的洞察，适合作为分享卡的标题金句。
2. "shareNarrative": 用3~4行（约60-90字）浓缩整体叙事，体现过去→现在→未来的弧线，语气温柔有回味，供分享卡正文用。
```

### 6.2 `src/utils/parseResponse.js`

- `normalizeJsonResponse()`：新增 `shareQuote: json.shareQuote || null`、`shareNarrative: json.shareNarrative || null`
- `parseLegacyText()`：两个字段返回 `null`

### 6.3 `src/components/SharePoster.jsx`（新建）

React 组件，渲染海报 DOM。Props：
- `question: string`
- `cards: Array`（三张牌完整数据）
- `shareQuote: string | null`
- `shareNarrative: string | null`
- `posterRef: React.RefObject`（供 html-to-image 截图）

### 6.4 `src/components/ShareOverlay.jsx`（重写）

Props 不变（`visible` / `imageDataURL` / `onClose`），视觉规整：
- 手指图标用 lucide `Hand` 或内联 SVG
- 去 emoji
- 按钮布局不重叠

### 6.5 `src/utils/shareImage.js`（重写）

- 删除 Canvas 绘制函数
- 新增 `generateShareImage(posterRef)`：调用 html-to-image 导出
- 保留 `canvasToDataURL` / `downloadImage` 工具函数

### 6.6 `src/pages/ReadingPage.jsx`

- 从 `readingData` 解构 `shareQuote` / `shareNarrative`
- 分享时传这两个字段给 SharePoster
- 降级逻辑：`shareQuote` 为空时从 `narrative` 取首句截断 20 字

### 6.7 `src/lib/constants.js`

新增：
```js
export const SHARE_URL = 'https://lingjing-tarot.vercel.app?from=share'
```

---

## 验证标准

- [ ] 海报不再出现 `"narrative":` 或成对引号等原始 JSON 字段/符号
- [ ] 文字为「金句 + 浓缩叙事」两层，非整段解读全文
- [ ] 三张牌为视觉主角，逆位牌插画旋转 180°、牌名文字正向
- [ ] 关键词脉络、位置图标均金色，全页无 emoji
- [ ] 品牌只在顶部主标题 + 底部小水印各一次，不重复堆叠
- [ ] 右下角二维码指向 `https://lingjing-tarot.vercel.app?from=share`，浅底、可扫描
- [ ] 弹窗操作区：手指图标非 emoji、长按保存提示 + 关闭按钮布局不重叠
- [ ] 模态背景全暗（`bg-black/92`）、不透出底层页面操作栏
- [ ] 长按可保存为清晰 PNG（2x），导出前字体/图片/二维码已加载
- [ ] 缺 `shareQuote`/`shareNarrative` 时按降级方案，不报错、不露字段名
- [ ] `npm run build` 零报错
