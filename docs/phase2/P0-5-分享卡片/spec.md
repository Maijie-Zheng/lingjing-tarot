# P0-5 · 分享卡片微信兼容 — 规格说明

> 状态：📝 待确认 | 日期：2026/06/09 | 属于：第二阶段 → 增长引擎

---

## 一、现状

| 维度 | 当前状态 |
|------|---------|
| 分享方式 | Web Share API（分享文件到微信/朋友圈） |
| 降级方案 | 触发浏览器下载（`<a download>`） |
| 微信浏览器 | Web Share API 不支持，下载也不触发 |
| 用户感受 | "微信打开链接点分享没反应，什么都生成不了" |

### 当前分享流程（ReadingPage.jsx handleShare）

```
generateShareCanvas()
    ↓
canvasToDataURL()
    ↓
navigator.share({ files: [...] })  ← 微信内不支持
    ↓ 失败
downloadImage(dataURL)              ← 微信内也不支持 <a download>
    ↓ 失败
静默失败                              ← 用户什么都没看到
```

### 问题分析

1. **微信浏览器限制**：不支持 Web Share API（`navigator.share`），也不支持 `<a download>`
2. **没有视觉反馈**：失败时静默处理，用户点按钮没反应
3. **微信唯一可行的方案**：展示图片 → 用户长按保存

---

## 二、目标

1. **微信可用**：检测到微信浏览器时，生成图片后展示全屏浮层，用户长按保存
2. **其他浏览器不受影响**：Chrome/Safari 继续保持现有分享/下载逻辑
3. **引导清晰**：浮层上有明确的"长按保存图片"提示

---

## 三、技术方案

### 3.1 微信环境检测

```javascript
function isWeChat() {
  return /micromessenger/i.test(navigator.userAgent)
}
```

### 3.2 分享流程（改后）

```
handleShare()
    ↓
generateShareCanvas() → canvasToDataURL()
    ↓
isWeChat() ?
    ├── 是 → 显示 ShareOverlay（全屏图片 + "长按保存"）
    └── 否 → 尝试 Web Share API
                ↓ 失败
             downloadImage（浏览器下载）
```

### 3.3 ShareOverlay 组件设计

```
┌──────────────────────────────┐
│                              │
│    ┌──────────────────┐      │
│    │                  │      │
│    │  生成的分享卡片    │      │
│    │  (img, 自适应宽度) │      │
│    │                  │      │
│    └──────────────────┘      │
│                              │
│    👆 长按图片保存到相册      │
│                              │
│    [关闭]                    │
│                              │
└──────────────────────────────┘
```

- 全屏半透明遮罩
- 卡片图片居中，`max-width: 90vw`，保持 3:4 比例
- "👆 长按图片保存到相册" 引导文字
- 底部关闭按钮
- Framer Motion 弹入动画

### 3.4 代码改动范围

| 文件 | 改动 | 说明 |
|------|------|------|
| `src/components/ShareOverlay.jsx` | 🆕 新建 | 全屏分享图片浮层 |
| `src/pages/ReadingPage.jsx` | 🔧 修改 handleShare | 加微信检测 + 浮层逻辑 |

---

## 四、验收标准

| # | 标准 | 验证方式 |
|---|------|---------|
| 1 | 微信浏览器内点"分享卡片"→ 弹出全屏图片浮层 | 微信内打开链接测试 |
| 2 | 浮层有"长按保存图片"引导文字 | 肉眼检查 |
| 3 | 浮层有关闭按钮，可返回解读页 | 点击关闭 |
| 4 | Chrome/Safari 保持原 Web Share API 逻辑 | 浏览器测试 |
| 5 | 浮层有弹入/弹出动画 | 肉眼检查 |
| 6 | `npm run build` 无错误 | 构建验证 |

---

## 五、不改动的部分

- ❌ Canvas 生成的卡片设计（shareImage.js）——不改动
- ❌ 解读页其他逻辑 ——不改动
- ❌ 历史页 ——不改动
- ❌ 首页 ——不改动
