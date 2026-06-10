import MAJOR_ARCANA from '../data/tarotCards';

/**
 * Fisher-Yates 洗牌
 */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * 构建一副已绑定真身的牌堆（22 张，乱序，每张独立 50% 正/逆位）
 *
 * 每次进入抽牌页调用一次。返回的数组顺序 = 环形轮播里牌背的排列顺序。
 * 每张牌背绑定一个确定的身份，用户点哪张就抽到那张的真身。
 */
export function buildDeck() {
  return shuffle(MAJOR_ARCANA).map((card) => ({
    ...card,                         // 牌的真实身份（id / name / nameEn / image / keywords 等）
    reversed: Math.random() < 0.5,   // 独立 50% 正/逆位
  }));
}

/**
 * 三个牌位的元数据
 */
export const POSITIONS = [
  { key: 'past',    label: '过去 · 溯源', icon: 'Moon' },
  { key: 'present', label: '现在 · 当下', icon: 'Sparkles' },
  { key: 'future',  label: '未来 · 趋势', icon: 'Sun' },
];
