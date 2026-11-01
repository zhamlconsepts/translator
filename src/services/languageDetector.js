/**
 * Tillarni avtomatik aniqlash xizmati (Auto Language Detector)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Rus tili', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'en', name: 'Ingliz tili', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'uz', name: 'O‘zbek tili', nativeName: 'O‘zbekcha', flag: '🇺🇿', speechCode: 'uz-UZ' },
  { code: 'tr', name: 'Turk tili', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'kk', name: 'Qozoq tili', nativeName: 'Қазақша', flag: '🇰🇿', speechCode: 'kk-KZ' },
  { code: 'ar', name: 'Arab tili', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'de', name: 'Nemis tili', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'fr', name: 'Fransuz tili', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'es', name: 'Ispan tili', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
];

export function detectLanguage(text) {
  if (!text || !text.trim()) {
    return SUPPORTED_LANGUAGES[0]; // Standart: Rus tili
  }

  const clean = text.trim().toLowerCase();

  // 1. Arab tili tekshiruvi (Arabic script)
  if (/[\u0600-\u06FF]/.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'ar') || SUPPORTED_LANGUAGES[0];
  }

  // 2. Qozoq tili xos harflari
  if (/[әғқңөұүһі]/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'kk') || SUPPORTED_LANGUAGES[0];
  }

  // 3. Kirill alifbosi (Rus vs O'zbek kirill vs boshqalar)
  if (/[а-яё]/i.test(clean)) {
    if (/\b(салом|рахмат|яхши|кандай|нима|бу|учун|болади|майли|каерда|билмайман)\b/i.test(clean)) {
      return SUPPORTED_LANGUAGES.find(l => l.code === 'uz') || SUPPORTED_LANGUAGES[0];
    }
    return SUPPORTED_LANGUAGES.find(l => l.code === 'ru') || SUPPORTED_LANGUAGES[0];
  }

  // 4. Turk tili xos harflari yoki so'zlari
  if (/[ğışçöü]/.test(clean) || /\b(merhaba|nasılsın|evet|hayır|teşekkür|günaydın|tamam|güzel|neredesin|nerelisin)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'tr') || SUPPORTED_LANGUAGES[0];
  }

  // 5. Nemis tili xos harflar / so'zlar
  if (/[äöüß]/.test(clean) || /\b(hallo|wie|geht|danke|bitte|guten|morgen|nicht|ja|nein)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'de') || SUPPORTED_LANGUAGES[0];
  }

  // 6. Fransuz tili
  if (/[éèêëàâçîïôùû]/.test(clean) || /\b(bonjour|salut|merci|comment|oui|non|très|bien)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'fr') || SUPPORTED_LANGUAGES[0];
  }

  // 7. Ispan tili
  if (/[áéíóúñ¿¡]/.test(clean) || /\b(hola|cómo|estás|gracias|amigo|por|favor|bien)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'es') || SUPPORTED_LANGUAGES[0];
  }

  // 8. Ingliz tili (Latin)
  if (/\b(the|is|are|you|from|what|how|where|which|city|who|when|have|can|will|do|did|with|for|at|in|on|to|and|my|your|we|they|hello|hi|hey|good|morning|fine|thanks|thank|yes|no|cool|awesome|please|sure|nice|meet|see)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'en') || SUPPORTED_LANGUAGES[0];
  }

  // 9. O'zbek tili (Lotin: o'ziga xos so'zlar yoki o', g' harflari)
  if (/(?:[og]['`ʻ‘]|[‘`ʻ])/i.test(clean) || /\b(salom|qalay|qalaysiz|rahmat|yaxshi|nima|qanday|qachon|qayerda|ha|yo‘q|yoq|iltimos|zo‘r|zor|ishlar|kel|ketdik|mayli|tushundim|bormisiz|boladi)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'uz') || SUPPORTED_LANGUAGES[0];
  }

  // Standart holatda ingliz yoki rus
  return SUPPORTED_LANGUAGES[1]; // Default to English for unrecognized latin text
}
