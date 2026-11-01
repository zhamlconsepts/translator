import React from 'react';
import { VolumeX, Settings, History, Sparkles, User, Users } from 'lucide-react';

export default function Header({
  userGender,
  setUserGender,
  partnerGender,
  setPartnerGender,
  onOpenSettings,
  onOpenHistory,
  historyCount = 0
}) {
  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2 bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/60">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Logo & Maxfiy nishoni */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-dark-950 font-black text-sm shadow-[0_0_12px_rgba(210,255,58,0.35)]">
            SD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                SuhbatDosh
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-lime/15 text-brand-lime font-mono border border-brand-lime/30">
                  AI PRO
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <VolumeX className="w-3 h-3 text-emerald-400 inline" />
              <span className="text-emerald-400 font-medium">100% Tovushsiz</span>
              <span>• Maxfiy</span>
            </div>
          </div>
        </div>

        {/* O'ng tarafdagi tugmalar */}
        <div className="flex items-center gap-1.5">
          {/* Suhbatlar tarixi */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl bg-dark-800/80 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors border border-dark-700/50"
            title="Suhbatlar tarixi"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-purple text-dark-950 text-[10px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Sozlamalar */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-dark-800/80 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors border border-dark-700/50"
            title="Sozlamalar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jinsni tezkor moslash paneli (Gender Quick Switcher) */}
      <div className="max-w-md mx-auto mt-2.5 pt-2 border-t border-dark-800/80 flex items-center justify-between text-xs">
        {/* Men (Foydalanuvchi jinsi) */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
            <User className="w-3 h-3 text-brand-lime" /> Men:
          </span>
          <div className="inline-flex rounded-lg bg-dark-800 p-0.5 border border-dark-700">
            <button
              onClick={() => setUserGender('male')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                userGender === 'male'
                  ? 'bg-brand-lime text-dark-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👨 Erkak
            </button>
            <button
              onClick={() => setUserGender('female')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                userGender === 'female'
                  ? 'bg-brand-lime text-dark-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👩 Ayol
            </button>
          </div>
        </div>

        {/* Suhbatdosh jinsi */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-brand-purple" /> Hamkor:
          </span>
          <div className="inline-flex rounded-lg bg-dark-800 p-0.5 border border-dark-700">
            <button
              onClick={() => setPartnerGender('female')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                partnerGender === 'female'
                  ? 'bg-brand-purple text-dark-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👩 Ayol
            </button>
            <button
              onClick={() => setPartnerGender('male')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                partnerGender === 'male'
                  ? 'bg-brand-purple text-dark-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👨 Erkak
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

