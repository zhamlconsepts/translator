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

  // 3. Turk tili xos harflari yoki so'zlari
  if (/[ğışçöü]/.test(clean) || /\b(merhaba|nasılsın|evet|hayır|teşekkür|günaydın|tamam|güzel)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'tr') || SUPPORTED_LANGUAGES[0];
  }

  // 4. Kirill alifbosi (Rus vs O'zbek kirill vs boshqalar)
  if (/[а-яё]/i.test(clean)) {
    // Agar rus tiliga xos harflar yoki so'zlar bo'lsa
    if (/[ыэъё]/i.test(clean) || /\b(привет|как|дела|что|это|да|нет|спасибо|пожалуйста|почему|куда|хорошо|здравствуйте|пока|конечно|правда|ладно|отлично|красиво|где|когда|хочу|будет|можно)\b/i.test(clean)) {
      return SUPPORTED_LANGUAGES.find(l => l.code === 'ru') || SUPPORTED_LANGUAGES[0];
    }
    // O'zbek kirill xos so'zlari
    if (/\b(салом|рахмат|яхши|кандай|нима|бу|учун|болади|майли)\b/i.test(clean)) {
      return SUPPORTED_LANGUAGES.find(l => l.code === 'uz') || SUPPORTED_LANGUAGES[0];
    }
    return SUPPORTED_LANGUAGES.find(l => l.code === 'ru') || SUPPORTED_LANGUAGES[0];
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

  // 8. O'zbek tili (Lotin)
  if (/[oʻo‘gʻg‘]/.test(clean) || /\b(salom|qalay|qalaysiz|rahmat|yaxshi|nima|qanday|qachon|qayerda|ha|yo‘q|yoq|iltimos|zo‘r|zor|ishlar|kel|ketdik|mayli|tushundim)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'uz') || SUPPORTED_LANGUAGES[0];
  }

  // 9. Ingliz tili (Latin)
  if (/\b(hello|hi|hey|how|are|you|what|doing|good|morning|fine|thanks|thank|yes|no|cool|awesome|where|why|who|please|sure|nice|meet|see)\b/i.test(clean)) {
    return SUPPORTED_LANGUAGES.find(l => l.code === 'en') || SUPPORTED_LANGUAGES[0];
  }

  // Standart holatda ingliz yoki rus
  return SUPPORTED_LANGUAGES[0];
}

