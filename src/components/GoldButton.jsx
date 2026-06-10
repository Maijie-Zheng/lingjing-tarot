/**
 * 金色 CTA 按钮 —— 全站主要操作入口
 * 渐变金背景 + 呼吸光晕 + 图标前置
 */
export default function GoldButton({ icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-gold-200 via-gold to-gold-600 px-11 py-3.5 text-[15.5px] font-medium tracking-[0.18em] text-[#3a2c0a] animate-breath transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-200 ${className}`}
      {...props}
    >
      {Icon && <Icon size={17} strokeWidth={1.6} aria-hidden />}
      {children}
    </button>
  );
}
