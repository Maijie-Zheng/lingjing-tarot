import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import StarBackground from './components/StarBackground'
import HomePage from './pages/HomePage'
import AskPage from './pages/AskPage'
import ShufflePage from './pages/ShufflePage'
import ReadingPage from './pages/ReadingPage'
import HistoryPage from './pages/HistoryPage'

/**
 * 页面过渡动画配置
 * slideLeft：进入下一页（如 首页→输入页）
 * slideRight：返回上一页（如 解读页→洗牌页）
 */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut',
}

/**
 * 包装器：给每个页面加上 fade+slide 过渡
 */
function PageWrapper({ children }) {
  return (
    <motion.div
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

/**
 * App 根组件
 * 星空背景全局显示，页面内容覆盖在上层
 * AnimatePresence 实现页面间过渡动画
 */
export default function App() {
  const location = useLocation()

  return (
    <>
      {/* 全局星空背景 */}
      <StarBackground />

      {/* 页面路由 —— 内容层在背景之上 */}
      <div className="relative page-container" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/ask" element={<PageWrapper><AskPage /></PageWrapper>} />
            <Route path="/shuffle" element={<PageWrapper><ShufflePage /></PageWrapper>} />
            <Route path="/reading" element={<PageWrapper><ReadingPage /></PageWrapper>} />
            <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}
