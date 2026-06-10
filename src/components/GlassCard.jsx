/**
 * 磨砂玻璃卡片 —— 全站复用容器
 * 半透明背景 + 金色微光边框 + backdrop-blur
 */
export default function GlassCard({ className = '', children }) {
  return (
    <div
      className={`rounded-card border border-gold/20 bg-white/[0.045] p-[18px] backdrop-blur-sm shadow-[inset_0_1px_18px_rgba(230,201,130,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
