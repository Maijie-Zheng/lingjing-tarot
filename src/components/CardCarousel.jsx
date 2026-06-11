import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBack from './CardBack';
import TarotCard from './TarotCard';

const CARD_W = 140;
const CARD_H = 210;
const GAP = 16;
const SLOT_W = CARD_W + GAP;

/**
 * 环形无限循环牌轮播 —— P3-4 v2
 *
 * 滚动引擎：原生 CSS scroll-snap（与 P0-8 相同手感）—— 浏览器原生动量 + 减速时磁吸
 * 无限循环：三重渲染 remaining 列表（中段为"正本"，首尾段为克隆），滚动停止时无缝跳转
 * 牌背绑定：每张 CardBack 绑定 deck 中一个确定身份，点哪张抽哪张
 *
 * 保留全部既有视觉：景深缩放、星芒闪烁、3D 翻转、呼吸引导、中心光晕、渐变遮罩
 */
export default function CardCarousel({
  deck,
  remaining,
  onSelect,
  pickCount = 0,
  maxSelect = 3,
}) {
  const containerRef = useRef(null);
  const settleTimerRef = useRef(null);
  const isProgrammaticRef = useRef(false);
  const prevRemainLenRef = useRef(remaining.length);

  const [centerDeckIdx, setCenterDeckIdx] = useState(null);
  const [flippingDeckIdx, setFlippingDeckIdx] = useState(null);
  const [sparkingDeckIdx, setSparkingDeckIdx] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [isProgrammatic, setIsProgrammatic] = useState(false);
  const isFull = pickCount >= maxSelect;

  const N = remaining.length;
  // 三重渲染：首段克隆 + 中段正本 + 尾段克隆 → 伪无限循环
  const tripleIndices = N > 0 ? [...remaining, ...remaining, ...remaining] : [];

  // ===== 根据视口中心找最近的 deckIndex =====
  const findClosestDeckIdx = useCallback(() => {
    const el = containerRef.current;
    if (!el || N === 0) return null;
    const vpCenter = el.scrollLeft + el.offsetWidth / 2;
    const padL = el.offsetWidth / 2 - CARD_W / 2;

    let best = 0;
    let minD = Infinity;
    for (let i = 0; i < tripleIndices.length; i++) {
      const cc = padL + i * SLOT_W + CARD_W / 2;
      const d = Math.abs(vpCenter - cc);
      if (d < minD) { minD = d; best = i; }
    }
    return tripleIndices[best] ?? null;
  }, [N, tripleIndices]);

  // ===== scroll 事件：更新中心牌 + 停稳后边缘跳转 =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isProgrammaticRef.current) return;

      // 实时更新中心牌（景深响应）
      const dIdx = findClosestDeckIdx();
      if (dIdx != null) setCenterDeckIdx(dIdx);

      // 停稳后检测是否滑入克隆区 → 无缝跳回正本区
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        if (N === 0) return;
        const vpCenter = el.scrollLeft + el.offsetWidth / 2;
        const padL = el.offsetWidth / 2 - CARD_W / 2;

        let best = 0, minD = Infinity;
        for (let i = 0; i < tripleIndices.length; i++) {
          const cc = padL + i * SLOT_W + CARD_W / 2;
          const d = Math.abs(vpCenter - cc);
          if (d < minD) { minD = d; best = i; }
        }

        if (best < N) {
          // 滑入首段克隆区 → 跳到中段对应位置
          const target = (best + N) * SLOT_W;
          isProgrammaticRef.current = true;
          setIsProgrammatic(true);
          el.scrollTo({ left: target, behavior: 'instant' });
          setCenterDeckIdx(tripleIndices[best + N]);
          setTimeout(() => {
            isProgrammaticRef.current = false;
            setIsProgrammatic(false);
          }, 80);
        } else if (best >= 2 * N) {
          // 滑入尾段克隆区 → 跳到中段对应位置
          const target = (best - N) * SLOT_W;
          isProgrammaticRef.current = true;
          setIsProgrammatic(true);
          el.scrollTo({ left: target, behavior: 'instant' });
          setCenterDeckIdx(tripleIndices[best - N]);
          setTimeout(() => {
            isProgrammaticRef.current = false;
            setIsProgrammatic(false);
          }, 80);
        }
      }, 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [findClosestDeckIdx, N, tripleIndices]);

  // ===== 首次挂载：滚到中段正本区 =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el || N === 0) return;
    const t = setTimeout(() => {
      const midStart = N * SLOT_W;
      isProgrammaticRef.current = true;
      setIsProgrammatic(true);
      el.scrollTo({ left: midStart, behavior: 'instant' });
      setCenterDeckIdx(remaining[0]);
      setTimeout(() => {
        isProgrammaticRef.current = false;
        setIsProgrammatic(false);
      }, 80);
    }, 120);
    return () => clearTimeout(t);
  }, []); // 仅首次

  // ===== 抽走牌后：保持滚动位置稳定 =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el || N === 0) return;
    // 仅当 remaining 长度减少时（非初始挂载）
    if (remaining.length >= prevRemainLenRef.current) {
      prevRemainLenRef.current = remaining.length;
      return;
    }
    prevRemainLenRef.current = remaining.length;

    // 找到当前视口中心的 deckIndex，在新布局中定位它
    const cur = findClosestDeckIdx();
    if (cur == null) return;
    const targetSlide = tripleIndices.indexOf(cur);
    if (targetSlide < 0) return;
    // 优先定位到中段正本区
    let finalSlide = targetSlide;
    if (finalSlide < N) finalSlide += N;
    else if (finalSlide >= 2 * N) finalSlide -= N;

    isProgrammaticRef.current = true;
    setIsProgrammatic(true);
    el.scrollTo({ left: finalSlide * SLOT_W, behavior: 'instant' });
    setCenterDeckIdx(cur);
    setTimeout(() => {
      isProgrammaticRef.current = false;
      setIsProgrammatic(false);
    }, 80);
  }, [remaining.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== 呼吸引导 2.5s 后消失 =====
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ===== 点击牌 =====
  const handleCardClick = useCallback(
    (deckIndex, slideIndex) => {
      if (isFull) return;
      if (flippingDeckIdx != null) return;
      if (sparkingDeckIdx != null) return;

      const isCenter = deckIndex === centerDeckIdx;

      // 非中心牌 → 丝滑滚到它
      if (!isCenter) {
        const el = containerRef.current;
        if (!el) return;
        // 优先滚到中段正本区的那份
        let targetSlide = slideIndex;
        if (targetSlide < N) targetSlide += N;
        else if (targetSlide >= 2 * N) targetSlide -= N;

        isProgrammaticRef.current = true;
        setIsProgrammatic(true);
        el.scrollTo({ left: targetSlide * SLOT_W, behavior: 'smooth' });
        setTimeout(() => {
          setCenterDeckIdx(deckIndex);
          isProgrammaticRef.current = false;
          setIsProgrammatic(false);
        }, 500);
        return;
      }

      // 中心牌 → 星芒 → 翻转 → 选中
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
    [isFull, flippingDeckIdx, sparkingDeckIdx, remaining, centerDeckIdx, onSelect, N],
  );

  // ===== 卡牌离中心距离 → 视觉参数（环形距离）=====
  const getVisualParams = useCallback(
    (deckIndex) => {
      if (N === 0) return { scale: 1, opacity: 1, brightness: 1, zIndex: 5 };
      const ci = remaining.indexOf(centerDeckIdx);
      const si = remaining.indexOf(deckIndex);
      if (ci === -1 || si === -1) return { scale: 0.42, opacity: 0.15, brightness: 0.3, zIndex: 1 };

      let dist = Math.abs(si - ci);
      if (dist > N / 2) dist = N - dist;

      if (dist === 0) return { scale: 1, opacity: 1, brightness: 1, zIndex: 5 };
      if (dist === 1) return { scale: 0.78, opacity: 0.65, brightness: 0.65, zIndex: 3 };
      if (dist === 2) return { scale: 0.58, opacity: 0.35, brightness: 0.45, zIndex: 2 };
      return { scale: 0.42, opacity: 0.15, brightness: 0.3, zIndex: 1 };
    },
    [centerDeckIdx, remaining, N],
  );

  if (N === 0) return null;

  return (
    <div className="relative w-full">
      {/* ===== 中心光晕 —— "灵境通道"（呼吸动画）===== */}
      <motion.div
        className="absolute left-1/2 pointer-events-none z-0"
        style={{
          top: '50%', marginLeft: -140, marginTop: -140,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ===== 左右渐变遮罩 ===== */}
      <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 40, background: 'linear-gradient(to right, #0d0221, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 40, background: 'linear-gradient(to left, #0d0221, transparent)' }} />

      {/* ===== 原生滚动容器（P0-8 手感：scroll-snap + 浏览器原生动量）===== */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar carousel-snap relative z-[1]"
        style={{
          paddingLeft: `calc(50% - ${CARD_W / 2}px)`,
          paddingRight: `calc(50% - ${CARD_W / 2}px)`,
          paddingTop: 8,
          paddingBottom: 8,
          overscrollBehavior: 'contain',
        }}
      >
        {tripleIndices.map((deckIndex, slideIndex) => {
          const card = deck[deckIndex];
          if (!card) return null;

          const isFlipping = flippingDeckIdx === deckIndex;
          const isSparking = sparkingDeckIdx === deckIndex;
          const isCenter = deckIndex === centerDeckIdx;
          const { scale, opacity, brightness, zIndex } = getVisualParams(deckIndex);

          return (
            <div
              key={`${deckIndex}-${slideIndex}`}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: SLOT_W,
                height: CARD_H + 20,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
              onClick={() => handleCardClick(deckIndex, slideIndex)}
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
                  width: CARD_W, height: CARD_H,
                  perspective: 800,
                  transformStyle: 'preserve-3d',
                  cursor: isCenter && !isFull ? 'pointer' : undefined,
                  zIndex,
                  position: 'relative',
                }}
              >
                {/* 星芒闪烁层 */}
                <AnimatePresence>
                  {isSparking && (
                    <motion.div
                      className="absolute inset-0 z-20 rounded-card pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(201,169,110,0.5) 0%, rgba(201,169,110,0.15) 30%, transparent 70%)',
                        boxShadow: '0 0 30px rgba(201,169,110,0.6), 0 0 60px rgba(201,169,110,0.3), 0 0 100px rgba(201,169,110,0.12)',
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
                  {/* 金色锁定框 —— 牌滑到中间时出现 */}
                  {isCenter && !isFull && !isFlipping && (
                    <motion.div
                      className="absolute inset-0 rounded-card pointer-events-none"
                      style={{
                        border: '1.5px solid rgba(201,169,110,0.5)',
                        boxShadow: '0 0 18px rgba(201,169,110,0.15), inset 0 0 22px rgba(201,169,110,0.06)',
                      }}
                      initial={{ opacity: 0, borderColor: 'rgba(201,169,110,0.2)' }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        borderColor: ['rgba(201,169,110,0.35)', 'rgba(201,169,110,0.6)', 'rgba(201,169,110,0.35)'],
                      }}
                      transition={{
                        opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        borderColor: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      }}
                    />
                  )}
                </div>

                {/* 正面：TarotCard（翻转后揭示真身）*/}
                <div
                  className="absolute inset-0 rounded-card overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    pointerEvents: 'none',
                  }}
                >
                  <TarotCard card={card} size="lg" selected={false} reversed={card.isReversed} />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
