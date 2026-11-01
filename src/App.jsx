import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Send, Laugh, RotateCcw, Zap, Key, X, Check } from 'lucide-react';
import { SpeechService } from './services/speechService';
import { generateMultilingualResponse } from './services/multilingualBrain.js';
import { generateGeminiSuperResponse } from './services/geminiService.js';
import { dialogueMemory } from './services/dialogueMemory.js';
import { toPhonetic } from './services/conversationEngine.js';

// Faqat parametr tokenlarini ajratib chiroyli ko'rsatish
function renderHighlightedText(text, isUzbek = false) {
  if (!text) return '';
  const pattern = /(\((?:страна|город|возраст|имя|сфера|ответ|country|city|age|name|field|answer|davlat|shahar|yosh|ism|soha|javob)\))/gi;
  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    if (/^\((?:страна|город|возраст|имя|сфера|ответ|country|city|age|name|field|answer|davlat|shahar|yosh|ism|soha|javob)\)$/i.test(part)) {
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

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimText, setInterimText] = useState('');
  
  // Gemini AI kaliti (localStorage'dan olinadi)
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Suhbatdosh gapi
  const [partnerSpeech, setPartnerSpeech] = useState("Давай, не против! А что именно нужно делать?");
  const [variantIndex, setVariantIndex] = useState(0);
  const [isJokeActive, setIsJokeActive] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  
  // Yozib sinash qatori (ekranda doim turadi)
  const [manualInput, setManualInput] = useState('');

  // AI tahlil natijasi (Ko'p tilli va xotirali intellekt)
  const [result, setResult] = useState(() => {
    dialogueMemory.reset();
    return generateMultilingualResponse("Давай, не против! А что именно нужно делать?", 0, false);
  });

  const speechServiceRef = useRef(null);

  // AI javobini olish (Gemini agar kalit bo'lsa, aks holda tezkor Mahalliy Ong)
  const computeResponse = async (text, vIndex, jokeMode) => {
    if (geminiApiKey && geminiApiKey.trim()) {
      setIsAiLoading(true);
      try {
        const geminiRes = await generateGeminiSuperResponse({
          apiKey: geminiApiKey,
          partnerSpeech: text,
          selectedIndex: vIndex,
          isJokeRequested: jokeMode
        });
        setIsAiLoading(false);
        return geminiRes;
      } catch (e) {
        setIsAiLoading(false);
        return generateMultilingualResponse(text, vIndex, jokeMode);
      }
    }
    return generateMultilingualResponse(text, vIndex, jokeMode);
  };

  // AI javobini yangilash
  const updateAiResponse = async (text, vIndex, jokeMode = false) => {
    const aiResult = await computeResponse(text, vIndex, jokeMode);
    setResult(aiResult);
    setStepCount(dialogueMemory.getStepCount());
  };

  // Suhbatdosh gapirganda yoki yozilganda
  const handlePartnerSpoken = async (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    setPartnerSpeech(cleanText);
    setInterimText('');
    setVariantIndex(0);

    // AI tahlili (hamma tillarda, bahsda yutish va tarixdan eslash bilan)
    const aiResult = await computeResponse(cleanText, 0, isJokeActive);
    setResult(aiResult);

    // Xotiraga saqlash
    dialogueMemory.addTurn('partner', cleanText, aiResult.partnerMeaning, aiResult.detectedLanguage?.code);
    dialogueMemory.addTurn('user', aiResult.userResponse, aiResult.userMeaning, aiResult.detectedLanguage?.code);
    setStepCount(dialogueMemory.getStepCount());
  };

  // Variantni tanlash (Darhol 0-ms tezkorlikda variantlar ichidan almashtirish)
  const handleSelectVariant = (index) => {
    setVariantIndex(index);
    if (result?.allVariants && result.allVariants[index]) {
      const selected = result.allVariants[index];
      const pronunciation = toPhonetic(selected.text);
      const updated = {
        ...result,
        userResponse: selected.text,
        userMeaning: selected.meaning,
        userPronunciation: `[${pronunciation}]`,
        userNote: selected.note || `Variant ${index + 1}`,
        currentVariantIndex: index
      };
      setResult(updated);

      if (dialogueMemory.history.length > 0 && dialogueMemory.history[dialogueMemory.history.length - 1].speaker === 'user') {
        dialogueMemory.history[dialogueMemory.history.length - 1].text = selected.text;
        dialogueMemory.history[dialogueMemory.history.length - 1].meaning = selected.meaning;
      }
      return;
    }
    updateAiResponse(partnerSpeech, index, isJokeActive);
  };

  // 🎭 Hazil rejimiga o'tish (Mavzuga qarab dinamik o'zgaradi!)
  const handleToggleJoke = async (e) => {
    if (e) e.stopPropagation();
    const newJokeState = !isJokeActive;
    setIsJokeActive(newJokeState);
    setVariantIndex(0);
    await updateAiResponse(partnerSpeech, 0, newJokeState);
  };

  // 🔄 Yangi suhbat (Tarixni tozalash va yangi suhbat ochish)
  const handleNewConversation = async () => {
    dialogueMemory.reset();
    const initialText = "Давай, не против! А что именно нужно делать?";
    setPartnerSpeech(initialText);
    setVariantIndex(0);
    setIsJokeActive(false);
    setManualInput('');
    setInterimText('');
    setStepCount(1);
    const aiResult = await computeResponse(initialText, 0, false);
    setResult(aiResult);
  };

  // Gemini kalitini saqlash
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const key = tempApiKey.trim();
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setIsApiKeyModalOpen(false);
    // Hozirgi gapni qayta tahlil qilish
    updateAiResponse(partnerSpeech, variantIndex, isJokeActive);
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
  }, [isJokeActive, geminiApiKey]);

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
      
      {/* 1. YUQORI BOSHQARUV: GEMINI + QADAM + YANGI SUHBAT + DOIMIY GAP */}
      <div className="w-full max-w-md mx-auto shrink-0 pt-0.5 space-y-1">
        
        {/* Yuqori panel: Qadam + Gemini holati + Yangi suhbat */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-gray-300">
              Bosqich: <span className="text-brand-lime">{stepCount}-qadam</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Gemini tugmasi */}
            <button
              onClick={() => {
                setTempApiKey(geminiApiKey);
                setIsApiKeyModalOpen(true);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[10px] font-bold active:scale-95 transition-all shadow-sm ${
                geminiApiKey
                  ? 'bg-emerald-950/70 border-emerald-400/50 text-emerald-400'
                  : 'bg-dark-800 border-dark-700 text-gray-400 hover:text-white'
              }`}
              title="Gemini Super Intellekt (Cheksiz aql va baxsda yutish)"
            >
              <Zap className="w-3 h-3" />
              <span>{geminiApiKey ? "Gemini Faol" : "Gemini ulash"}</span>
            </button>

            {/* Yangi suhbat tugmasi */}
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1 px-2 py-0.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-brand-lime/30 text-brand-lime text-[10px] font-bold active:scale-95 transition-all shadow-sm"
              title="Suhbat tarixini tozalash va yangi suhbat boshlash"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Yangi suhbat</span>
            </button>
          </div>
        </div>

        {/* ALOHIDA VA DOIMIY BOSHLANG'ICH GAP (Ekranda alohida turadi, umuman yo'qolmaydi) */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-dark-800 to-dark-850 border border-brand-lime/35 p-2 sm:p-2.5 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-brand-lime font-bold uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1">
              <span>🎯</span>
              <span>Siz aytadigan Boshlang‘ich Gap:</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand-lime/15 text-brand-lime font-mono border border-brand-lime/30 font-bold">
              DOIMIY
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-extrabold text-white leading-snug">
            "{PERMANENT_OPENER_RU}"
          </p>

          <div className="mt-0.5 text-[10px] sm:text-[11px] text-brand-lilac flex items-center gap-1 font-medium leading-tight">
            <span className="font-bold text-brand-purple shrink-0">uz:</span>
            <span className="truncate">{PERMANENT_OPENER_UZ}</span>
          </div>
        </div>

      </div>

      {/* 2. JONLI TELEPROMPTER KARTASI (Ko'p tilli + Bahsda yutish, skrollsiz!) */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center my-auto min-h-0 py-1">
        
        <div className="w-full rounded-3xl bg-dark-850/95 border border-dark-700/90 p-3 sm:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          
          {/* A. Suhbatdosh aytgan gap va uning o'zbekcha tarjimasi */}
          <div className="pb-2 border-b border-dark-700/60 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span className="font-semibold text-gray-300 flex items-center gap-1">
                <span>{result?.detectedLanguage?.flag || '🇷🇺'}</span>
                <span>Suhbatdoshingiz ({result?.detectedLanguage?.name || 'Rus tili'}):</span>
              </span>
              {isAiLoading ? (
                <span className="text-emerald-400 text-[10px] font-mono animate-pulse">⚡ Gemini tahlil qilmoqda...</span>
              ) : interimText ? (
                <span className="text-brand-lime animate-pulse font-medium">eshitilmoqda...</span>
              ) : null}
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
              "{interimText ? interimText : (result?.partnerText || partnerSpeech)}"
            </p>

            <div className="mt-0.5 text-xs text-brand-lilac flex items-center gap-1.5 font-medium">
              <span className="font-bold text-brand-purple shrink-0">uz:</span>
              <span className="line-clamp-2">{result?.partnerMeaning}</span>
            </div>
          </div>

          {/* B. SIZ AYTISHINGIZ KERAK BO'LGAN 100% ANIQ JAVOB VA RADDIYA */}
          <div className="pt-1.5 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span className="text-brand-lime font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isJokeActive ? "Mavzuga mos Hazil / Qora yumor:" : "Siz ayting (100% Yutib chiqish):"}
              </span>
              {result?.userNote && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-750 text-gray-300 font-mono">
                  {result.userNote}
                </span>
              )}
            </div>

            {/* Asosiy javob matni (Aniq javob yoki Baxsda mot qilish) */}
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

            {/* O'zbekcha to'liq ma'nosi */}
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
                title="Mavzuga mos hazil yoki qora yumorga o'tish"
              >
                <Laugh className="w-3.5 h-3.5" />
                <span>{isJokeActive ? "🔙 Asosiy javobga qaytish" : "🎭 Mavzuga mos Hazil / Qora yumor"}</span>
              </button>

            </div>

          </div>
        </div>

      </main>

      {/* 3. TEST YOZISH OYNCHASI (Ekranda doim turadi, istalgan tilda kiritish mumkin) */}
      <div className="w-full max-w-md mx-auto shrink-0 pt-0.5 pb-1">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 bg-dark-800/95 border border-dark-700/90 rounded-2xl px-3 py-1.5 focus-within:border-brand-lime shadow-inner">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Suhbatdosh javobini yozing (istalgan tilda)..."
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

      {/* GEMINI API KALITI MODALI */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-dark-900 border border-dark-700 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-dark-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Gemini Super Intellekt (Cheksiz aql)</span>
              </span>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-300 mt-2 leading-relaxed">
              Google AI Studio’dan bepul Gemini API kalitini kiritishingiz mumkin. Bu ilovani har qanday bahsda yutib chiqadigan, qora yumor va cheksiz bilimlarga ega super-intellektga aylantiradi.
            </p>

            <form onSubmit={handleSaveApiKey} className="mt-3">
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy... (Gemini API kaliti)"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px]">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline hover:text-emerald-300"
                >
                  Bepul kalit olish (Google AI Studio)
                </a>
                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempApiKey('');
                      setGeminiApiKey('');
                      localStorage.removeItem('gemini_api_key');
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Kalitni o'chirish
                  </button>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-dark-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-lime text-black font-extrabold text-xs flex items-center justify-center gap-1 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
