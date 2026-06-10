import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StarField from '../components/StarField';

const AUTO_ADVANCE_MS = 5000;

/**
 * 冥想引导过渡页 —— P3-2
 *
 * 输入页提交后、抽牌页之前的几秒钟留白。
 * 仪式感来自「缓慢呼吸的光」+ 一行静态氛围文案。
 * - 5 秒后自动跳转抽牌页，无需任何操作
 * - 「跳过」立即进入，「换问题」返回上一页
 * - replace: true 不进历史栈，从抽牌页返回直接回输入页
 */
export default function MeditatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const question = searchParams.get('q') || '此刻的心事';

  const goDraw = () =>
    navigate(`/shuffle?q=${encodeURIComponent(question)}`, { replace: true });

  // 5 秒后自动进入抽牌页
  useEffect(() => {
    const t = setTimeout(goDraw, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
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
      {/* 比其他屏更稀更淡的星空 */}
      <StarField density={6200} goldRatio={0.28} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col p-[18px]">
        {/* 换问题 = 返回上一页，透明度压低不抢戏 */}
        <button
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-1.5 text-[13px] text-gold-200/40 hover:text-gold-200/70 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden /> 换问题
        </button>

        {/* 你在问（极淡） */}
        <div className="mt-3.5 rounded-2xl border border-gold/[.12] bg-white/[0.02] px-4 py-3 text-center opacity-[.55]">
          <div className="text-[11px] tracking-wide text-white/30">你在问</div>
          <div className="mt-0.5 text-[13.5px] text-white/60">{question}</div>
        </div>

        {/* 中央呼吸光 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative h-[220px] w-[220px]">
            {/* 光晕（居中由 keyframe 内 translate(-50%,-50%) 负责，勿再加 Tailwind 平移） */}
            <div
              className="absolute left-1/2 top-1/2 h-[180px] w-[180px] rounded-full animate-breathe"
              style={{
                background:
                  'radial-gradient(circle, rgba(230,201,130,.26) 0%, rgba(230,201,130,0) 66%)',
              }}
            />
            {/* 外环 */}
            <div className="absolute left-1/2 top-1/2 h-[128px] w-[128px] rounded-full border border-gold/[.28] animate-breathering" />
            {/* 星芒核心（品牌一致） */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 64 64"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-corepulse"
            >
              <defs>
                <linearGradient id="lj-med-core" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F6E8BC" />
                  <stop offset="1" stopColor="#C9A24E" />
                </linearGradient>
              </defs>
              <path
                d="M32,5 C32.7,28 33,29 59,32 C33,35 32.7,36 32,59 C31.3,36 31,35 5,32 C31,29 31.3,28 32,5 Z"
                fill="url(#lj-med-core)"
              />
            </svg>
          </div>

          {/* 静态氛围文案（随光轻微明暗） */}
          <p className="mt-10 text-center font-serif text-[15px] leading-[2.1] tracking-[3px] text-white/60 animate-textbreath">
            闭上眼睛，深呼吸
            <br />
            <span className="text-[13.5px]">在心中默念你的问题…</span>
          </p>
        </div>

        {/* 跳过 */}
        <button
          onClick={goDraw}
          className="self-center pb-2.5 text-[13px] text-white/[.38] hover:text-white/60 transition-colors"
        >
          跳过 →
        </button>
      </div>
    </div>
  );
}
