import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Send, Laugh, RotateCcw, Zap, Key, X, Check, Globe, MessageSquareQuote, PenTool } from 'lucide-react';
import { SpeechService } from './services/speechService';
import { generateMultilingualResponse, DEFAULT_PARTNER_SPEECH } from './services/multilingualBrain.js';
import { generateGeminiSuperResponse } from './services/geminiService.js';
import { dialogueMemory } from './services/dialogueMemory.js';
import { toPhonetic } from './services/conversationEngine.js';
import { translateUserSpeech, TARGET_LANGUAGES } from './services/translatorService.js';

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

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimText, setInterimText] = useState('');
  
  // Faol til (O'zbek, Rus, Ingliz, Turk)
  const [activeSpeechLang, setActiveSpeechLang] = useState('ru');
  const [translationTargetLang, setTranslationTargetLang] = useState('ru');
  const [inputMode, setInputMode] = useState('user'); // 'user' (Javobingizni yozing / tarjima) yoki 'partner' (Suhbatdosh gapi)

  // Gemini AI kaliti (localStorage'dan olinadi)
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Suhbatdosh gapi
  const [partnerSpeech, setPartnerSpeech] = useState(DEFAULT_PARTNER_SPEECH.ru);
  const [variantIndex, setVariantIndex] = useState(0);
  const [isJokeActive, setIsJokeActive] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  
  // Yozib kiritish qatori
  const [manualInput, setManualInput] = useState('');

  // AI tahlil natijasi (Ko'p tilli va xotirali intellekt)
  const [result, setResult] = useState(() => {
    dialogueMemory.reset();
    return generateMultilingualResponse(DEFAULT_PARTNER_SPEECH.ru, 0, false, 'ru');
  });

  const speechServiceRef = useRef(null);

  // Nutq tili o'zgarganda — BARChA NARSA USHBU TILGA MOSLASHADI (lekin tarjima qilinadigan joyi o'zgarmaydi!)
  const handleSpeechLangChange = async (code) => {
    setActiveSpeechLang(code);
    const langObj = TARGET_LANGUAGES.find(l => l.code === code);
    if (speechServiceRef.current && langObj) {
      speechServiceRef.current.setLanguage(langObj.speechCode);
    }

    // Suhbatdosh gapi ushbu tilga o'tadi
    const newSpeech = DEFAULT_PARTNER_SPEECH[code] || DEFAULT_PARTNER_SPEECH.ru;
    setPartnerSpeech(newSpeech);
    setVariantIndex(0);
    setInterimText('');
    setManualInput('');
    dialogueMemory.reset();

    // AI tahlili ushbu til uchun yangilanadi
    const aiResult = await computeResponse(newSpeech, 0, isJokeActive, code);
    setResult(aiResult);
    dialogueMemory.addTurn('partner', newSpeech, aiResult.partnerMeaning, code);
    dialogueMemory.addTurn('user', aiResult.userResponse, aiResult.userMeaning, code);
    setStepCount(dialogueMemory.getStepCount());
  };

  // AI javobini olish (Gemini agar kalit bo'lsa, aks holda tezkor Mahalliy Ong)
  const computeResponse = async (text, vIndex, jokeMode, langCode = activeSpeechLang) => {
    if (geminiApiKey && geminiApiKey.trim()) {
      setIsAiLoading(true);
      try {
        const geminiRes = await generateGeminiSuperResponse({
          apiKey: geminiApiKey,
          partnerSpeech: text,
          selectedIndex: vIndex,
          isJokeRequested: jokeMode,
          languageCode: langCode
        });
        setIsAiLoading(false);
        return geminiRes;
      } catch (e) {
        setIsAiLoading(false);
        return generateMultilingualResponse(text, vIndex, jokeMode, langCode);
      }
    }
    return generateMultilingualResponse(text, vIndex, jokeMode, langCode);
  };

  // AI javobini yangilash
  const updateAiResponse = async (text, vIndex, jokeMode = false, langCode = activeSpeechLang) => {
    const aiResult = await computeResponse(text, vIndex, jokeMode, langCode);
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

    // AI tahlili (barcha tillarda, bahsda yutish va tarixdan eslash bilan)
    const aiResult = await computeResponse(cleanText, 0, isJokeActive, activeSpeechLang);
    setResult(aiResult);

    // Xotiraga saqlash
    dialogueMemory.addTurn('partner', cleanText, aiResult.partnerMeaning, aiResult.detectedLanguage?.code || activeSpeechLang);
    dialogueMemory.addTurn('user', aiResult.userResponse, aiResult.userMeaning, aiResult.detectedLanguage?.code || activeSpeechLang);
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
    const initialText = DEFAULT_PARTNER_SPEECH[activeSpeechLang] || DEFAULT_PARTNER_SPEECH.ru;
    setPartnerSpeech(initialText);
    setVariantIndex(0);
    setIsJokeActive(false);
    setManualInput('');
    setInterimText('');
    setStepCount(1);
    const aiResult = await computeResponse(initialText, 0, false, activeSpeechLang);
    setResult(aiResult);
    dialogueMemory.addTurn('partner', initialText, aiResult.partnerMeaning, activeSpeechLang);
    dialogueMemory.addTurn('user', aiResult.userResponse, aiResult.userMeaning, activeSpeechLang);
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
    updateAiResponse(partnerSpeech, variantIndex, isJokeActive);
  };

  // Web Speech xizmati
  useEffect(() => {
    const langObj = TARGET_LANGUAGES.find(l => l.code === activeSpeechLang);
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

    if (langObj) {
      speechServiceRef.current.setLanguage(langObj.speechCode);
    }

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, [isJokeActive, geminiApiKey, activeSpeechLang]);

  const toggleListening = () => {
    if (!speechServiceRef.current) return;
    if (isListening) {
      speechServiceRef.current.stop();
    } else {
      speechServiceRef.current.start();
    }
  };

  // Foydalanuvchi yozgan gapni qabul qilish
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const textToProcess = manualInput.trim();
    setManualInput('');

    if (inputMode === 'user') {
      // Foydalanuvchi o'z gapini yozdi -> Tanlangan tilga tarjima qilish!
      setIsAiLoading(true);
      const translated = await translateUserSpeech({
        text: textToProcess,
        targetLang: translationTargetLang,
        apiKey: geminiApiKey
      });
      setIsAiLoading(false);

      if (translated) {
        setResult(translated);
        dialogueMemory.addTurn('user', translated.userResponse, translated.userMeaning, translationTargetLang);
        setStepCount(dialogueMemory.getStepCount());
      }
    } else {
      // Suhbatdosh gapi deb qabul qilish
      handlePartnerSpoken(textToProcess);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#07090E] text-white flex flex-col justify-between selection:bg-brand-lime selection:text-black select-none overflow-hidden relative font-sans px-3 sm:px-4 py-1.5 sm:py-2.5">
      
      {/* 1. YUQORI BOSHQARUV: TILLAR + GEMINI + QADAM + YANGI SUHBAT */}
      <header className="w-full max-w-md mx-auto shrink-0 space-y-1">
        
        {/* Yuqori panel: Qadam + Tillar + Gemini holati + Yangi suhbat */}
        <div className="flex items-center justify-between gap-1 px-1">
          
          {/* Qadam va Til tanlash */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 shrink-0">
              <span className="text-brand-lime font-mono">{stepCount}</span>-qadam
            </span>

            {/* Suhbatdosh tili tanlash pills */}
            <div className="flex items-center gap-1 bg-dark-800/90 p-0.5 rounded-xl border border-dark-700">
              {TARGET_LANGUAGES.map((lang) => {
                const isActive = activeSpeechLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSpeechLangChange(lang.code)}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      isActive
                        ? 'bg-brand-lime text-black shadow-sm font-black'
                        : 'text-gray-400 hover:text-white hover:bg-dark-750'
                    }`}
                    title={`Suhbat tili: ${lang.name}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="uppercase text-[9px]">{lang.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* O'ng tomon: Gemini + Yangi suhbat */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Gemini tugmasi */}
            <button
              onClick={() => {
                setTempApiKey(geminiApiKey);
                setIsApiKeyModalOpen(true);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-bold active:scale-95 transition-all shadow-sm ${
                geminiApiKey
                  ? 'bg-emerald-950/70 border-emerald-400/50 text-emerald-400'
                  : 'bg-dark-800 border-dark-700 text-gray-400 hover:text-white'
              }`}
              title="Gemini Super Intellekt (Cheksiz aql va baxsda yutish)"
            >
              <Zap className="w-3 h-3" />
              <span>{geminiApiKey ? "AI Faol" : "AI"}</span>
            </button>

            {/* Yangi suhbat tugmasi */}
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-dark-800 hover:bg-dark-750 border border-brand-lime/30 text-brand-lime text-[11px] font-bold active:scale-95 transition-all shadow-sm"
              title="Suhbat tarixini tozalash va yangi suhbat boshlash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yangi</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. JONLI TELEPROMPTER KARTASI (Ko'z ilg'aydigan, keng va qulay!) */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center my-auto min-h-0 py-1.5 sm:py-2.5">
        
        <div className="w-full rounded-3xl bg-dark-850/95 border border-dark-700/90 p-3.5 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          
          {/* A. Suhbatdosh aytgan gap va uning o'zbekcha tarjimasi */}
          <div className="pb-2.5 border-b border-dark-700/60 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <span className="text-sm">{result?.detectedLanguage?.flag || '🇷🇺'}</span>
                <span>{result?.isUserSpeechMode ? "Siz yozgan gap:" : `Suhbatdoshingiz (${result?.detectedLanguage?.name || 'Rus tili'}):`}</span>
              </span>
              {result?.isUserSpeechMode ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-lime/15 text-brand-lime font-mono font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-brand-lime" />
                  <span>To‘g‘ri mazmun tanlandi</span>
                </span>
              ) : isAiLoading ? (
                <span className="text-emerald-400 text-[10px] font-mono animate-pulse">⚡ Gemini tahlil qilmoqda...</span>
              ) : interimText ? (
                <span className="text-brand-lime animate-pulse font-medium">eshitilmoqda...</span>
              ) : null}
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
              "{interimText ? interimText : (result?.partnerText || partnerSpeech)}"
            </p>

            <div className="mt-1 text-xs sm:text-[13px] text-brand-lilac flex items-center gap-1.5 font-medium">
              <span className="font-bold text-brand-purple shrink-0">uz:</span>
              <span className="line-clamp-2">{result?.partnerMeaning}</span>
            </div>
          </div>

          {/* B. SIZ AYTISHINGIZ KERAK BO'LGAN 100% ANIQ JAVOB / TARJIMA */}
          <div className="pt-2.5 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span className="text-brand-lime font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isJokeActive 
                  ? "Mavzuga mos Hazil / Qora yumor:" 
                  : (result?.isUserSpeechMode ? "Siz ayting (Tarjima qilingan):" : "Siz ayting (100% Aniq javob):")}
              </span>
              {result?.userNote && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-750 text-gray-300 font-mono">
                  {result.userNote}
                </span>
              )}
            </div>

            {/* Asosiy javob matni (Aniq, katta, ko'z ilg'aydigan font) */}
            <div className="py-1 sm:py-2">
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {renderHighlightedText(result?.userResponse, false)}
              </div>
            </div>

            {/* Lotincha talaffuzi */}
            {result?.userPronunciation && (
              <div className="text-xs text-gray-400 font-mono truncate mt-0.5">
                {result.userPronunciation}
              </div>
            )}

            {/* O'zbekcha to'liq ma'nosi */}
            <div className="mt-2.5 p-3 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 text-xs sm:text-sm font-semibold text-brand-lime flex items-start gap-2">
              <span className="shrink-0 font-bold">uz:</span>
              <div className="text-white font-medium leading-snug">
                {renderHighlightedText(result?.userMeaning, true)}
              </div>
            </div>

            {/* C. VARIANTLAR VA MAVZUGA MOS HAZILGA O'TISH */}
            <div className="mt-3 pt-2 border-t border-dark-700/60 shrink-0">
              
              {/* Variantlar tugmalari */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar">
                {result?.allVariants?.map((v, idx) => {
                  const isSelected = idx === result?.currentVariantIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectVariant(idx)}
                      className={`flex-1 py-1 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center truncate active:scale-98 ${
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
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all active:scale-98 ${
                  isJokeActive
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] font-black'
                    : 'bg-dark-750 hover:bg-dark-700 text-amber-300 border-dark-650'
                }`}
                title="Mavzuga mos hazil yoki qora yumorga o'tish"
              >
                <Laugh className="w-4 h-4" />
                <span>{isJokeActive ? "🔙 Asosiy javobga qaytish" : "🎭 Mavzuga mos Hazil / Qora yumor"}</span>
              </button>

            </div>

          </div>
        </div>

      </main>

      {/* 3. JAVOBINGIZNI YOZING (Tarjima qilish va tillarni tanlash imkoni bilan) */}
      <section className="w-full max-w-md mx-auto shrink-0 pt-1 pb-1 space-y-1">
        
        {/* Tarjima tili va Rejim tanlash */}
        <div className="flex items-center justify-between px-1 text-[11px]">
          
          {/* Rejimni almashtirish: Sizning gapingiz vs Suhbatdosh gapi */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setInputMode('user')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all ${
                inputMode === 'user'
                  ? 'bg-brand-lime text-black font-extrabold shadow-sm'
                  : 'bg-dark-800 text-gray-400 hover:text-white border border-dark-700'
              }`}
            >
              <PenTool className="w-2.5 h-2.5" />
              <span>Javobingizni yozing</span>
            </button>

            <button
              onClick={() => setInputMode('partner')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all ${
                inputMode === 'partner'
                  ? 'bg-sky-400 text-black font-extrabold shadow-sm'
                  : 'bg-dark-800 text-gray-400 hover:text-white border border-dark-700'
              }`}
            >
              <MessageSquareQuote className="w-2.5 h-2.5" />
              <span>Suhbatdosh gapi</span>
            </button>
          </div>

          {/* Tarjima tili pills (Foydalanuvchi qaysi tilga tarjima qilmoqchi) */}
          {inputMode === 'user' && (
            <div className="flex items-center gap-1 bg-dark-800/80 p-0.5 rounded-lg border border-dark-700/80">
              <span className="text-[9px] text-gray-400 pl-1">Til:</span>
              {TARGET_LANGUAGES.map((tLang) => (
                <button
                  key={tLang.code}
                  onClick={() => setTranslationTargetLang(tLang.code)}
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                    translationTargetLang === tLang.code
                      ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={`${tLang.name}ga tarjima qilish`}
                >
                  {tLang.flag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 bg-dark-800/95 border border-dark-700/90 rounded-2xl px-3 py-1.5 sm:py-2 focus-within:border-brand-lime shadow-inner">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={
              inputMode === 'user'
                ? `Javobingizni yozing (xato bo'lsa ham ${TARGET_LANGUAGES.find(l => l.code === translationTargetLang)?.name || 'Ruscha'}ga to'g'ri tarjima qiladi)...`
                : "Suhbatdosh aytgan gapni yozing..."
            }
            className="bg-transparent flex-1 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="p-2 sm:p-2.5 rounded-xl bg-brand-lime text-black hover:bg-lime-400 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0 font-bold shadow-md"
            title={inputMode === 'user' ? "Tarjima qilib ekranga chiqarish" : "AI tahlil qilish"}
          >
            <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </form>
      </section>

      {/* 4. PASTKI QISM: KATTA VA KO'Z ILG'AYDIGAN SHAZAM MIKROFON TUGMASI */}
      <footer className="w-full max-w-md mx-auto shrink-0 pt-1 pb-1.5 flex flex-col items-center justify-center z-20">
        
        {/* KATTA SHAZAM MIKROFON TUGMASI */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div
                className="absolute rounded-full bg-brand-lime/30 animate-ping pointer-events-none"
                style={{
                  width: `${95 + audioLevel * 75}px`,
                  height: `${95 + audioLevel * 75}px`
                }}
              />
              <div
                className="absolute rounded-full bg-emerald-500/25 blur-xl pointer-events-none transition-all duration-150"
                style={{
                  width: `${120 + audioLevel * 70}px`,
                  height: `${120 + audioLevel * 70}px`
                }}
              />
            </>
          )}

          <button
            onClick={toggleListening}
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-500 to-brand-lime text-black shadow-[0_0_40px_rgba(210,255,58,0.7)] ring-4 ring-brand-lime/50'
                : 'bg-dark-800 hover:bg-dark-750 text-white border-2 border-brand-lime/50 shadow-[0_0_25px_rgba(210,255,58,0.25)] hover:border-brand-lime'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce text-black" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase mt-1 tracking-wider">Tinglayapman</span>
              </>
            ) : (
              <>
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-brand-lime" />
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-200 mt-1 tracking-wider uppercase">Tinglash</span>
              </>
            )}
          </button>
        </div>

      </footer>

      {/* 5. GEMINI API KALITI MODAL OYNASI */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-dark-850 border border-dark-700 p-5 shadow-2xl relative">
            <button
              onClick={() => setIsApiKeyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-dark-750 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Gemini Super Intellekt</h3>
                <p className="text-[10px] text-gray-400">Google AI Studio API kaliti</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Gemini ulanganda ilova barcha kutilmagan savollarga, har qanday bahsda yutib chiqishga va o'tkir qora yumorga ega bo'ladi.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Gemini API Key (AIzaSy...)
                </label>
                <div className="flex items-center gap-2 bg-dark-750 border border-dark-650 rounded-xl px-3 py-2 focus-within:border-emerald-400">
                  <Key className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey('');
                    setGeminiApiKey('');
                    localStorage.removeItem('gemini_api_key');
                    setIsApiKeyModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-gray-300 text-xs font-bold transition-all"
                >
                  O'chirish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
