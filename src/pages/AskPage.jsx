import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, RefreshCw, Sparkles, Check, Heart, Briefcase, Moon } from 'lucide-react';
import StarField from '../components/StarField';
import GoldButton from '../components/GoldButton';
import useQuestionBatch from '../hooks/useQuestionBatch';
import data from '../data/questions.json';

/**
 * 输入页（心事页）—— P3-1 视觉重构
 *
 * - 预设问题从 questions.json 读取，分层配额出题
 * - 卡片式预设 + lucide 图标替代 emoji
 * - 选中态：金色高亮 + Check 对勾 + 光晕
 * - 点击填入 + 再点取消 + 手动编辑保留选中
 * - GoldButton 禁用态 40% 透明无呼吸
 */

const ICONS = { Heart, Briefcase, Moon, Sparkles };

const up = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay: 0.08 * i },
  }),
};

export default function AskPage() {
  const navigate = useNavigate();
  const { batch, next } = useQuestionBatch();
  const [text, setText] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const canSubmit = text.trim().length > 0;

  // 点击预设问题：填入 / 取消
  const pickQuestion = (q) => {
    if (selectedId === q.id) {
      setSelectedId(null);
      setText('');
      return;
    }
    setSelectedId(q.id);
    setText(q.text);
  };

  // 手动编辑输入框
  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    if (v.trim() === '') setSelectedId(null);
  };

  // 提交 → 洗牌页
  const handleSubmit = () => {
    if (!canSubmit) return;
    navigate(`/shuffle?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        background:
          'radial-gradient(125% 90% at 50% 0%, #251A4D 0%, #16102F 50%, #0E0A1F 100%)',
      }}
    >
      <StarField density={3600} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-[18px] pt-[18px]">
        {/* 返回按钮 */}
        <motion.button
          variants={up}
          custom={0}
          initial="hidden"
          animate="show"
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-1.5 text-[13px] text-gold-200/60 hover:text-gold-200/90 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden /> 返回
        </motion.button>

        {/* 标题 */}
        <motion.h1
          variants={up}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-[18px] text-center font-serif text-[20px] font-medium tracking-[3px] text-white/[.92]"
        >
          灵境已启，说说你的心事吧
        </motion.h1>

        {/* 输入区 */}
        <motion.div variants={up} custom={2} initial="hidden" animate="show" className="mt-4">
          <textarea
            value={text}
            onChange={onChange}
            placeholder="写下你的心事…"
            rows={4}
            className="h-[108px] w-full resize-none rounded-card border border-gold/[.22] bg-white/[0.045] p-[14px] text-[14px] leading-relaxed text-white/85 shadow-[inset_0_1px_18px_rgba(230,201,130,0.05)] outline-none transition-colors placeholder:text-white/[.32] focus:border-gold/60"
          />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-gold-200/50">
            <Lock size={13} strokeWidth={1.6} aria-hidden /> 你的心事，仅存于你的掌心
          </p>
        </motion.div>

        {/* 预设问题区 */}
        <motion.div
          variants={up}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-[18px] flex items-center justify-between"
        >
          <span className="text-[12.5px] text-white/45">试试这些问题</span>
          <button
            onClick={next}
            className="flex items-center gap-[5px] text-[12.5px] text-gold-200/70 hover:text-gold-200 transition-colors"
          >
            <RefreshCw size={14} strokeWidth={1.6} aria-hidden /> 换一批
          </button>
        </motion.div>

        {/* 预设卡片列表 */}
        <div className="mt-3 flex flex-col gap-2.5">
          {batch.map((q, i) => {
            const cat = data.categories[q.cat];
            const Icon = ICONS[cat.icon];
            const selected = selectedId === q.id;
            return (
              <motion.button
                key={q.id}
                variants={up}
                custom={4 + i}
                initial="hidden"
                animate="show"
                onClick={() => pickQuestion(q)}
                className={`flex items-center gap-2.5 rounded-[14px] border px-[15px] py-[13px] text-left transition-all duration-300 ${
                  selected
                    ? 'border-gold/[.65] bg-gold/10 shadow-[0_0_16px_rgba(230,201,130,0.18)]'
                    : 'border-gold/[.16] bg-white/[0.04] hover:border-gold/40'
                }`}
              >
                {/* 分类图标 */}
                <Icon
                  size={16}
                  strokeWidth={1.6}
                  aria-hidden
                  className={
                    selected ? 'shrink-0 text-gold-200' : 'shrink-0 text-gold'
                  }
                />
                {/* 分类标签 */}
                <span
                  className={`shrink-0 text-[11.5px] tracking-wide ${
                    selected ? 'text-gold-200' : 'text-gold-200/65'
                  }`}
                >
                  {cat.label}
                </span>
                {/* 分隔线 */}
                <span
                  className={`h-3 w-px shrink-0 ${
                    selected ? 'bg-gold/40' : 'bg-gold/25'
                  }`}
                />
                {/* 问题文字 */}
                <span
                  className={`text-[13.5px] ${
                    selected ? 'text-white/95' : 'text-white/[.82]'
                  }`}
                >
                  {q.text}
                </span>
                {/* 选中对勾 */}
                {selected && (
                  <Check
                    size={15}
                    strokeWidth={1.6}
                    aria-hidden
                    className="ml-auto shrink-0 text-gold-200"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 底部 CTA */}
        <div className="mt-auto py-4">
          <GoldButton
            icon={Sparkles}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full justify-center ${
              !canSubmit ? 'animate-none cursor-not-allowed opacity-40' : ''
            }`}
          >
            开启灵境
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
