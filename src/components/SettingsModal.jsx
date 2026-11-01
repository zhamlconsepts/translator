import React from 'react';
import { X, VolumeX, Shield, Key, Sparkles, Check, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/languageDetector';

export default function SettingsModal({
  isOpen,
  onClose,
  userGender,
  setUserGender,
  partnerGender,
  setPartnerGender,
  fontSize,
  setFontSize,
  speechLang,
  setSpeechLang,
  geminiKey,
  setGeminiKey
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Sarlavha */}
        <div className="sticky top-0 bg-dark-900/90 backdrop-blur-md pb-3 flex items-center justify-between border-b border-dark-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Ilova Sozlamalari</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
              100% O'zbekcha
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Maxfiylik va Tovushsizlik kafolati (Talab 5) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
          <VolumeX className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-300">100% Tovushsiz Kafolat</h4>
            <p className="text-gray-300 mt-0.5 leading-relaxed">
              Ilova mutlaqo tashqariga ovoz chiqarmaydi. Suhbatdoshingiz siz yordamchidan foydalanayotganingizni eshitmaydi. Siz so‘zlarni ekrandan shunchaki o‘qib berasiz.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5 text-xs">
          {/* 1. Jins sozlamalari (Grammatika uchun) */}
          <div className="space-y-2">
            <label className="font-bold text-gray-200 block">
              1. Jinsiy moslashuv (Grammatika to‘g‘ri bo‘lishi uchun):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-dark-800 border border-dark-700">
                <span className="text-gray-400 text-[11px] block mb-1">Mening jinsim:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setUserGender('male')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                      userGender === 'male' ? 'bg-brand-lime text-dark-950' : 'bg-dark-700 text-gray-300'
                    }`}
                  >
                    👨 Erkak
                  </button>
                  <button
                    onClick={() => setUserGender('female')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                      userGender === 'female' ? 'bg-brand-lime text-dark-950' : 'bg-dark-700 text-gray-300'
                    }`}
                  >
                    👩 Ayol
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800 border border-dark-700">
                <span className="text-gray-400 text-[11px] block mb-1">Suhbatdoshim:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPartnerGender('female')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                      partnerGender === 'female' ? 'bg-brand-purple text-dark-950' : 'bg-dark-700 text-gray-300'
                    }`}
                  >
                    👩 Ayol
                  </button>
                  <button
                    onClick={() => setPartnerGender('male')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                      partnerGender === 'male' ? 'bg-brand-purple text-dark-950' : 'bg-dark-700 text-gray-300'
                    }`}
                  >
                    👨 Erkak
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shrift o'lchami */}
          <div className="space-y-2">
            <label className="font-bold text-gray-200 block">
              2. Prompter matnining o‘lchami:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'normal', label: 'Standart (Aa)' },
                { key: 'large', label: 'Katta (AA)' },
                { key: 'huge', label: 'Gigant (AAA)' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setFontSize(item.key)}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    fontSize === item.key
                      ? 'bg-brand-lime text-dark-950 border-brand-lime'
                      : 'bg-dark-800 text-gray-300 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mikrofon eshitish tili */}
          <div className="space-y-2">
            <label className="font-bold text-gray-200 flex items-center justify-between">
              <span>3. Mikrofon eshitish ustuvorligi:</span>
              <span className="text-[11px] text-brand-lime">Avto tanish faol</span>
            </label>
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs focus:outline-none focus:border-brand-lime"
            >
              <option value="ru-RU">🇷🇺 Rus tili (Standart)</option>
              <option value="en-US">🇬🇧 Ingliz tili</option>
              <option value="uz-UZ">🇺🇿 O‘zbek tili</option>
              <option value="tr-TR">🇹🇷 Turk tili</option>
              <option value="kk-KZ">🇰🇿 Qozoq tili</option>
              <option value="ar-SA">🇸🇦 Arab tili</option>
            </select>
          </div>

          {/* 4. Ixtiyoriy Gemini API kalit */}
          <div className="space-y-2 pt-2 border-t border-dark-800">
            <label className="font-bold text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-purple" />
                Gemini AI Cloud kaliti (Ixtiyoriy):
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                geminiKey ? 'bg-brand-lime/20 text-brand-lime' : 'bg-dark-800 text-gray-400'
              }`}>
                {geminiKey ? 'Cloud AI Ulangan' : 'Ichki 0-ms Ong Faol'}
              </span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-brand-lime font-mono"
            />
            <p className="text-[10px] text-gray-400">
              Kalitsiz ham dastur o‘zining 0-ms tezkorlikdagi ichki aqlli ongi orqali yuzlab vaziyatlarga zudlik bilan javob beradi.
            </p>
          </div>
        </div>

        {/* Saqlash tugmasi */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-brand-lime text-dark-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-limeDark transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Saqlash va davom etish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

