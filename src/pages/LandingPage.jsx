import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import OrbitalEmblem from '../components/OrbitalEmblem';
import GoldButton from '../components/GoldButton';

/**
 * 落地页 —— 灵境入口（Phase 3 视觉升级）
 *
 * 深空径向渐变背景 + 灵境之眼核心视觉 + 渐变金标题 + 错落进场动画
 * 全局 StarField 由 App.jsx 提供，本页只负责 bg-cosmos 径向渐变底层
 */

const up = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: 'easeOut', delay: 0.15 * i },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-cosmos relative min-h-[100dvh] overflow-hidden">
      {/* 历史记录入口 */}
      <button
        onClick={() => navigate('/history')}
        className="absolute right-[18px] top-[18px] z-20 flex items-center gap-1.5 text-[13px] text-gold-200/60 hover:text-gold-200/90 transition-colors"
      >
        <BookOpen size={16} strokeWidth={1.6} aria-hidden />
        历史记录
      </button>

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-7">
        {/* 核心视觉：灵境之眼 */}
        <motion.div variants={up} custom={0} initial="hidden" animate="show">
          <OrbitalEmblem />
        </motion.div>

        {/* 品牌标题：渐变金 + 宽字距 */}
        <motion.div
          variants={up}
          custom={1}
          initial="hidden"
          animate="show"
          className="text-gold-gradient animate-shine mt-[30px] pl-[14px] font-serif text-[32px] font-medium tracking-[14px]"
        >
          灵境
        </motion.div>

        {/* 副标题 */}
        <motion.p
          variants={up}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-3.5 text-[13.5px] tracking-wide text-white/50"
        >
          解锁灵境，让心事皆有回响
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          variants={up}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-[42px]"
        >
          <GoldButton icon={Sparkles} onClick={() => navigate('/ask')}>
            开启灵境
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
