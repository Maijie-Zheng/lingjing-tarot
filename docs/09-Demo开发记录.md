# 灵境 · Demo 开发记录

> 文档状态：✅ 第一阶段开发完成 | 最后更新：2026/06/09 | 作者：@Y9000 + AI协助
>
> 本文档记录灵境 MVP 从架构设计到上线的完整开发过程。7 轮迭代已全部完成，项目已部署至 Vercel。

---

## 一、技术选型

### 1.1 选型原则

> MVP 阶段：**能简单就不复杂，能用现成的就不自己造，能 AI 生成的就不手写。**

### 1.2 最终选型

| 层级 | 选择 | 为什么 |
|------|------|--------|
| **框架** | React 18 + Vite | Vibe Coding 工具（Lovable/Bolt/Cursor）默认输出 React；Vite 是最快的构建工具 |
| **路由** | React Router v6 | 6 个页面需要路由，React Router 是标配 |
| **样式** | Tailwind CSS | AI 工具生成 Tailwind 最流畅；不用写 CSS 文件 |
| **动画** | CSS Animations + Framer Motion | CSS 做简单动画（星空），Framer Motion 做复杂动效（翻牌） |
| **AI 模型** | DeepSeek V4 Pro | 用户指定：最强中文能力 + 合理价格 |
| **API 调用** | 前端直连 DeepSeek API | MVP 不做后端，减少一层部署 |
| **存储** | localStorage | 不登录的方案。key: `lingjing_readings` |
| **部署** | Vercel | 免费、自动部署、全球 CDN、支持环境变量 |
| **域名** | `lingjing-tarot.vercel.app` | ⚠️ 国内需 VPN 访问，后续绑定自定义域名 |

### 1.3 为什么不选这些

| 不选 | 原因 |
|------|------|
| Next.js | MVP 不需要 SSR，Vite SPA 足够 |
| Vue | Vibe Coding 工具对 React 支持更好 |
| 后端服务器 | 增加运维成本，前端直连 API 足够 |
| 数据库 | 不做登录，localStorage 够用 |
| 微信小程序 | 审核风险，Web 更自由 |
| TypeScript | MVP 用 JSX 更快，TypeScript 后续再加 |

---

## 二、项目目录结构

```
lingjing-tarot/
│
├── public/                        # 静态资源（不经过构建）
│   ├── cards/                     # 22 张塔罗牌面图
│   │   ├── 00-fool.jpg
│   │   ├── 01-magician.jpg
│   │   ├── ...
│   │   └── 21-world.jpg
│   ├── card-back.png              # 牌背设计图
│   ├── favicon.svg                # 网站图标
│   └── og-image.png               # 分享链接时的预览图
│
├── src/
│   ├── components/                # 可复用 UI 组件
│   │   ├── StarBackground.jsx     # 星空粒子背景（首页/全局）
│   │   ├── TarotCard.jsx          # 单张塔罗牌组件（正面/背面/翻转/选中态）
│   │   ├── CardGrid.jsx           # 选牌时的 3×3 牌阵网格
│   │   ├── RevealSequence.jsx     # 翻牌序列动画（过去→现在→未来）
│   │   ├── ReadingText.jsx        # 解读文字逐段显示动画
│   │   ├── ShareCard.jsx          # Canvas 绘制分享卡片
│   │   ├── LoadingSpinner.jsx     # 解读等待时的 loading 动画
│   │   └── PrivacyBadge.jsx       # "🔒 只保存在你的手机里"提示
│   │
│   ├── pages/                     # 页面组件（对应路由）
│   │   ├── HomePage.jsx           # /           首页
│   │   ├── AskPage.jsx            # /ask        问题输入页
│   │   ├── ShufflePage.jsx        # /shuffle    洗牌选牌页（含三个阶段）
│   │   ├── ReadingPage.jsx        # /reading    解读结果页
│   │   └── HistoryPage.jsx        # /history    历史记录页
│   │
│   ├── data/                      # 静态数据
│   │   └── tarotCards.js          # 22 张牌数据（名称/关键词/图片路径）
│   │
│   ├── utils/                     # 工具函数
│   │   ├── api.js                 # DeepSeek API 调用封装
│   │   ├── promptBuilder.js       # 把用户问题+抽牌结果拼成 User Prompt
│   │   ├── storage.js             # localStorage 读写封装
│   │   └── shareImage.js          # Canvas 绘制分享图的逻辑
│   │
│   ├── hooks/                     # 自定义 React Hooks
│   │   └── useHistory.js          # 历史记录的增删查清空逻辑
│   │
│   ├── App.jsx                    # 路由配置 + 全局布局
│   ├── main.jsx                   # 入口文件
│   └── index.css                  # 全局样式（Tailwind + 自定义字体/颜色）
│
├── index.html                     # HTML 入口
├── package.json                   # 依赖列表
├── vite.config.js                 # Vite 配置
├── tailwind.config.js             # Tailwind 配置（自定义颜色/字体）
├── .env                           # 环境变量（API Key，不提交到 Git）
├── .env.example                   # 环境变量模板（可提交）
├── .gitignore
└── README.md                      # 项目说明（写在这份开发记录里）
```

---

## 三、数据流设计

### 3.1 核心数据流

```
┌──────────┐
│  用户输入  │  userQuestion: string
│  问题     │
└────┬─────┘
     │
     ↓
┌──────────┐
│  选牌     │  selectedCards: [Card, Card, Card]
│  3张      │  每张 Card: { name, position, isReversed }
└────┬─────┘
     │
     ↓
┌──────────┐
│  构建     │  promptBuilder(userQuestion, selectedCards)
│  Prompt   │  → 拼接 System Prompt + User Prompt
└────┬─────┘
     │
     ↓
┌──────────┐
│  调用     │  api.callDeepSeek(systemPrompt, userPrompt)
│  DeepSeek │  → 返回 AI 解读文本 + 行动建议
└────┬─────┘
     │
     ↓
┌──────────┐
│  展示     │  解析 AI 返回 → 逐段动画展示
│  解读     │  同时保存到 localStorage
└────┬─────┘
     │
     ├→ 分享：Canvas 生成卡片 → 调用系统分享
     └→ 保存：写入 localStorage
```

### 3.2 状态管理

```
App 全局状态（用 React Context 或 URL 参数传递）：

/shuffle?question=xxx   ← 问题通过 URL 参数传递
/shuffle                → 选牌结果存在组件 state
/reading                → 选牌结果 + 问题通过 React Router 的 location.state 传递

不设全局 Store（Redux/Zustand），MVP 状态够简单，不需要。
```

### 3.3 localStorage 数据结构

```javascript
// key: "lingjing_readings"
// value: JSON 数组

[
  {
    "id": "a1b2c3d4-...",           // uuid
    "question": "他对我是什么感觉",
    "cards": [
      { "name": "星星", "nameEn": "The Star", "position": "past", "isReversed": false },
      { "name": "月亮", "nameEn": "The Moon", "position": "present", "isReversed": false },
      { "name": "太阳", "nameEn": "The Sun", "position": "future", "isReversed": false }
    ],
    "reading": "【整体叙事】\n你问的...",   // AI 完整解读文本
    "suggestions": ["建议1", "建议2", "建议3"],
    "createdAt": "2026-06-09T23:15:00+08:00"
  }
]
```

---

## 四、路由设计

| 路径 | 页面 | 需要的数据 | 从哪里获取 |
|------|------|----------|----------|
| `/` | HomePage | 无 | — |
| `/ask` | AskPage | 无 | — |
| `/shuffle?q=xxx` | ShufflePage | 用户问题 | URL query param |
| `/reading` | ReadingPage | 问题 + 3张牌 | `location.state` (from ShufflePage) |
| `/history` | HistoryPage | 历史记录列表 | localStorage |
| `/history/:id` | ReadingPage（回看模式） | 单条记录 | localStorage 按 id 查找 |

---

## 五、组件树

```
App.jsx
├── StarBackground          ← 全局背景（所有页面共用）
├── <Routes>
│   ├── HomePage
│   │   ├── TarotCard       ← 中央浮动主视觉牌
│   │   └── [CTA 按钮]
│   │
│   ├── AskPage
│   │   ├── [Textarea]
│   │   ├── [Chip 标签 × 5]
│   │   └── PrivacyBadge
│   │
│   ├── ShufflePage
│   │   ├── [阶段1: 洗牌动画]
│   │   ├── [阶段2: CardGrid]
│   │   │   └── TarotCard × 9     ← 9张牌背，可点击选中
│   │   └── [阶段3: RevealSequence]
│   │       └── TarotCard × 3     ← 3张选中牌，逐张翻转
│   │
│   ├── ReadingPage
│   │   ├── [三张牌缩略图]  TarotCard × 3 (mini)
│   │   ├── [LoadingSpinner]      ← 等待 API 时显示
│   │   ├── ReadingText           ← 解读逐段显示
│   │   ├── [行动建议卡片 × 3]
│   │   └── [分享 / 保存按钮]
│   │
│   └── HistoryPage
│       └── [记录卡片列表]
│           └── TarotCard × 3 (mini)  × N条记录
```

---

## 六、开发步骤

### 分 7 轮迭代，每轮做完能看到可用的东西

```
第 1 轮：骨架搭建
├── 用 Vite 创建 React 项目
├── 安装依赖（React Router, Tailwind, Framer Motion）
├── 配置 Tailwind 自定义颜色/字体
├── 搭建 App.jsx 路由框架
├── 创建 5 个页面空组件（先写死文字，能跳转就行）
└── ✅ 验证：能从一个页面跳到另一个页面

第 2 轮：静态页面
├── 实现 HomePage（星空背景 + 牌面 + 按钮）
├── 实现 AskPage（输入框 + chip + 隐私提示）
├── 实现 HistoryPage（空状态 + 记录卡片布局）
└── ✅ 验证：三个页面在手机上好看

第 3 轮：抽牌交互 ⭐ 最难
├── 实现 TarotCard 组件（背面/正面/翻转/选中态）
├── 实现洗牌动画（牌背交替穿插）
├── 实现 CardGrid 选牌（9 张牌背，选中发光上浮）
├── 实现 RevealSequence（逐张翻牌+位置标签）
├── 添加音效（可选，用 Web Audio API 简单实现）
└── ✅ 验证：从输入问题 → 洗牌 → 选牌 → 翻牌，全程流畅

第 4 轮：AI 解读集成
├── 实现 promptBuilder.js（拼接 System Prompt + User Prompt）
├── 实现 api.js（调用 DeepSeek API）
├── 实现 ReadingPage 加载态（loading 动画 + 文案轮换）
├── 实现 ReadingText 逐段显示动画
├── 实现超时/错误处理
└── ✅ 验证：输入真实问题 → 抽牌 → 等几秒 → 看到个性化解读

第 5 轮：本地存储 + 历史
├── 实现 storage.js（localStorage 封装）
├── 实现 useHistory hook
├── ReadingPage 自动保存解读结果
├── HistoryPage 读取并展示记录列表
├── 左滑删除 + 清空确认
└── ✅ 验证：解读完关闭浏览器 → 重新打开 → 历史记录还在

第 6 轮：分享卡片
├── 实现 Canvas 绘制分享图（星空背景+牌面+精选片段+QR Code+品牌）
├── 生成 PNG → 调用 Web Share API 或 长按保存
├── 精选片段提取逻辑（从解读中自动摘取 2-3 句最戳心的话）
└── ✅ 验证：生成一张 750×1334 的分享图，清晰美观

第 7 轮：打磨 + 部署
├── 所有页面添加 fade 过渡动画
├── 移动端适配测试（iPhone SE / 12 / 14 Pro Max / 主流安卓）
├── 添加 favicon + og-image
├── 部署到 Vercel
├── 配置环境变量（DeepSeek API Key）
└── ✅ 验证：手机访问 vercel.app 链接，全流程可用
```

---

## 七、关键依赖清单

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "react-router-dom": "^6.26",
    "framer-motion": "^11.5",
    "uuid": "^10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3",
    "vite": "^5.4",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4"
  }
}
```

**总共 5 个运行时依赖 + 4 个开发依赖，非常轻。**

---

## 八、关键风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| **API Key 暴露在前端** | 被滥用、被盗刷 | .env 存 Key → Vite 编译时注入 → Vercel 部署时设环境变量。但仍在前端可见（中等风险）。MVP 可接受；V2 用后端代理 |
| **DeepSeek API 不稳定** | 解读返回慢或失败 | 15s 超时 + 友好错误提示 + 重试按钮；考虑加 DeepSeek + 通义千问双通道 |
| **洗牌动画性能** | 低端手机卡顿 | 用 CSS transform 而非 JS 动画（GPU 加速）；低端机降级为简单 fade |
| **localStorage 容量** | 存太多记录超 5MB | 每条记录约 2KB，存 2000 条才满。加"最多存 50 条"限制即可 |
| **微信内置浏览器兼容** | 分享/动画异常 | Web Share API fallback；Flexbox 布局兜底 |

---

## 九、Vibe Coding 工具选择

| 工具 | 适合场景 | 我们的使用计划 |
|------|---------|--------------|
| **Lovable** | 从 0 生成完整项目 | 第 1-2 轮：生成项目骨架和静态页面 |
| **Cursor** | 文件级修改和调试 | 第 3-6 轮：复杂交互、API 集成、bug 修复 |
| **Bolt** | 快速原型预览 | 备选方案 |
| **Claude Code** | 架构指导、代码 Review | 全程：帮我 Review 每一轮的代码 |

> 💡 **推荐流程**：先用 Lovable 一句话生成初始项目 → 用 Cursor 逐文件精细打磨 → 用 Claude Code Review 代码质量。

---

## 十、开发完成

7 轮迭代已于 2026/06/09 全部完成。

> 详细复盘见 → `docs/10-用户测试与项目复盘.md`

---

## 📝 开发记录日志

| 日期 | 轮次 | 完成内容 | 技术要点 |
|------|------|---------|---------|
| 2026/06/09 | 架构设计 | 技术选型、目录结构、数据流、开发计划 | React 18 + Vite + Tailwind + Framer Motion |
| 2026/06/09 | 第 1 轮 | Vite 项目 + React Router + 5 个空页面 + 星空背景 | 从 React 19 降级到 18、@types/react 移除 |
| 2026/06/09 | 第 2 轮 | 首页/输入页/历史页静态 UI | TarotCard 组件、移动端优先布局 |
| 2026/06/09 | 第 3 轮 | 洗牌动画 + 3×3 选牌 + 3D 翻转揭示 | 三阶段状态机、Framer Motion preserve-3d、正逆位随机 |
| 2026/06/09 | 第 4 轮 | DeepSeek API 集成 + 解读逐段显示 | AbortController 超时、【】标记段落解析、StrictMode 双重调用防护 |
| 2026/06/09 | 第 5 轮 | localStorage 存储 + 历史记录 CRUD | UUID 生成、最多 50 条限制、存储满降级策略、左滑删除 |
| 2026/06/09 | 第 6 轮 | Canvas 分享卡片生成（750×1334） | Web Share API + PNG 下载兜底、精选片段提取、星空背景确定性随机 |
| 2026/06/09 | 第 7 轮 | 页面过渡动画 + 移动端适配 + Vercel 部署 | AnimatePresence、safe-area 适配、vercel.json SPA 路由重写 |
