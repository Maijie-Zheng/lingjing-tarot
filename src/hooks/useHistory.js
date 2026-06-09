import { useState, useCallback, useEffect } from 'react'
import { getReadings, deleteReading, clearAllReadings } from '../utils/storage'

/**
 * 历史记录 Hook
 * 提供增删查清空操作，响应式更新
 */
export default function useHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // 初始化：从 localStorage 加载
  useEffect(() => {
    setRecords(getReadings())
    setLoading(false)
  }, [])

  // 刷新列表
  const refresh = useCallback(() => {
    setRecords(getReadings())
  }, [])

  // 删除单条
  const remove = useCallback((id) => {
    deleteReading(id)
    refresh()
  }, [refresh])

  // 清空全部
  const clearAll = useCallback(() => {
    clearAllReadings()
    refresh()
  }, [refresh])

  return {
    records,
    loading,
    isEmpty: records.length === 0,
    refresh,
    remove,
    clearAll,
  }
}
