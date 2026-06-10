/**
 * 牌背组件 —— P3-3
 *
 * 可复用于洗牌页、抽牌页。深蓝渐变底 + 金色细线星盘 + 可选流光星纹。
 * 尺寸由父组件 className 控制。
 */
export default function CardBack({ showStar = false, className = '' }) {
  return (
    <div
      className={`rounded-[9px] border border-gold/40 bg-[linear-gradient(150deg,#243056,#1a2444)] shadow-[0_6px_18px_rgba(0,0,0,0.5)] ${className}`}
    >
      <svg viewBox="0 0 78 116" className="h-full w-full">
        {/* 星盘线框 */}
        <g stroke="rgba(230,201,130,.55)" strokeWidth=".7" fill="none">
          <circle cx="39" cy="58" r="22" />
          <circle cx="39" cy="58" r="13" opacity=".6" />
          <line x1="14" y1="33" x2="64" y2="83" />
          <line x1="64" y1="33" x2="14" y2="83" />
        </g>
        {/* 中央八角星（可选流光） */}
        <path
          d="M39,42 C39.5,55 40,55.5 53,58 C40,60.5 39.5,61 39,74 C38.5,61 38,60.5 25,58 C38,55.5 38.5,55 39,42 Z"
          fill="#E6C982"
          className={showStar ? 'animate-shimmer [animation-iteration-count:1]' : ''}
        />
        {/* 四角星点 */}
        <circle cx="16" cy="14" r="1" fill="#E6C982" />
        <circle cx="62" cy="14" r="1" fill="#E6C982" />
        <circle cx="16" cy="102" r="1" fill="#E6C982" />
        <circle cx="62" cy="102" r="1" fill="#E6C982" />
      </svg>
    </div>
  );
}
