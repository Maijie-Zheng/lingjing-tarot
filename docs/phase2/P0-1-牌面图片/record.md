# P0-1 · 真实塔罗牌图片 — 开发记录

> 状态：✅ 已完成 | 日期：2026/06/09 | Git：phase2-polish

---

## 一、实际改动

### 资源文件

| 操作 | 文件 | 说明 |
|------|------|------|
| 🆕 新增 | `public/cards/00.jpg` ~ `21.jpg` | 22 张韦特塔罗（RWS）牌面图，来源 Sacred-Texts.com 公共领域档案 |
| 📦 总大小 | 748 KB | 平均每张 ~34KB，加载快速 |

### 代码文件

| 文件 | 改动 | 改动行数 |
|------|------|---------|
| `src/data/tarotCards.js` | 每张牌新增 `image` 字段，指向 `/cards/{id}.jpg` | 22 行 |
| `src/components/TarotCard.jsx` | 牌面从 emoji 改为 `<img>` + 底部渐变叠加牌名 | ~20 行 |

### TarotCard.jsx 改动细节

```
改动前：背景渐变 + 🃏 emoji + card.name + card.nameEn
改动后：
  - <img> 填满牌面 (object-fit: cover)
  - 底部渐变遮罩 (transparent → rgba(0,0,0,0.85))
  - 叠加中文牌名 (brand-gold, 13px/10px)
  - 逆位显示"逆位"标签，正位显示英文名
```

---

## 二、验证结果

| # | 验收标准 | 结果 |
|---|---------|------|
| 1 | 22 张图片存在 `public/cards/` | ✅ |
| 2 | `npm run build` 无错误 | ✅ |
| 3 | 构建产物 `dist/cards/` 包含 22 张图 | ✅ |
| 4 | 图片平均大小 < 50KB | ✅ 平均 34KB |

---

## 三、遇到的问题

| 问题 | 解决方案 |
|------|---------|
| Wikipedia Commons 限流 429 | 换用 Sacred-Texts.com 作为图片来源 |
| Wikimedia 连接超时（国内被墙） | 开启 VPN 后使用 curl 批量下载 |
| sacred-texts.com 需要 Referer | 添加完整浏览器请求头（UA + Referer + Accept） |

---

## 四、Git 提交

```
分支：phase2-polish
提交：P0-1：下载22张韦特塔罗牌面图，TarotCard显示真实牌面
```

---

## 五、Spec 对照

| Spec 要求 | 实现情况 |
|-----------|---------|
| 下载 22 张 RWS 图片到 `public/cards/` | ✅ |
| 每张牌命名 `{id}.jpg`（00~21） | ✅ |
| `tarotCards.js` 新增 `image` 字段 | ✅ |
| `TarotCard.jsx` 正面用 `<img>` 替代 emoji | ✅ |
| 图片 `object-fit: cover` 保持圆角 | ✅ |
| 牌背保持不变 | ✅ |
| 选中发光效果不变 | ✅ |
