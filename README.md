# 🔮 灵境 · AI 塔罗

> 输入问题 → 抽三张牌 → AI 深度解读 → 分享精美卡片
>
> 一个为"深夜小雨"设计的 AI 塔罗解读 Web App。

[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://lingjing-tarot.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)

---

## ✨ 灵境是什么

灵境是一个 AI 驱动的塔罗牌解读应用。它不会告诉你"命运已注定"——而是像一个懂塔罗也懂人心的朋友，倾听你的心事，用三张牌串联过去、现在和未来，给出真诚而有建设性的回应。

**核心体验：仪式感 × AI 个性化 × 中文文化理解**

---

## 🎯 产品亮点

- 🃏 **亲手选牌**：22 张经典韦特塔罗，环形无限轮播，凭直觉选出 3 张
- 🤖 **AI 个性化解读**：DeepSeek 驱动，根据你输入的问题 + 抽到的牌面给出贴合解读
- ✨ **仪式感满格**：冥想呼吸 → 洗牌动画 → 翻牌揭示 → 解读逐段浮现
- 📤 **精美分享卡片**：Canvas 生成 3:4 竖版卡片，带二维码，微信可分享
- 🔒 **隐私优先**：无需登录，所有数据仅存于你的浏览器

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd 灵境-AI-Tarot

# 2. 安装依赖
npm install

# 3. 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key（从 https://platform.deepseek.com/api_keys 获取）

# 4. 启动开发服务器
npm run dev

# 5. 构建生产版本
npm run build
```

---

## 🛠️ 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 + Vite 8 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 路由 | React Router 6 |
| AI | DeepSeek API (deepseek-chat) |
| 存储 | localStorage |
| 部署 | Vercel |
| 轮播 | Embla Carousel |

---

## 📁 项目结构

```
灵境-AI-Tarot/
├── src/
│   ├── components/    # 通用组件（TarotCard、CardCarousel、SharePoster 等）
│   ├── pages/         # 页面组件（Landing、Ask、Draw、Reading 等）
│   ├── hooks/         # 自定义 Hook（useHistory、useQuestionBatch）
│   ├── utils/         # 工具函数（API 调用、Prompt 构建、分享图片生成）
│   ├── data/          # 静态数据（22 张牌信息、预设问题）
│   └── lib/           # 纯逻辑（洗牌算法、常量定义）
├── public/cards/      # 22 张韦特塔罗牌面图片
├── docs/              # 10 份产品文档（PM 作品集）
└── CLAUDE.md          # AI 开发指南
```

---

## 📖 产品文档

本项目是一份完整的 **AI 产品经理作品集**，包含从 0 到 1 的 10 份产品文档：

| # | 文档 | 内容 |
|---|------|------|
| 01 | 项目总览 | 解决谁的什么问题 |
| 02 | 市场调研报告 | 市场上有哪些产品 |
| 03 | 竞品分析表 | 别人怎么做、可借鉴什么 |
| 04 | 用户画像与需求分析 | 用户是谁、真正想要什么 |
| 05 | 产品定位与 MVP 范围 | 第一版做什么、不做什么 |
| 06 | PRD 产品需求文档 | 每个功能具体怎么做 |
| 07 | 原型设计说明 | 每个页面长什么样 |
| 08 | AI Prompt 设计文档 | AI 怎么解读塔罗牌 |
| 09 | Demo 开发记录 | 技术架构 + 开发过程 |
| 10 | 用户测试与复盘 | 验证了什么、下一版怎么改 |

> 详见 [`docs/`](./docs/) 目录

---

## 🎨 设计规范

| 属性 | 值 |
|------|-----|
| 背景 | `#1a0a2e` → `#0d0221` 深紫渐变 |
| 品牌色 | `#c9a96e`（金色） |
| 辅助色 | `#8b5cf6`（紫色） |
| 标题字体 | Noto Serif SC |
| 正文字体 | Noto Sans SC / PingFang SC |

---

## ⚠️ 已知问题

- Vercel 免费域名在国内被墙，需自定义域名或换平台部署
- 当前只支持 22 张大阿尔卡纳，小阿尔卡纳未收录

---

## 📝 许可

MIT

---

*Made with ❤️ by @Y9000 · 一个 AI 产品经理的学习旅程*
