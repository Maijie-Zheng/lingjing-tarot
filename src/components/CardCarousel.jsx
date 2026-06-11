import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import CardBack from './CardBack';
import TarotCard from './TarotCard';

const CARD_W = 140;   // 中心牌宽度
const CARD_H = 210;   // 中心牌高度
const GAP = 16;       // 牌间距
const SLOT_W = CARD_W + GAP; // 每槽位宽度（含间距）

/**
 * 环形无限循环牌轮播 —— P3-4 升级
 *
 * - embla-carousel-react { loop: true } 实现 22 张首尾相接无限滚动
 * - 每张 CardBack 绑定 deck 中的一个确定身份，点哪张抽哪张
 * - 保留全部既有视觉：景深缩放、星芒闪烁、3D 翻转、呼吸引导
 * - 点击非中心牌 → 滚动到该牌；点击中心牌 → 星芒 → 翻转 → onSelect(deckIndex)
 */
export default function CardCarousel({
  deck,          // 完整牌堆（22 张，含正逆位绑定）
  remaining,     // 环中剩余牌在 deck 中的索引数组（抽走即从此移除）
  onSelect,      // (deckIndex) => void —— 回调收到的是 deck 索引，调用方据此取 deck[deckIndex]
  pickCount = 0,
  maxSelect = 3,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',      // 牌靠近中间自动磁吸落入——"锁定"手感
    dragFree: false,      // 滑动过程中持续吸附，牌接近中央就自动卡入
    dragThreshold: 4,
    duration: 35,         // 吸附动画稍舒缓
  });
  const [centerIndex, setCenterIndex] = useState(0);
  const [flippingDeckIdx, setFlippingDeckIdx] = useState(null); // 正在翻转的牌 deckIndex
  const [sparkingDeckIdx, setSparkingDeckIdx] = useState(null); // 正在星芒闪烁的牌 deckIndex
  const [showGuide, setShowGuide] = useState(true);             // 首次呼吸引导
  const isFull = pickCount >= maxSelect;

  // ===== 监听 embla 选中变化 → 更新 centerIndex =====
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCenterIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    // 初始同步（避免首帧 centerIndex 不同步）
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  {/* 磁吸由 embla dragFree:false + align:center 原生处理，无需手动 snap */}

  // ===== remaining 变化（抽走牌）→ 重建循环 =====
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [remaining, emblaApi]);

  // ===== 首次呼吸引导 2.5s 后消失 =====
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ===== 点击牌 =====
  const handleCardClick = useCallback(
    (slideIndex) => {
      if (isFull) return;
      if (flippingDeckIdx != null) return;
      if (sparkingDeckIdx != null) return;

      const deckIndex = remaining[slideIndex];
      if (deckIndex == null) return;

      // 非中心牌 → 滚动到它
      if (slideIndex !== centerIndex) {
        emblaApi?.scrollTo(slideIndex);
        return;
      }

      // 中心牌 → 星芒闪烁 → 翻转 → 选中
      setSparkingDeckIdx(deckIndex);
      setTimeout(() => {
        setSparkingDeckIdx(null);
        setFlippingDeckIdx(deckIndex);
        setTimeout(() => {
          setFlippingDeckIdx(null);
          onSelect(deckIndex);
        }, 650);
      }, 350);
    },
    [isFull, flippingDeckIdx, sparkingDeckIdx, remaining, centerIndex, emblaApi, onSelect],
  );

  // ===== 卡牌离中心距离 → 视觉参数（支持环形环绕距离）=====
  const getVisualParams = useCallback(
    (slideIndex) => {
      const n = remaining.length;
      if (n === 0) return { scale: 1, opacity: 1, brightness: 1, zIndex: 5 };
      // 环形距离：取最近路径
      let dist = Math.abs(slideIndex - centerIndex);
      if (dist > n / 2) dist = n - dist;

      if (dist === 0) return { scale: 1, opacity: 1, brightness: 1, zIndex: 5 };
      if (dist === 1) return { scale: 0.78, opacity: 0.65, brightness: 0.65, zIndex: 3 };
      if (dist === 2) return { scale: 0.58, opacity: 0.35, brightness: 0.45, zIndex: 2 };
      return { scale: 0.42, opacity: 0.15, brightness: 0.3, zIndex: 1 };
    },
    [centerIndex, remaining.length],
  );

  return (
    <div className="relative w-full">
      {/* ===== 中心光晕 —— "灵境通道"（呼吸动画）===== */}
      <motion.div
        className="absolute left-1/2 pointer-events-none z-0"
        style={{
          top: '50%',
          marginLeft: -140,
          marginTop: -140,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== 左右渐变遮罩 ===== */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: 40,
          background: 'linear-gradient(to right, #0d0221, transparent)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: 40,
          background: 'linear-gradient(to left, #0d0221, transparent)',
        }}
      />

      {/* ===== Embla 滚动视口 ===== */}
      <div ref={emblaRef} className="overflow-hidden relative z-[1]">
        <div className="flex" style={{ paddingTop: 8, paddingBottom: 8 }}>
          {remaining.map((deckIndex, slideIndex) => {
            const card = deck[deckIndex];
            if (!card) return null;

            const isFlipping = flippingDeckIdx === deckIndex;
            const isSparking = sparkingDeckIdx === deckIndex;
            const { scale, opacity, brightness, zIndex } = getVisualParams(slideIndex);
            const isCenter = slideIndex === centerIndex;

            return (
              <div
                key={deckIndex}
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: SLOT_W,
                  height: CARD_H + 20,
                }}
                onClick={() => handleCardClick(slideIndex)}
              >
                {/* 3D 翻转容器 */}
                <motion.div
                  animate={{
                    scale: isFlipping ? 1.1 : isSparking ? scale + 0.02 : scale,
                    rotateY: isFlipping ? 180 : 0,
                    filter: `brightness(${brightness})`,
                    opacity,
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 200, damping: 15 },
                    rotateY: { duration: 0.6, ease: 'easeInOut' },
                    filter: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                  }}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    perspective: 800,
                    transformStyle: 'preserve-3d',
                    cursor: isCenter && !isFull ? 'pointer' : undefined,
                    zIndex,
                    position: 'relative',
                  }}
                >
                  {/* 星芒闪烁层（选中瞬间） */}
                  <AnimatePresence>
                    {isSparking && (
                      <motion.div
                        className="absolute inset-0 z-20 rounded-card pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(circle at center, rgba(201,169,110,0.5) 0%, rgba(201,169,110,0.15) 30%, transparent 70%)',
                          boxShadow:
                            '0 0 30px rgba(201,169,110,0.6), 0 0 60px rgba(201,169,110,0.3), 0 0 100px rgba(201,169,110,0.12)',
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0.6], scale: [0.8, 1.05, 1] }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.35 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* 背面：CardBack 星盘牌背 */}
                  <div
                    className="absolute inset-0 rounded-card overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <CardBack
                      showStar={isCenter && !isFull && showGuide}
                      className="h-full w-full rounded-card"
                    />
                    {/* 中心锁定框 —— 金色细线"瞄准镜"，牌滑到中间时出现 */}
                    {isCenter && !isFull && !isFlipping && (
                      <motion.div
                        className="absolute inset-0 rounded-card pointer-events-none"
                        style={{
                          border: '1.5px solid rgba(201,169,110,0.5)',
                          boxShadow:
                            '0 0 18px rgba(201,169,110,0.15), inset 0 0 22px rgba(201,169,110,0.06)',
                        }}
                        initial={{ opacity: 0, borderColor: 'rgba(201,169,110,0.2)' }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          borderColor: [
                            'rgba(201,169,110,0.35)',
                            'rgba(201,169,110,0.6)',
                            'rgba(201,169,110,0.35)',
                          ],
                        }}
                        transition={{
                          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                          borderColor: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        }}
                      />
                    )}
                  </div>

                  {/* 正面：TarotCard（翻转后揭示真身） */}
                  <div
                    className="absolute inset-0 rounded-card overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      pointerEvents: 'none',
                    }}
                  >
                    <TarotCard card={card} size="lg" selected={false} />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
