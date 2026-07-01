/**
 * localStorage 读写封装
 * key: "lingjing_readings"
 * 不做后端、不做数据库——所有数据只存在用户手机里
 */

import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'lingjing_readings'
const MAX_RECORDS = 50 // 最多存 50 条，防止 localStorage 爆满

/**
 * 读取所有历史记录
 * @returns {Array} 按时间倒序排列
 */
export function getReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    // 按时间倒序（最新在前）
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch {
    return []
  }
}

/**
 * 读取单条记录
 * @param {string} id
 * @returns {object|null}
 */
export function getReadingById(id) {
  const all = getReadings()
  return all.find((r) => r.id === id) || null
}

/**
 * 保存一条新记录
 * @param {object} reading - { question, cards, reading, suggestions }
 * @returns {object} 保存后的完整记录（含 id + createdAt）
 */
export function saveReading({ question, cards, reading, suggestions = [] }) {
  const record = {
    id: uuidv4(),
    question,
    cards,
    reading,
    suggestions,
    createdAt: new Date().toISOString(),
  }

  const all = getReadings()
  all.unshift(record) // 最新插入到最前面

  // 限制数量，删除最旧的
  const trimmed = all.slice(0, MAX_RECORDS)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return record
  } catch {
    // localStorage 满了：尝试删一半再存
    const half = all.slice(0, Math.floor(MAX_RECORDS / 2))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(half))
    } catch {
      // 彻底失败，清除所有
      localStorage.removeItem(STORAGE_KEY)
    }
    return record
  }
}

/**
 * 删除单条记录
 * @param {string} id
 */
export function deleteReading(id) {
  const all = getReadings()
  const filtered = all.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * 清空所有记录
 */
export function clearAllReadings() {
  localStorage.removeItem(STORAGE_KEY)
}

// ===== 用户反馈 =====

const FEEDBACK_KEY = 'lingjing_feedback'

/**
 * 保存反馈
 * @param {string} readingId - 关联的解读记录 ID
 * @param {object} feedback - { sentiment: 'touched' | 'neutral', note: string | null }
 */
export function saveFeedback(readingId, { sentiment, note = null }) {
  const record = {
    readingId,
    sentiment,
    note,
    createdAt: new Date().toISOString(),
  }

  try {
    const raw = localStorage.getItem(FEEDBACK_KEY)
    const all = raw ? JSON.parse(raw) : []
    all.push(record)
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all))
    return record
  } catch {
    return null
  }
}

/**
 * 获取所有反馈
 * @returns {Array}
 */
export function getAllFeedback() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}
