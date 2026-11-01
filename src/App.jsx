import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Send, Laugh } from 'lucide-react';
import { SpeechService } from './services/speechService';
import { generateAcquaintanceResponse } from './services/nativeBrain.js';

// Faqat parametr tokenlarini ajratib chiroyli ko'rsatish
function renderHighlightedText(text, isUzbek = false) {
  if (!text) return '';
  const pattern = /(\((?:страна|город|возраст|имя|сфера|ответ|davlat|shahar|yosh|ism|soha|javob)\))/gi;
  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (/^\((?:страна|город|возраст|имя|сфера|ответ|davlat|shahar|yosh|ism|soha|javob)\)$/i.test(part)) {
      return (
        <span
          key={idx}
          className={`inline-block px-2 py-0.5 mx-0.5 rounded-lg font-mono font-bold tracking-normal ${
            isUzbek 
              ? 'bg-brand-lime/25 text-brand-lime border border-brand-lime/40 text-xs sm:text-sm' 
              : 'bg-amber-400/25 text-amber-300 border border-amber-400/50 text-base sm:text-lg'
          }`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

// ALOHIDA VA DOIMIY BOSHLANG'ICH GAP (Umuman yo'qolmaydi)
const PERMANENT_OPENER_RU = "Привет! Я тестирую своё новое приложение. Ты не против продолжить диалог со мной для проверки его работы?";
const PERMANENT_OPENER_UZ = "Salom! Yangi ilovamni test qilyapman. Uning ishlashini tekshirish uchun suhbatlashishga qarshi emasmisan?";
const PERMANENT_OPENER_PHONETIC = "[Privet! Ya testiruyu svoyo novoye prilojeniye. Ti ne protiv prodoljit dialog so mnoy dlya proverki yego raboti?]";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimText, setInterimText] = useState('');
  
  // Suhbatdosh gapi (sukut bo'yicha uchrashuvning birinchi rozilik javobidan boshlanadi)
  const [partnerSpeech, setPartnerSpeech] = useState("Давай, не против! А что именно нужно делать?");
  const [variantIndex, setVariantIndex] = useState(0);
  const [isJokeActive, setIsJokeActive] = useState(false);
  
  // Yozib sinash qatori (ekranda doim turadi)
  const [manualInput, setManualInput] = useState('');

  // AI tahlil natijasi (Mantiqiy, 100% to'g'ri va ulovchi savolli)
  const [result, setResult] = useState(() => generateAcquaintanceResponse("Давай, не против! А что именно нужно делать?", 0, false));

  const speechServiceRef = useRef(null);

  // AI javobini yangilash
  const updateAiResponse = (text, vIndex, jokeMode = false) => {
    const aiResult = generateAcquaintanceResponse(text, vIndex, jokeMode);
    setResult(aiResult);
  };

  // Suhbatdosh gapirganda yoki yozilganda
  const handlePartnerSpoken = (text) => {
    if (!text || !text.trim()) return;
    setPartnerSpeech(text);
    setInterimText('');
    setVariantIndex(0);
    // Suhbatdosh gapini yangilaganda, agar hazil rejimi bo'lsa yangi mavzuga mos hazilga o'tadi
    updateAiResponse(text, 0, isJokeActive);
  };

  // Variantni tanlash
  const handleSelectVariant = (index) => {
    setVariantIndex(index);
    updateAiResponse(partnerSpeech, index, isJokeActive);
  };

  // 🎭 Hazil rejimiga o'tish (Mavzuga qarab dinamik o'zgaradi!)
  const handleToggleJoke = (e) => {
    if (e) e.stopPropagation();
    const newJokeState = !isJokeActive;
    setIsJokeActive(newJokeState);
    setVariantIndex(0);
    updateAiResponse(partnerSpeech, 0, newJokeState);
  };

  // Web Speech xizmati
  useEffect(() => {
    speechServiceRef.current = new SpeechService({
      onTranscript: (finalTranscript, interim) => {
        if (interim) setInterimText(interim);
        if (finalTranscript) {
          handlePartnerSpoken(finalTranscript);
        }
      },
      onError: (err) => console.warn('Speech err:', err),
      onStateChange: (listening) => setIsListening(listening),
      onAudioLevel: (level) => setAudioLevel(level)
    });

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, [isJokeActive]);

  const toggleListening = () => {
    if (!speechServiceRef.current) return;
    if (isListening) {
      speechServiceRef.current.stop();
    } else {
      speechServiceRef.current.start();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handlePartnerSpoken(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#07090E] text-white flex flex-col justify-between selection:bg-brand-lime selection:text-black select-none overflow-hidden relative font-sans px-3 sm:px-4 py-1.5 sm:py-2">
      
      {/* 1. ALOHIDA VA DOIMIY BOSHLANG'ICH GAP (Ekranda alohida turadi, umuman yo'qolmaydi) */}
      <div className="w-full max-w-md mx-auto shrink-0 pt-0.5">
        <div className="w-full rounded-2xl bg-gradient-to-r from-dark-800 to-dark-850 border border-brand-lime/35 p-2.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-brand-lime font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              Siz aytadigan Boshlang‘ich Gap:
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime font-mono border border-brand-lime/30 font-bold">
              DOIMIY
            </span>
          </div>

          {/* Doimiy aytiladigan gap */}
          <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">
            "{PERMANENT_OPENER_RU}"
          </p>

          {/* O'zbekcha tarjimasi */}
          <div className="mt-1 text-[11px] text-brand-lilac flex items-center gap-1.5 font-medium leading-tight">
            <span className="font-bold text-brand-purple shrink-0">uz:</span>
            <span>{PERMANENT_OPENER_UZ}</span>
          </div>
        </div>
      </div>

      {/* 2. JONLI TELEPROMPTER KARTASI (Suhbat davomi, skrollsiz, to'liq ekran!) */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center my-auto min-h-0 py-1">
        
        <div className="w-full rounded-3xl bg-dark-850/95 border border-dark-700/90 p-3 sm:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          
          {/* A. Suhbatdosh aytgan gap va uning o'zbekcha tarjimasi */}
          <div className="pb-2 border-b border-dark-700/60 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span className="font-semibold text-gray-300 flex items-center gap-1">
                <span>{result?.detectedLanguage?.flag || '🇷🇺'}</span>
                <span>Suhbatdoshingiz javobi:</span>
              </span>
              {interimText && <span className="text-brand-lime animate-pulse font-medium">eshitilmoqda...</span>}
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
              "{interimText ? interimText : (result?.partnerText || partnerSpeech)}"
            </p>

            <div className="mt-0.5 text-xs text-brand-lilac flex items-center gap-1.5 font-medium">
              <span className="font-bold text-brand-purple shrink-0">uz:</span>
              <span className="line-clamp-2">{result?.partnerMeaning}</span>
            </div>
          </div>

          {/* B. SIZ AYTISHINGIZ KERAK BO'LGAN 100% ANIQ JAVOB VA SAVOL */}
          <div className="pt-1.5 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span className="text-brand-lime font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isJokeActive ? "Mavzuga mos Hazil:" : "Siz ayting (100% Aniq):"}
              </span>
              {result?.userNote && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-750 text-gray-300 font-mono">
                  {result.userNote}
                </span>
              )}
            </div>

            {/* Asosiy javob matni (Aniq javob + Ulovchi savol) */}
            <div className="py-0.5">
              <div className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                {renderHighlightedText(result?.userResponse, false)}
              </div>
            </div>

            {/* Lotincha talaffuzi */}
            {result?.userPronunciation && (
              <div className="text-[10px] sm:text-[11px] text-gray-400 font-mono truncate mt-0.5">
                {result.userPronunciation}
              </div>
            )}

            {/* O'zbekcha to'liq ma'nosi (Javob + Davomiy savol ma'nosi) */}
            <div className="mt-1.5 p-2 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 text-xs font-semibold text-brand-lime flex items-start gap-1.5">
              <span className="shrink-0 font-bold">uz Ma’nosi:</span>
              <div className="text-white font-medium leading-tight">
                {renderHighlightedText(result?.userMeaning, true)}
              </div>
            </div>

            {/* C. VARIANTLAR VA MAVZUGA MOS HAZILGA O'TISH */}
            <div className="mt-2 pt-1 border-t border-dark-700/60 shrink-0">
              
              {/* Variantlar tugmalari */}
              <div className="flex items-center gap-1.5 mb-1.5 overflow-x-auto no-scrollbar">
                {result?.allVariants?.map((v, idx) => {
                  const isSelected = idx === result?.currentVariantIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectVariant(idx)}
                      className={`flex-1 py-1 px-2 rounded-xl border text-[10px] sm:text-[11px] font-bold transition-all text-center truncate active:scale-98 ${
                        isSelected
                          ? 'bg-brand-lime text-black border-brand-lime shadow-sm'
                          : 'bg-dark-800 hover:bg-dark-750 text-gray-300 border-dark-700'
                      }`}
                    >
                      {v.note || `Variant ${idx + 1}`}
                    </button>
                  );
                })}
              </div>

              {/* Mavzuga qarab dinamik o'zgaruvchi Hazil tugmasi */}
              <button
                onClick={handleToggleJoke}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-98 ${
                  isJokeActive
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] font-black'
                    : 'bg-dark-750 hover:bg-dark-700 text-amber-300 border-dark-650'
                }`}
                title="Mavzuga mos hazilga o'tish"
              >
                <Laugh className="w-3.5 h-3.5" />
                <span>{isJokeActive ? "🔙 Asosiy javobga qaytish" : "🎭 Mavzuga mos Hazil"}</span>
              </button>

            </div>

          </div>
        </div>

      </main>

      {/* 3. TEST YOZISH OYNCHASI (Ekranda doim turadi, namunalar yo'q) */}
      <div className="w-full max-w-md mx-auto shrink-0 pt-0.5 pb-1">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 bg-dark-800/95 border border-dark-700/90 rounded-2xl px-3 py-1.5 focus-within:border-brand-lime shadow-inner">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Suhbatdosh javobini yozing (Masalan: Чем ты занимаешься?)..."
            className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="p-1.5 rounded-xl bg-brand-lime text-black hover:bg-lime-400 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Javob olish"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 4. PASTKI QISM: MIKROFON DOIM ANIQ SHU YERDA TURADI (Skroll yo'q, pastki quloqqa yaqin!) */}
      <footer className="w-full max-w-md mx-auto shrink-0 pt-0.5 pb-1 flex flex-col items-center justify-center z-20">
        
        {/* KATTA SHAZAM MIKROFON TUGMASI */}
        <div className="relative flex items-center justify-center mb-0.5">
          {isListening && (
            <>
              <div
                className="absolute rounded-full bg-brand-lime/25 animate-ping pointer-events-none"
                style={{
                  width: `${75 + audioLevel * 60}px`,
                  height: `${75 + audioLevel * 60}px`
                }}
              />
              <div
                className="absolute rounded-full bg-emerald-500/20 blur-xl pointer-events-none transition-all duration-150"
                style={{
                  width: `${90 + audioLevel * 50}px`,
                  height: `${90 + audioLevel * 50}px`
                }}
              />
            </>
          )}

          <button
            onClick={toggleListening}
            className={`relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-500 to-brand-lime text-black shadow-[0_0_35px_rgba(210,255,58,0.55)] ring-4 ring-brand-lime/40'
                : 'bg-dark-800 hover:bg-dark-750 text-white border-2 border-brand-lime/40 shadow-[0_0_20px_rgba(210,255,58,0.2)] hover:border-brand-lime'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6 animate-bounce" />
                <span className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">Tinglayapman</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-brand-lime" />
                <span className="text-[9px] font-bold text-gray-300 mt-0.5">Tinglash</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 font-medium">
          {isListening ? (
            <span className="text-brand-lime flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              Pastki mikrofon suhbatni eshitmoqda...
            </span>
          ) : (
            "Suhbatni eshitish uchun bosing"
          )}
        </p>

      </footer>

    </div>
  );
}
