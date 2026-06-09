# P0-3 · 抽牌体验重做 — 开发记录

> 状态：✅ 已完成 | 日期：2026/06/09 | Git：phase2-polish

---

## 一、实际改动

| 文件 | 改动 | 说明 |
|------|------|------|
| `src/components/CardCarousel.jsx` | 🆕 新建（~150 行） | 水平滚动牌轮播组件 |
| `src/pages/ShufflePage.jsx` | 🔧 重写（~185 行） | 简化状态机 + 集成轮播 |
| `src/index.css` | ➕ 加 2 个工具类 | `.no-scrollbar` + `.carousel-snap` |

### CardCarousel.jsx 设计

```
Props：cards, selectedCards, onSelect, maxSelect

功能：
  - CSS scroll-snap 水平吸附滚动
  - 监听 scroll 事件→计算中心牌 index
  - 中心牌 scale(1.0)，两侧递减（0.78 / 0.6 / 0.45）
  - 左右 50% padding 让首尾牌也能滑到中心
  - 左右渐变遮罩（#0d0221 → transparent）
  - 点击非中心牌 → smooth scroll 到该牌
  - 点击中心牌 → 3D rotateY 翻转 → onSelect 回调
  - 已选牌显示真实牌面（半透明）不可再点
  - 满 3 张后不可再选
```

### ShufflePage.jsx 改动细节

```
改动前（3 阶段）：
  shuffle (2.5s) → select (3×3 grid) → reveal (逐张翻) → navigate

改动后（2 阶段）：
  shuffle (1.5s) → select (CardCarousel + 底部已选区)
  选满 3 张 → 1s 停顿 → navigate

删除内容：
  - POSITIONS 中的 desc 字段（不再需要）
  - gridCards（不再预抽 9 张）
  - revealedCount 状态
  - handleSelectCard 中的取消逻辑（轮播不支持取消）
  - handleConfirm 函数
  - 3×3 grid 渲染代码
  - reveal 阶段全部代码（翻牌融入轮播中）

新增内容：
  - CardCarousel 集成（22 张全量牌）
  - 底部 3 槽已选区（带 emoji 占位 + spring 入场动画）
  - justFlipped 状态（用于触发飞入动画）
```

---

## 二、验证结果

| # | 验收标准 | 结果 |
|---|---------|------|
| 1 | 22 张牌水平滚动，吸附中心 | ✅ CSS scroll-snap |
| 2 | 中心牌最大（lg），两侧递减 | ✅ scale: 1.0 → 0.78 → 0.6 → 0.45 |
| 3 | 点击中心牌 → 3D 翻转 → onSelect | ✅ rotateY 0→180 |
| 4 | 已选牌保持牌面朝上且不可再选 | ✅ 半透明 + pointer-events:none |
| 5 | 底部显示已选牌 + 位置标签 | ✅ spring 入场动画 |
| 6 | 选满 3 张 → 1s 后自动跳转 | ✅ setTimeout 1s |
| 7 | 左右边缘渐变遮罩 | ✅ linear-gradient 40px |
| 8 | 隐藏滚动条 | ✅ .no-scrollbar |
| 9 | `npm run build` 无错误 | ✅ |

---

## 三、遇到的问题

无重大错误。一次构建通过。

---

## 四、Git 提交

```
分支：phase2-polish
提交：P0-3：抽牌体验重做——滚动轮播+中心聚焦+选即翻+底部已选区
```

---

## 五、Spec 对照

| Spec 要求 | 实现情况 |
|-----------|---------|
| 22 张牌水平滚动轮播 | ✅ |
| CSS scroll-snap 吸附 | ✅ |
| 中心放大，两侧渐小 | ✅ |
| 点击中心牌 → 3D 翻转 | ✅ |
| 选一张翻一张 | ✅ |
| 已选牌不可再选 | ✅ |
| 底部已选区 + 位置标签 | ✅ |
| 选满 3 张 → 1s 跳转 | ✅ |
| 左右渐变遮罩 | ✅ |
| 隐藏滚动条 | ✅ |
| 新建 CardCarousel.jsx | ✅ |
| 重写 ShufflePage.jsx | ✅ |
| 不改 TarotCard | ✅ |
| 不改解读页 | ✅ |
