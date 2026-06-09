import { Routes, Route } from 'react-router-dom'
import StarBackground from './components/StarBackground'
import HomePage from './pages/HomePage'
import AskPage from './pages/AskPage'
import ShufflePage from './pages/ShufflePage'
import ReadingPage from './pages/ReadingPage'
import HistoryPage from './pages/HistoryPage'

/**
 * App 根组件
 * 星空背景全局显示，页面内容覆盖在上层
 */
export default function App() {
  return (
    <>
      {/* 全局星空背景 */}
      <StarBackground />

      {/* 页面路由 —— 内容层在背景之上 */}
      <div className="relative page-container" style={{ zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/shuffle" element={<ShufflePage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </>
  )
}
