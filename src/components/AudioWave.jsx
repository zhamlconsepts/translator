import React from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

export default function AudioWave({ isListening, audioLevel = 0, detectedLanguage, statusText }) {
  // Ovoz balandligiga qarab barlarni balandligini hisoblash (5 ta chastota paneli)
  const baseScale = isListening ? Math.max(0.25, audioLevel) : 0.15;
  const h1 = Math.min(32, Math.max(6, Math.round(baseScale * 30 + Math.random() * 4)));
  const h2 = Math.min(38, Math.max(8, Math.round(baseScale * 38 + Math.random() * 6)));
  const h3 = Math.min(44, Math.max(12, Math.round(baseScale * 44 + Math.random() * 8)));
  const h4 = Math.min(36, Math.max(8, Math.round(baseScale * 36 + Math.random() * 5)));
  const h5 = Math.min(28, Math.max(6, Math.round(baseScale * 26 + Math.random() * 4)));

  return (
    <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-dark-850/90 border border-dark-700/60 shadow-lg backdrop-blur-md">
      {/* Chap: Holat va Til */}
      <div className="flex items-center gap-2.5">
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
          isListening ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-gray-400'
        }`}>
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping opacity-75" />
              <Radio className="w-4 h-4 text-red-400 relative z-10" />
            </>
          ) : (
            <MicOff className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-200">
              {isListening ? 'Suhbat tinglanmoqda...' : 'Mikrofon kutmoqda'}
            </span>
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span>{detectedLanguage?.flag || '🌐'}</span>
            <span>{detectedLanguage?.name || 'Tillarni avto aniqlash'}</span>
          </div>
        </div>
      </div>

      {/* O'ng: Dinamik Ovoz To'lqinlari (Audio Waveform) */}
      <div className="flex items-center gap-1 h-10 px-2">
        <div
          className={`w-1 rounded-full transition-all duration-75 ${
            isListening ? 'bg-brand-lime shadow-[0_0_8px_rgba(210,255,58,0.5)]' : 'bg-dark-700'
          }`}
          style={{ height: `${h1}px` }}
        />
        <div
          className={`w-1.5 rounded-full transition-all duration-75 ${
            isListening ? 'bg-brand-lime shadow-[0_0_8px_rgba(210,255,58,0.5)]' : 'bg-dark-700'
          }`}
          style={{ height: `${h2}px` }}
        />
        <div
          className={`w-1.5 rounded-full transition-all duration-75 ${
            isListening ? 'bg-brand-purple shadow-[0_0_8px_rgba(196,148,245,0.5)]' : 'bg-dark-700'
          }`}
          style={{ height: `${h3}px` }}
        />
        <div
          className={`w-1.5 rounded-full transition-all duration-75 ${
            isListening ? 'bg-brand-lime shadow-[0_0_8px_rgba(210,255,58,0.5)]' : 'bg-dark-700'
          }`}
          style={{ height: `${h4}px` }}
        />
        <div
          className={`w-1 rounded-full transition-all duration-75 ${
            isListening ? 'bg-brand-lime shadow-[0_0_8px_rgba(210,255,58,0.5)]' : 'bg-dark-700'
          }`}
          style={{ height: `${h5}px` }}
        />
      </div>
    </div>
  );
}

