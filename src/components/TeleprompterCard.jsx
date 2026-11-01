import React, { useState } from 'react';
import { RefreshCw, Copy, Check, MessageSquare, VolumeX, Sparkles, Eye } from 'lucide-react';

export default function TeleprompterCard({
  options = [],
  activeTone = 'friendly',
  setActiveTone,
  onRegenerate,
  fontSize = 'large', // 'normal' | 'large' | 'huge'
  setFontSize,
  userGender
}) {
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Tanlangan variantni topish
  const currentOption = options.find(o => o.tone === activeTone) || options[0] || {
    text: "Привет! Очень рад тебя видеть.",
    uzMeaning: "Salom! Seni ko'rganimdan juda xursandman.",
    pronunciation: "[Privyet! Ochen rad tebya vidyet]"
  };

  const handleCopy = () => {
    if (currentOption?.text) {
      navigator.clipboard.writeText(currentOption.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateClick = () => {
    setIsRotating(true);
    onRegenerate();
    setTimeout(() => setIsRotating(false), 450);
  };

  // Shrift o'lchamlari
  const fontClasses = {
    normal: 'text-xl leading-relaxed',
    large: 'text-2xl sm:text-3xl leading-snug font-bold',
    huge: 'text-3xl sm:text-4xl leading-tight font-extrabold'
  };

  return (
    <div className="w-full rounded-3xl bg-dark-850/95 border-2 border-brand-lime/30 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
      {/* Orqa fondagi nafis nur effekti */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Yuqori panel: Ohanglar tablari (Tones) */}
      <div className="flex items-center justify-between gap-1 pb-3 border-b border-dark-700/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-dark-900/90 border border-dark-750">
          {options.map((opt) => {
            const isActive = opt.tone === activeTone;
            return (
              <button
                key={opt.tone}
                onClick={() => setActiveTone(opt.tone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-brand-lime text-dark-950 shadow-md font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <span>{opt.icon || '💬'}</span>
                <span>{opt.toneName}</span>
              </button>
            );
          })}
        </div>

        {/* Shrift o'lchami o'zgartirgich */}
        <div className="flex items-center gap-1 bg-dark-900/90 p-1 rounded-xl border border-dark-750">
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'huge' : 'normal')}
            className="px-2 py-1 text-xs font-bold text-gray-300 hover:text-brand-lime flex items-center gap-0.5"
            title="Shrift o'lchamini o'zgartirish"
          >
            <span className="text-[10px]">A</span>
            <span className="text-sm">A</span>
          </button>
        </div>
      </div>

      {/* Prompter Ko'rsatmasi */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1 text-brand-lime font-medium">
          <Eye className="w-3.5 h-3.5" />
          Suhbatdoshingizga o‘qib bering:
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <VolumeX className="w-3.5 h-3.5" />
          Telefon ovoz chiqarmaydi
        </span>
      </div>

      {/* ASOSIY TELEPROMPTER MATNI (Ovoz chiqarib o'qish uchun) */}
      <div className="my-4 py-1">
        <div className={`text-white tracking-tight ${fontClasses[fontSize] || fontClasses.large} select-text transition-all`}>
          {currentOption.text}
        </div>
      </div>

      {/* TALAFFUZ (Lotincha fonetik o'qilishi) */}
      {currentOption.pronunciation && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-dark-900/60 border border-dark-750/70 text-xs text-brand-lilac font-mono flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400">Talaffuz:</span>
          <span className="text-gray-300 font-medium">{currentOption.pronunciation}</span>
        </div>
      )}

      {/* O'ZBEKCHA MA'NOSI (Foydalanuvchi nima deyotganini to'liq anglash uchun) */}
      <div className="p-3.5 rounded-2xl bg-brand-lime/10 border border-brand-lime/25 flex items-start gap-2 text-sm text-gray-200">
        <span className="font-bold text-brand-lime shrink-0">🇺🇿 Ma’nosi:</span>
        <div className="font-medium text-white leading-snug">
          {currentOption.uzMeaning}
        </div>
      </div>

      {/* Pastki Harakatlar Paneli: Yangilash (Regenerate) & Nusxalash */}
      <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between gap-3">
        {/* REGENERATE TUGMASI (Talab 7: oxirgi javobni doim yangilash) */}
        <button
          onClick={handleRegenerateClick}
          className="flex-1 py-3 px-4 rounded-2xl bg-dark-800 hover:bg-dark-750 active:scale-98 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-dark-650 transition-all shadow-md group"
        >
          <RefreshCw className={`w-4 h-4 text-brand-lime transition-transform duration-500 ${isRotating ? 'rotate-180' : 'group-hover:rotate-45'}`} />
          <span>Boshqa javob yaratish</span>
          <span className="text-[11px] text-gray-400 font-mono">(Yangilash)</span>
        </button>

        {/* Nusxalash */}
        <button
          onClick={handleCopy}
          className="p-3 rounded-2xl bg-dark-800 hover:bg-dark-750 active:scale-98 text-gray-300 hover:text-white border border-dark-650 transition-all"
          title="Matndan nusxa olish"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

