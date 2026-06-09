import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AskPage from './pages/AskPage'
import ShufflePage from './pages/ShufflePage'
import ReadingPage from './pages/ReadingPage'
import HistoryPage from './pages/HistoryPage'

/**
 * App 根组件
 * 路由配置 + 全局布局（星空背景在后续轮次加入）
 */
export default function App() {
  return (
    <div className="page-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/shuffle" element={<ShufflePage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  )
}
