import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StarField from '../components/StarField';
import CardBack from '../components/CardBack';

const SHUFFLE_MS = 2500;
const SETTLE_AT = 2050; // 文案切到「牌阵已成」的时刻（对应收束帧）

/**
 * 洗牌过渡页 —— P3-3 重写
 *
 * 紧接冥想页：4 张牌交叠错位旋转，约 2.5 秒洗牌动作 → 收束一震 → 自动进选牌页。
 * - 无按钮、无进度条——动作和文案本身就是进度
 * - 文案两段式：过程「灵境正在为你洗牌…」→ 收束瞬间「牌阵已成」
 * - replace: true 不进历史栈
 */
export default function ShufflePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const question = searchParams.get('q') || '此刻的心事';
  const [settled, setSettled] = useState(false);

  const goDraw = () =>
    navigate(`/draw?q=${encodeURIComponent(question)}`, { replace: true });

  useEffect(() => {
    const t1 = setTimeout(() => setSettled(true), SETTLE_AT);
    const t2 = setTimeout(goDraw, SHUFFLE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 46%, #1A1336 0%, #0D0A1E 55%, #08060F 100%)',
      }}
    >
      <StarField density={6000} goldRatio={0.3} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col p-[18px]">
        {/* 仅保留问题卡，无任何按钮 */}
        <div className="mt-[52px] rounded-2xl border border-gold/[.12] bg-white/[0.02] px-4 py-3 text-center opacity-[.55]">
          <div className="text-[11px] tracking-wide text-white/30">你在问</div>
          <div className="mt-0.5 text-[13.5px] text-white/60">{question}</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          {/* 文案两段式（星形 SVG 非 emoji） */}
          <div className="mb-10 flex items-center gap-2 font-serif text-[15.5px] tracking-[3px] text-gold-200/80 animate-textfade [animation-iteration-count:1]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 64 64"
              className="animate-shimmer [animation-iteration-count:1]"
              aria-hidden
            >
              <path
                d="M32,6 C33,28 36,31 58,32 C36,33 33,36 32,58 C31,36 28,33 6,32 C28,31 31,28 32,6 Z"
                fill="#E6C982"
              />
            </svg>
            {settled ? '牌阵已成' : '灵境正在为你洗牌…'}
          </div>

          {/* 牌堆：4 张，只播一轮；最上面一张显示流光星纹 */}
          <div className="relative h-[160px] w-[180px] animate-settle [animation-iteration-count:1]">
            {/* 居中定位用 wrapper——洗牌位移用内层 transform，避免与外层 settle transform 冲突。
                每张牌 78×116px，ml/mt 负半宽/半高实现居中。 */}
            {[
              { anim: 'animate-shuf3', star: false },
              { anim: 'animate-shuf2', star: false },
              { anim: 'animate-shuf1', star: false },
              { anim: 'animate-shuf0', star: true },
            ].map((c, i) => (
              <div
                key={i}
                className={`absolute left-1/2 top-1/2 ml-[-39px] mt-[-58px] ${c.anim} [animation-iteration-count:1]`}
              >
                <CardBack showStar={c.star} className="h-[116px] w-[78px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
