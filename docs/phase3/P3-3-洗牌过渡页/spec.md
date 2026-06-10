# P3-3 洗牌过渡页 · 规格说明

> 状态：进行中 | 日期：2026-06-10

---

## 目标

把洗牌页从「5 张牌 wobble + 进度条」升级为「4 张牌真实交叠洗牌 + 收束震动 + 两段式文案」的过渡页。约 2.5 秒播完一轮自动进选牌页。同时抽出可复用的 `CardBack` 组件。

**关键副作用**：旧 ShufflePage 内置的「选牌」阶段需要搬迁到新 DrawPage，否则用户洗完牌后无路可走。

---

## 用户提供的设计提示词

v0.4 设计文档，核心约束：

1. 「洗」的动作真的发生——交叠、错位、旋转，不是两张静止牌配进度条
2. **去掉进度条**——动作和文案本身就是进度
3. 约 2.5 秒跑完一轮，收束轻微一震，自动进抽牌
4. **只保留顶部问题卡，无任何按钮**
5. 文案两段式：过程「灵境正在为你洗牌…」→ 收束瞬间「牌阵已成」
6. 牌背抽成可复用 `CardBack` 组件

---

## 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `tailwind.config.js` | 追加 | 8 个 keyframes（shuf0-3/settle/shimmer/textfade）+ 8 个动画 |
| `src/components/CardBack.jsx` | 新建 | 可复用牌背组件（后续抽牌页也用） |
| `src/pages/ShufflePage.jsx` | 重写 | 纯洗牌动画过渡页，2.5s 自动进 DrawPage |
| `src/pages/DrawPage.jsx` | 新建 | 选牌页（搬迁旧 ShufflePage 的 select 阶段） |
| `src/App.jsx` | 微改 | 新增 `/draw` 路由 |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/pages/MeditatePage.jsx` | 仍跳转 `/shuffle?q=`，不感知下游变化 |
| `src/components/CardCarousel.jsx` | 复用，DrawPage 引用 |
| `src/components/TarotCard.jsx` | 复用 |
| `src/components/StarField.jsx` | 复用 |

---

## 一、路由适配

设计文档路由 `/draw`、`location.state?.question`。项目实际：
- 问题通过 URL 参数 `?q=` 传递
- 选牌后跳转 `/reading` 通过 `state: { question, cards }`

适配后链路：
```
AskPage → /meditate?q=... → MeditatePage(5s) → /shuffle?q=...
→ ShufflePage(2.5s) → /draw?q=... → DrawPage(选牌) → /reading
```

全部 replace: true，过渡页不进历史栈。

---

## 二、tailwind.config.js 追加

8 组新 keyframes，均在已有基础上追加：

| keyframe | 作用 | 周期 |
|----------|------|------|
| shuf0 | 最上层牌：左右摇 + 旋转 | 2.5s |
| shuf1 | 第二层牌：反向位移 | 2.5s |
| shuf2 | 第三层牌：斜向位移 | 2.5s |
| shuf3 | 底层牌：旋转为主 | 2.5s |
| settle | 整体收束：放大→回弹 | 2.5s（72%开始） |
| shimmer | 顶牌星纹流光 | 2s |
| textfade | 文案明暗呼吸 | 2s |

动画全部非 infinite——Tailwind 配置里写 infinite 的定义，使用时通过 `[animation-iteration-count:1]` 覆盖为只播一轮。

---

## 三、CardBack 组件

- 深蓝渐变底 + 金色细线星盘（双圆 + 交叉线 + 四角星点）
- 中央八角星可选流光（`showStar` prop）
- 尺寸由父组件 className 控制（默认无固定尺寸）
- 纯 SVG 内绘制，无外部图片依赖

---

## 四、ShufflePage 重写

### 4.1 背景
与冥想页同一档暗度：`#1A1336 → #0D0A1E → #08060F`

### 4.2 布局
- 顶部：仅「你在问」问题卡，无按钮
- 中央：文案（星形 SVG + 文字）+ 牌堆

### 4.3 文案两段式
- 0–2050ms：「灵境正在为你洗牌…」
- 2050ms–2500ms：「牌阵已成」
- 文案前星形为内联 SVG，非 emoji
- `animate-textfade` 加 `[animation-iteration-count:1]`

### 4.4 牌堆
- 4 张 CardBack 叠放，各自独立洗牌动画（shuf0-3）
- 最上层 `showStar` 流光
- 外层容器 `animate-settle` 做整体收束
- 居中策略：wrapper `ml-[-39px] mt-[-58px]`（负 margin 居中，不占用 transform）
- 所有动画 `[animation-iteration-count:1]`

### 4.5 自动跳转
- 2050ms：`setSettled(true)` 切文案
- 2500ms：`navigate('/draw?q=...', { replace: true })`

---

## 五、DrawPage 新建（搬迁旧选牌逻辑）

从旧 ShufflePage 搬迁 select 阶段代码，去掉了 shuffle stage 和 meditate stage：

- 直接进入选牌模式（无 stage 状态机）
- 保留 CardCarousel + 3 卡槽 + 星点汇聚 + 白屏过渡
- 保留「换问题」Link 回 `/ask`
- 保留「你在问」磨砂玻璃卡片
- 读取 `?q=` 参数
- 选满 3 张 → 星光汇聚 → 白屏过渡 → navigate('/reading', { state })

注意：DrawPage 暂未做 Phase 3 视觉升级（emoji、进度文案等），等后续设计文档。

---

## 验证标准

- [ ] 4 张牌交叠错位旋转，约 2.5 秒，无 loading 进度条
- [ ] 收束帧有轻微「放大→回弹」震动
- [ ] 最上层牌背金色星纹有流光
- [ ] 文案两段式切换：过程 →「牌阵已成」
- [ ] 文案前星形为 SVG 非 emoji
- [ ] 本页只有问题卡，无任何按钮
- [ ] 2.5 秒后自动进 /draw
- [ ] 洗牌页不进历史栈（replace）
- [ ] CardBack 组件可复用（接受 showStar + className）
- [ ] DrawPage 选牌功能完整可用
- [ ] `npm run build` 零报错
