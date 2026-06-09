# P0-1 · 真实塔罗牌图片 — 规格说明

> 状态：📝 待确认 | 日期：2026/06/09 | 属于：第二阶段 → 视觉升级

---

## 一、现状

| 维度 | 当前状态 |
|------|---------|
| 牌面显示 | 🃏 emoji + 文字（牌名 + 英文名） |
| 牌背显示 | CSS 渐变 + 金色星星图案 |
| 图片资源 | `public/cards/` **目录不存在**——没有任何牌面图片 |
| 用户感受 | "塔罗牌全都一样，看不出是哪张牌" |

### 当前牌面渲染代码（TarotCard.jsx 第 72-82 行）

```jsx
// 牌面：渐变背景 + emoji + 文字
<div style={{ background: 'linear-gradient(135deg, #1e1050, #1a0a2e)' }}>
  <span>🃏</span>
  <span>{card.name}</span>
  <span>{card.nameEn}</span>
</div>
```

---

## 二、目标

将 22 张大阿尔卡纳的牌面从 emoji 占位符替换为**韦特塔罗（Rider-Waite-Smith）真实牌面图**。

### 为什么选韦特塔罗？

- 全球最通用的塔罗牌，画风精美细腻
- 每张牌有丰富的象征意象，用户看了能产生联想
- 图片在维基百科上以公共领域发布，可合法使用

---

## 三、技术方案

### 3.1 资源准备

| 事项 | 说明 |
|------|------|
| 图片来源 | Wikipedia Commons（公共领域） |
| 数量 | 22 张（大阿尔卡纳 0~21） |
| 格式 | JPG |
| 存放路径 | `public/cards/{id}.jpg`（如 `00.jpg` = 愚者，`21.jpg` = 世界） |
| 文件大小 | 每张约 50-150KB |

### 3.2 代码改动

**文件 1：`src/data/tarotCards.js`**

每个牌对象新增 `image` 字段：

```javascript
{ id: 0, name: '愚者', image: '/cards/00.jpg', ... }
```

**文件 2：`src/components/TarotCard.jsx`**

正面渲染从 emoji 改为真实图片：

```jsx
// 牌面（当前）
<div style={{ background: '...' }}>
  <span>🃏</span>
  ...
</div>

// 牌面（改后）
<div style={{ background: '...' }}>
  <img src={card.image} alt={card.name} />
  <span>{card.name}</span>
  ...
</div>
```

图片需要 `object-fit: cover` 填满牌面区域，保留圆角。

**文件 3：`public/cards/`**（新建目录）

下载 22 张图片到此目录。

### 3.3 命名对照

| id | 文件名 | 牌名 | 英文名 |
|----|--------|------|--------|
| 0 | 00.jpg | 愚者 | The Fool |
| 1 | 01.jpg | 魔术师 | The Magician |
| 2 | 02.jpg | 女祭司 | The High Priestess |
| 3 | 03.jpg | 皇后 | The Empress |
| 4 | 04.jpg | 皇帝 | The Emperor |
| 5 | 05.jpg | 教皇 | The Hierophant |
| 6 | 06.jpg | 恋人 | The Lovers |
| 7 | 07.jpg | 战车 | The Chariot |
| 8 | 08.jpg | 力量 | Strength |
| 9 | 09.jpg | 隐士 | The Hermit |
| 10 | 10.jpg | 命运之轮 | Wheel of Fortune |
| 11 | 11.jpg | 正义 | Justice |
| 12 | 12.jpg | 倒吊人 | The Hanged Man |
| 13 | 13.jpg | 死神 | Death |
| 14 | 14.jpg | 节制 | Temperance |
| 15 | 15.jpg | 恶魔 | The Devil |
| 16 | 16.jpg | 高塔 | The Tower |
| 17 | 17.jpg | 星星 | The Star |
| 18 | 18.jpg | 月亮 | The Moon |
| 19 | 19.jpg | 太阳 | The Sun |
| 20 | 20.jpg | 审判 | Judgement |
| 21 | 21.jpg | 世界 | The World |

---

## 四、验收标准

| # | 标准 | 验证方式 |
|---|------|---------|
| 1 | 22 张图片成功下载到 `public/cards/` | 检查文件是否存在 |
| 2 | 首页中央浮动牌显示真实牌面图 | `npm run dev` → 打开首页 |
| 3 | 选牌阶段每张牌背翻转后显示真实牌面图 | 完整走一遍抽牌流程 |
| 4 | 解读页三张牌缩略图显示真实牌面 | 查看解读结果页 |
| 5 | 图片加载不慢（每张 < 150KB） | 检查文件大小 |
| 6 | 牌面图片不超出牌框，圆角正确 | 肉眼检查 |

---

## 五、不改动的部分

- ❌ 牌背设计（CSS 绘制）——保持不变
- ❌ 牌面尺寸和圆角 ——保持不变
- ❌ 选中发光效果 ——保持不变
- ❌ 其他页面逻辑 ——保持不变
