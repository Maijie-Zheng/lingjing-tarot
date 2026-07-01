import MAJOR_ARCANA from '../data/tarotCards';

/**
 * 安全随机整数 [0, max)
 * 使用 crypto.getRandomValues 替代 Math.random()，确保每次洗牌结果不可预测
 */
function secureRandom(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return Math.floor((array[0] / 0x100000000) * max);
}

/**
 * Fisher-Yates 洗牌（安全随机版）
 */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * 构建一副已绑定真身的牌堆（22 张，乱序，每张独立 50% 正/逆位）
 */
export function buildDeck() {
  return shuffle(MAJOR_ARCANA).map((card) => ({
    ...card,
    isReversed: secureRandom(2) === 0, // 安全随机 50% 正/逆位
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
