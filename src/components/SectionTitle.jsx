/**
 * 区块标题 —— 金色图标 + 渐变金衬线文字
 * 用于解读页各模块标题（整体叙事 / 行动建议等）
 */
export default function SectionTitle({ icon: Icon, children, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {Icon && (
        <Icon
          size={19}
          strokeWidth={1.6}
          className="text-gold drop-shadow-[0_0_10px_rgba(230,201,130,0.55)]"
          aria-hidden
        />
      )}
      <span className="text-gold-gradient animate-shine font-serif text-base font-medium tracking-[0.12em]">
        {children}
      </span>
    </div>
  );
}
