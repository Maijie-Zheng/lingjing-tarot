/**
 * 灵境之眼 —— 落地页核心视觉
 * 双层反向旋转金色轨道 + 极简星芒核心 + 呼吸光晕
 */
export default function OrbitalEmblem({ size = 208 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 呼吸光晕：居中由 keyframe 内的 translate 负责，勿再加 Tailwind 平移 */}
      <div
        className="animate-glow absolute left-1/2 top-1/2 h-[150px] w-[150px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(230,201,130,.32) 0%, rgba(230,201,130,0) 68%)',
        }}
      />
      {/* 双层轨道 */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
      >
        {/* 外层轨道 —— 顺时针慢转 */}
        <g
          className="animate-spin-slow"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="rgba(230,201,130,.28)"
            strokeWidth="1"
          />
          <circle cx="172" cy="100" r="2.4" fill="#E6C982" />
          <circle cx="136" cy="162.4" r="1.8" fill="#E6C982" />
          <rect
            x="62"
            y="160"
            width="4"
            height="4"
            fill="#F3E3B0"
            transform="rotate(45 64 162.4)"
          />
          <circle cx="28" cy="100" r="2" fill="#E6C982" />
          <circle cx="64" cy="37.6" r="1.6" fill="#E6C982" />
          <rect
            x="134"
            y="35.6"
            width="4"
            height="4"
            fill="#F3E3B0"
            transform="rotate(45 136 37.6)"
          />
        </g>
        {/* 内层轨道 —— 逆时针慢转 */}
        <g
          className="animate-spin-rev"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle
            cx="100"
            cy="100"
            r="49"
            fill="none"
            stroke="rgba(230,201,130,.18)"
            strokeWidth="1"
          />
          <circle cx="134.6" cy="134.6" r="1.8" fill="#E6C982" />
          <circle cx="65.4" cy="134.6" r="1.4" fill="#E6C982" />
          <circle cx="65.4" cy="65.4" r="1.8" fill="#E6C982" />
          <circle cx="134.6" cy="65.4" r="1.4" fill="#E6C982" />
        </g>
      </svg>
      {/* 星芒核心：外层负责居中，内层负责自转，SVG 负责明暗呼吸（三层分开，避免 transform 互相覆盖） */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-core h-[52px] w-[52px]">
          <svg
            viewBox="0 0 64 64"
            className="animate-twinkle h-full w-full"
          >
            <defs>
              <linearGradient id="lj-core" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F6E8BC" />
                <stop offset="1" stopColor="#C9A24E" />
              </linearGradient>
            </defs>
            <path
              d="M32,5 C32.7,28 33,29 59,32 C33,35 32.7,36 32,59 C31.3,36 31,35 5,32 C31,29 31.3,28 32,5 Z"
              fill="url(#lj-core)"
            />
            <circle cx="32" cy="32" r="2.6" fill="#FFF8E6" />
            <circle cx="45" cy="19" r="1" fill="#E6C982" opacity=".7" />
            <circle cx="45" cy="45" r="1" fill="#E6C982" opacity=".7" />
            <circle cx="19" cy="45" r="1" fill="#E6C982" opacity=".7" />
            <circle cx="19" cy="19" r="1" fill="#E6C982" opacity=".7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
