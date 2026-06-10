import { useMemo, useState, useCallback } from 'react';
import data from '../data/questions.json';

const QUOTA = [['love', 2], ['career', 1], ['self', 1], ['daily', 1]];

/**
 * 洗牌函数 —— Fisher-Yates
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
 * 检查问题是否匹配当前时段
 * @param {Object} q - 问题对象
 * @param {Date} now - 当前时间
 * @returns {boolean}
 */
const matchesNow = (q, now) => {
  if (!q.when) return true;
  if (q.when.hours) {
    const h = now.getHours();
    const [a, b] = q.when.hours;
    if (!(h >= a && h < b)) return false;
  }
  if (q.when.weekday && !q.when.weekday.includes(now.getDay())) return false;
  return true;
};

/**
 * 执行一次抽题：从各分类队列中按配额取题
 * 返回新 batch 和新队列（不可变更新）
 */
function draw(queues, now) {
  const q = { ...queues };
  const batch = [];
  for (const [cat, count] of QUOTA) {
    for (let i = 0; i < count; i++) {
      let pool = q[cat];
      // 队列耗尽 → 重新洗牌
      if (pool.length === 0) {
        pool = shuffle(data.questions.filter((x) => x.cat === cat));
      }
      // 机动位（daily）：优先取时段匹配的第一条，否则取无 when 的通用题
      let idx = 0;
      if (cat === 'daily') {
        idx = pool.findIndex((x) => matchesNow(x, now));
        if (idx === -1) idx = pool.findIndex((x) => !x.when);
        if (idx === -1) idx = 0;
      }
      batch.push(pool[idx]);
      // 从队列中移除已取题
      q[cat] = pool.filter((_, i2) => i2 !== idx);
    }
  }
  return { batch, queues: q };
}

/**
 * 预设问题出题 Hook
 *
 * 每批固定 5 条（感情 2 + 事业 1 + 自我 1 + 日常 1）
 * 各分类洗牌队列保证池子耗尽前不出重复
 * 日常机动位根据时段/星期匹配
 *
 * @returns {{ batch: Array, next: Function }}
 */
export default function useQuestionBatch() {
  // 初始化各分类洗牌队列（仅首次渲染计算）
  const initial = useMemo(() => {
    const pools = {};
    for (const [cat] of QUOTA) {
      pools[cat] = shuffle(data.questions.filter((q) => q.cat === cat));
    }
    return pools;
  }, []);

  const [queues, setQueues] = useState(initial);
  const [batch, setBatch] = useState(() => draw(initial, new Date()).batch);

  // 「换一批」
  const next = useCallback(() => {
    const { batch: b, queues: q } = draw(queues, new Date());
    setQueues(q);
    setBatch(b);
  }, [queues]);

  return { batch, next };
}
