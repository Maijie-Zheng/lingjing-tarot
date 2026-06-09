/**
 * 22 张大阿尔卡纳（Major Arcana）数据
 * MVP 只使用这 22 张，不包含 56 张小阿尔卡纳
 */
const tarotCards = [
  { id: 0,  name: '愚者',     nameEn: 'The Fool',           keywords: '新的开始、冒险、天真',         reversedKeywords: '鲁莽、轻率、不思后果' },
  { id: 1,  name: '魔术师',   nameEn: 'The Magician',       keywords: '创造力、能力、资源就绪',       reversedKeywords: '欺骗、能力不足、计划受阻' },
  { id: 2,  name: '女祭司',   nameEn: 'The High Priestess', keywords: '直觉、潜意识、内在智慧',       reversedKeywords: '忽视直觉、隐藏信息' },
  { id: 3,  name: '皇后',     nameEn: 'The Empress',        keywords: '丰饶、滋养、创造力',           reversedKeywords: '依赖、匮乏、创造力阻塞' },
  { id: 4,  name: '皇帝',     nameEn: 'The Emperor',        keywords: '权威、结构、稳定',             reversedKeywords: '专制、僵化、失控' },
  { id: 5,  name: '教皇',     nameEn: 'The Hierophant',     keywords: '传统、指导、精神导师',         reversedKeywords: '反叛、非传统、僵化教条' },
  { id: 6,  name: '恋人',     nameEn: 'The Lovers',         keywords: '爱情、和谐、重要选择',         reversedKeywords: '冲突、分离、错误选择' },
  { id: 7,  name: '战车',     nameEn: 'The Chariot',        keywords: '意志力、胜利、前进',           reversedKeywords: '失控、失败、方向错误' },
  { id: 8,  name: '力量',     nameEn: 'Strength',           keywords: '勇气、内在力量、耐心',         reversedKeywords: '自我怀疑、脆弱、失控' },
  { id: 9,  name: '隐士',     nameEn: 'The Hermit',         keywords: '内省、孤独、寻求真理',         reversedKeywords: '孤立、逃避、拒绝建议' },
  { id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune',   keywords: '命运转折、好运、周期',         reversedKeywords: '厄运、失控、抗拒改变' },
  { id: 11, name: '正义',     nameEn: 'Justice',            keywords: '公平、真相、后果',             reversedKeywords: '不公、逃避责任、偏见' },
  { id: 12, name: '倒吊人',   nameEn: 'The Hanged Man',     keywords: '放手、新视角、牺牲',           reversedKeywords: '固执、无谓牺牲、停滞' },
  { id: 13, name: '死神',     nameEn: 'Death',              keywords: '结束、转变、重生',             reversedKeywords: '抗拒改变、停滞、恐惧转变' },
  { id: 14, name: '节制',     nameEn: 'Temperance',         keywords: '平衡、和谐、节制',             reversedKeywords: '失衡、过度、缺乏调和' },
  { id: 15, name: '恶魔',     nameEn: 'The Devil',          keywords: '束缚、欲望、物质主义',         reversedKeywords: '挣脱、觉醒、打破束缚' },
  { id: 16, name: '高塔',     nameEn: 'The Tower',          keywords: '崩塌、觉醒、突变',             reversedKeywords: '逃避改变、延缓崩塌、恐惧' },
  { id: 17, name: '星星',     nameEn: 'The Star',           keywords: '希望、疗愈、灵感',             reversedKeywords: '绝望、失去信心、迷失' },
  { id: 18, name: '月亮',     nameEn: 'The Moon',           keywords: '恐惧、幻觉、潜意识',           reversedKeywords: '真相浮现、克服恐惧、清醒' },
  { id: 19, name: '太阳',     nameEn: 'The Sun',            keywords: '快乐、成功、活力',             reversedKeywords: '暂时受挫、延迟的快乐、信心不足' },
  { id: 20, name: '审判',     nameEn: 'Judgement',          keywords: '觉醒、重生、召唤',             reversedKeywords: '自我怀疑、逃避召唤、抗拒反思' },
  { id: 21, name: '世界',     nameEn: 'The World',          keywords: '完成、圆满、成就',             reversedKeywords: '未完成、延迟、缺少闭环' },
]

export default tarotCards

/** 从 22 张牌中随机抽取 n 张（不重复） */
export function drawRandomCards(n = 9) {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
