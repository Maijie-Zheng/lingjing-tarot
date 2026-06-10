import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import StarField from './components/StarField'
import LandingPage from './pages/LandingPage'
import AskPage from './pages/AskPage'
import ShufflePage from './pages/ShufflePage'
import ReadingPage from './pages/ReadingPage'
import MeditatePage from './pages/MeditatePage'
import DrawPage from './pages/DrawPage'
import HistoryPage from './pages/HistoryPage'

/**
 * 页面过渡动画配置
 */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
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
 * - MotionConfig 全局尊重系统的「减少动态效果」
 * - StarField 全局粒子星空背景
 * - AnimatePresence 实现页面间过渡动画
 */
export default function App() {
  const location = useLocation()

  return (
    <MotionConfig reducedMotion="user">
      {/* 全局粒子星空背景 */}
      <StarField className="fixed inset-0" />

      {/* 页面路由 —— 内容层在背景之上 */}
      <div className="relative page-container" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/ask" element={<PageWrapper><AskPage /></PageWrapper>} />
            <Route path="/meditate" element={<PageWrapper><MeditatePage /></PageWrapper>} />
            <Route path="/shuffle" element={<PageWrapper><ShufflePage /></PageWrapper>} />
            <Route path="/draw" element={<PageWrapper><DrawPage /></PageWrapper>} />
            <Route path="/reading" element={<PageWrapper><ReadingPage /></PageWrapper>} />
            <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
