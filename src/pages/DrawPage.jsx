import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Sparkles, Sun } from 'lucide-react';
import TarotCard from '../components/TarotCard';
import CardCarousel from '../components/CardCarousel';
import { buildDeck, POSITIONS } from '../lib/drawDeck';

// 位置图标映射
const POS_ICONS = { Moon, Sparkles, Sun };

// 进度文案（无 emoji——星形提示用内联 SVG 星芒）
const PROGRESS_TEXTS = [
  '指尖轻滑，凭心指引，选出属于你的三张牌',
  '第一张已感应，再选「现在 · 当下」',
  '第二张已感应，最后选「未来 · 趋势」',
];

/** 内联 8 角星芒 SVG（用于进度文案前缀，替代 emoji） */
function StarSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 64 64" className="inline-block flex-shrink-0" aria-hidden>
      <path
        d="M32,6 C33,28 36,31 58,32 C36,33 33,36 32,58 C31,36 28,33 6,32 C28,31 31,28 32,6 Z"
        fill="#E6C982"
      />
    </svg>
  );
}

/**
 * 抽牌页 —— P3-4 升级
 *
 * 三处改动：
 * 1. 去 emoji → lucide 金色细线图标 + 星芒 SVG
 * 2. 真随机洗牌 + 50% 正逆位绑定 + 牌背绑定真身（点哪张抽哪张）
 * 3. embla 环形无限循环轮播（22 张首尾相接）
 *
 * 保留全部既有视觉：景深缩放、星芒闪烁、3D 翻转、飞入卡槽、白屏过渡。
 */
export default function DrawPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const question = searchParams.get('q') || '未提供问题';

  // 进入页面只构建一次牌堆（Fisher–Yates 乱序 + 每张独立 50% 正逆位）
  const [deck] = useState(() => buildDeck());

  // remaining: 环中剩余牌的 deck 索引（初始全部 0-21，抽走一张就移除一个）
  const [remaining, setRemaining] = useState(() => deck.map((_, i) => i));

  // picks: 已抽到的牌（deck[deckIndex] 对象，按位置顺序）
  const [picks, setPicks] = useState([]);

  const [convergeSlot, setConvergeSlot] = useState(null); // 星点汇聚触发槽索引
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ===== 用户点中轮播中央那张 → 拿到 deck[deckIndex] 绑定的真身 =====
  const pickCard = useCallback(
    (deckIndex) => {
      if (picks.length >= 3) return;
      const card = deck[deckIndex];
      if (!card) return;
      const slotIdx = picks.length; // 当前是第几张（0/1/2）
      setPicks((prev) => [...prev, card]);
      setRemaining((prev) => prev.filter((i) => i !== deckIndex));
      // 触发星点汇聚动画
      setConvergeSlot(slotIdx);
      setTimeout(() => setConvergeSlot(null), 500);
    },
    [picks.length, deck],
  );

  // ===== 选满 3 张 → 星光过渡 → 跳转解读页 =====
  useEffect(() => {
    if (picks.length < 3) return;
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate('/reading-loading', {
          state: {
            question,
            picks: picks.map((card, i) => ({
              ...card,
              position: POSITIONS[i],
            })),
          },
        });
      }, 600);
    }, 800);
    return () => clearTimeout(timer);
  }, [picks.length, picks, question, navigate]);

  // ===== 槽位配置（结合 picks + POSITIONS）=====
  const slotConfigs = POSITIONS.map((pos, i) => {
    const card = picks[i] ?? null;
    const isConverging = convergeSlot === i;
    const IconComp = POS_ICONS[pos.icon];
    return { ...pos, card, index: i, isConverging, IconComp };
  });

  return (
    <div className="flex flex-col min-h-screen pt-6 gap-4 px-page relative">
      {/* ===== 顶栏 ===== */}
      <div className="flex items-center justify-between">
        <Link
          to="/ask"
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'rgba(201,169,110,0.7)' }}
          onMouseEnter={(e) => (e.target.style.color = '#c9a96e')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(201,169,110,0.7)')}
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
          换问题
        </Link>
      </div>

      {/* ===== "你在问" 磨砂玻璃卡片 ===== */}
      <motion.div
        className="rounded-card px-4 py-3 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-white/30 text-xs mb-1">你在问</p>
        <p className="text-white/80 text-sm leading-relaxed">{question}</p>
      </motion.div>

      {/* ===== 滚动选牌 ===== */}
      <motion.div
        className="flex-1 flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 进度引导文字 */}
        <div className="text-center min-h-[40px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {picks.length < 3 ? (
              <motion.p
                key={`progress-${picks.length}`}
                className="text-white/60 text-sm flex items-center justify-center gap-1.5"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {picks.length > 0 && <StarSpark />}
                {PROGRESS_TEXTS[picks.length]}
              </motion.p>
            ) : (
              <motion.p
                key="complete"
                className="text-brand-gold text-sm flex items-center justify-center gap-1.5"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StarSpark />
                三张已齐聚，命运之牌已揭示...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* 牌轮播：ember 环形无限循环 + CardBack 绑定真身 */}
        <div className="flex-1 flex items-center -mx-page">
          <CardCarousel
            deck={deck}
            remaining={remaining}
            onSelect={pickCard}
            pickCount={picks.length}
            maxSelect={3}
          />
        </div>

        {/* 底部：已选卡槽 */}
        <div className="flex justify-center gap-3 pb-2">
          {slotConfigs.map((slot) => {
            const { card, label, index, isConverging, key, IconComp } = slot;
            const isFilled = !!card;

            return (
              <motion.div
                key={key}
                className="flex flex-col items-center gap-1.5"
                layout
              >
                {/* 卡槽 */}
                <motion.div
                  className="rounded-card flex items-center justify-center overflow-hidden relative"
                  style={{
                    width: 72,
                    height: 108,
                    background: isFilled ? 'transparent' : 'rgba(255,255,255,0.04)',
                    backdropFilter: isFilled ? 'none' : 'blur(8px)',
                    WebkitBackdropFilter: isFilled ? 'none' : 'blur(8px)',
                    border: isFilled
                      ? '1.5px solid rgba(201,169,110,0.45)'
                      : '1px dashed rgba(255,255,255,0.12)',
                    boxShadow: isFilled
                      ? '0 0 12px rgba(201,169,110,0.15), inset 0 1px 0 rgba(255,255,255,0.03)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                  }}
                >
                  {isFilled ? (
                    <motion.div
                      className="w-full h-full rounded-card overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                    >
                      <TarotCard card={card} fill />
                    </motion.div>
                  ) : (
                    <IconComp
                      size={28}
                      strokeWidth={1.6}
                      className="text-white/12"
                    />
                  )}

                  {/* 星点汇聚效果 */}
                  <AnimatePresence>
                    {isConverging && (
                      <>
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                          <motion.div
                            key={angle}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                              width: 4,
                              height: 4,
                              background: '#c9a96e',
                              boxShadow: '0 0 6px rgba(201,169,110,0.6)',
                            }}
                            initial={{
                              x: Math.cos((angle * Math.PI) / 180) * 45,
                              y: Math.sin((angle * Math.PI) / 180) * 55,
                              opacity: 0.9,
                              scale: 1,
                            }}
                            animate={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45, ease: 'easeIn' }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 位置标签 */}
                <span
                  className="text-xs transition-colors duration-300"
                  style={{
                    color: isFilled
                      ? 'rgba(201,169,110,0.8)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* 选满提示 */}
        <AnimatePresence>
          {picks.length === 3 && !isTransitioning && (
            <motion.p
              className="text-center text-brand-gold text-xs -mt-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              灵境正在解读...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ===== 星光汇聚 + 白屏过渡 ===== */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="white-flash"
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* 中心光点 */}
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                background: 'radial-gradient(circle, #fff, rgba(201,169,110,0.8))',
                boxShadow:
                  '0 0 40px rgba(201,169,110,0.6), 0 0 80px rgba(201,169,110,0.3)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0.5], opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* 全屏白光扩散 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.9), rgba(201,169,110,0.3))',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
