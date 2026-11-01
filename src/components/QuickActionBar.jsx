import React from 'react';
import { Mic, MicOff, Edit3, Compass, Sparkles } from 'lucide-react';

export default function QuickActionBar({
  isListening,
  onToggleListen,
  onOpenManualInput,
  onOpenScenarios
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-dark-950 via-dark-950/95 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center justify-around p-2.5 rounded-3xl bg-dark-900/90 border border-dark-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          
          {/* 1. Yozish (Manual Input) */}
          <button
            onClick={onOpenManualInput}
            className="flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-2xl hover:bg-dark-800 text-gray-400 hover:text-white transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-300 border border-dark-700">
              <Edit3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium tracking-tight">Yozish</span>
          </button>

          {/* 2. Asosiy Mikrofon / Tinglash Tugmasi (Markazda, Katta va Nurli) */}
          <button
            onClick={onToggleListen}
            className={`relative flex flex-col items-center justify-center -mt-6 transition-all active:scale-95 group`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-tr from-red-500 to-rose-400 text-white shadow-[0_0_28px_rgba(239,68,68,0.5)] ring-4 ring-red-500/30 animate-pulse'
                  : 'bg-gradient-to-tr from-brand-lime to-brand-limeDark text-dark-950 shadow-[0_0_24px_rgba(210,255,58,0.4)] ring-4 ring-brand-lime/20 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-dark-950 font-bold" />
              )}
            </div>
            <span className="text-[11px] font-bold mt-1.5 tracking-tight text-white">
              {isListening ? "To'xtatish" : "Tinglash"}
            </span>
          </button>

          {/* 3. Mavzular va Ssenariylar (Scenarios) */}
          <button
            onClick={onOpenScenarios}
            className="flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-2xl hover:bg-dark-800 text-gray-400 hover:text-white transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-300 border border-dark-700">
              <Sparkles className="w-4 h-4 text-brand-purple" />
            </div>
            <span className="text-[11px] font-medium tracking-tight">Mavzular</span>
          </button>

        </div>
      </div>
    </div>
  );
}

