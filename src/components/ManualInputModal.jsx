import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

export default function ManualInputModal({ isOpen, onClose, onSubmit }) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickSamples = [
    "Привет, как твои дела?",
    "Ты сегодня потрясающе выглядишь!",
    "Чем занимаешься сегодня вечером?",
    "Пойдем выпьем кофе?",
    "Как прошел твой день?",
    "Hey! What are you doing today?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText('');
      onClose();
    }
  };

  const handleSelectSample = (sample) => {
    onSubmit(sample);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up">
        {/* Sarlavha */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-lime/20 flex items-center justify-center text-brand-lime font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Suhbatdosh gapini yozish</h3>
              <p className="text-[11px] text-gray-400">Shovqinli joyda yoki sinov uchun qo‘lda kiriting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input forma */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Masalan: Привет, как поживаешь?..."
              className="w-full p-3.5 rounded-2xl bg-dark-800 border border-dark-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-lime transition-all resize-none"
              autoFocus
            />
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-dark-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-lime text-dark-950 font-bold text-xs flex items-center gap-1.5 hover:bg-brand-limeDark disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Javob olish</span>
            </button>
          </div>
        </form>

        {/* Tezkor namunalar */}
        <div className="mt-5 pt-3 border-t border-dark-800">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 mb-2">
            <Sparkles className="w-3 h-3 text-brand-purple" />
            <span>Tezkor tayyor iboralar (bosing va sinang):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-dark-700/60 transition-all"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

