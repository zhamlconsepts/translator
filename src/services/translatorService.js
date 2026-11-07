/**
 * SuhbatDosh - O'ta Aniq va Imlo Xatolarini To'g'rilovchi Ongli Tarjimon (Intelligent Typo-Tolerant Translator)
 * 
 * Foydalanuvchi qanday xato, qisqartma yoki noaniq yozsa ham (masalan: "kel kofi ichamz", "slom qalysz", "sn juda chroyilsn"):
 * 1. Imlo xatolari va qisqartmalarni avtomatik tuzatadi (Levenshtein + Normalizatsiya).
 * 2. Eng yaqin, chuqur va to'g'ri mazmunni aniqlaydi.
 * 3. Tanlangan chet tiliga (Rus, Ingliz, Turk, O'zbek) eng jozibali, professional va tabiiy shaklda tarjima qiladi.
 * 4. Lotincha talaffuzi va muqobil variantlarini Teleprompterga chiqaradi!
 */

import { toPhonetic } from './conversationEngine.js';

// Til metama'lumotlari
export const TARGET_LANGUAGES = [
  { code: 'ru', name: 'Ruscha', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿', speechCode: 'uz-UZ' },
  { code: 'en', name: 'Inglizcha', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'tr', name: 'Turkcha', flag: '🇹🇷', speechCode: 'tr-TR' },
];

// Levenshtein masofasi (ikkita so'z orasidagi o'xshashlikni hisoblash)
function levenshteinDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function wordSimilarity(w1, w2) {
  const maxLen = Math.max(w1.length, w2.length);
  if (maxLen === 0) return 1.0;
  return (maxLen - levenshteinDistance(w1, w2)) / maxLen;
}

// O'zbek va rus tillaridagi eng keng tarqalgan xatolar va qisqartmalar lug'ati
const TYPO_MAP = {
  // Salomlashish
  "slom": "salom", "salm": "salom", "solam": "salom", "salam": "salom", "slaom": "salom", "salomik": "salom",
  "assalomalekum": "assalomu alaykum", "assalom": "assalomu alaykum", "salomaleykum": "assalomu alaykum",
  "priv": "salom", "privet": "salom",
  // Hol-ahvol
  "qalesan": "qalaysan", "qales": "qalaysan", "qalsan": "qalaysan", "qale": "qalaysan",
  "qalysz": "qalaysiz", "qalesz": "qalaysiz", "qandysz": "qalaysiz", "yaxshmsz": "yaxshimisiz",
  "yaxshman": "yaxshiman", "yaxshmiz": "yaxshimiz",
  "nmagap": "nima gap", "nma gap": "nima gap", "nmagapla": "nima gap",
  "nma qvos": "nima qilyapsan", "nma qilyapsan": "nima qilyapsan", "nima qvos": "nima qilyapsan",
  // Kofe / Aylanish
  "kofi": "kofe", "kafe": "kofe", "qahva": "kofe", "qaxva": "kofe", "kove": "kofe", "cofee": "kofe",
  "ichamz": "ichamiz", "ichmiz": "ichamiz", "ichilu": "ichaylik", "ichsak": "ichsak",
  "boramz": "boramiz", "bormz": "boramiz", "bormiz": "boramiz", "borilu": "boramiz",
  "ketdik": "ketdik", "ketik": "ketdik", "ketu": "ketdik", "kettik": "ketdik",
  "keln": "keling", "kelin": "keling", "yur": "keling", "yuring": "keling",
  "aylanamz": "aylanamiz", "aylanilu": "aylanaylik", "aylangani": "aylanishga",
  // Maqtov / Kompliment
  "chroyil": "chiroyli", "chroyilsan": "chiroylisan", "chroyilsz": "chiroylisiz", "chiroyl": "chiroyli",
  "chirayli": "chiroyli", "chroyili": "chiroyli", "chiroylis": "chiroylisiz",
  "gozal": "go'zal", "guzal": "go'zal", "gözal": "go'zal", "ajoyb": "ajoyib", "ajoyip": "ajoyib",
  "kelshgan": "kelishgan", "yoqasz": "yoqasiz", "yoqasan": "yoqasan",
  // Kasb / IT
  "dasturchiman": "dasturchiman", "dasturciman": "dasturchiman", "programist": "dasturchi",
  "itshnik": "dasturchi", "coder": "dasturchi", "ishleman": "ishlayman", "ishliman": "ishlayman",
  "ishiman": "ishlayman", "oqiman": "o'qiyman", "oqeman": "o'qiyman",
  // Shahar / Joy
  "toshkenda": "toshkentda", "toshkan": "toshkent", "toshkentda": "toshkentda", "tashkent": "toshkent",
  "yashiman": "yashayman", "turaman": "yashayman", "turamz": "yashaymiz",
  // Rozilik / Tasdiq
  "kelshdik": "kelishdik", "kelshdk": "kelishdik", "kelshdikmi": "kelishdik", "bopti": "kelishdik", "bo'pti": "kelishdik",
  "mayli": "kelishdik", "roziman": "roziman", "boldi": "bo'ldi",
  // Rahmat
  "raxmat": "rahmat", "rhmat": "rahmat", "ramat": "rahmat", "kotta": "katta", "kottakon": "katta",
  // Tanishuv
  "tanishli": "tanishaylik", "tanishayli": "tanishaylik", "tanishsek": "tanishaylik", "ismim": "ismim",
  // Boshqalar
  "nma": "nima", "nmaga": "nega", "qatta": "qayerda", "qattasan": "qayerdasan", "qattasn": "qayerdasan", "qattasiz": "qayerdasiz",
  "uylanganmsan": "uylanganmisan", "uylanganman": "uylanganman", "uylangan": "uylangan",
  "zerikdm": "zerikdim", "charchadm": "charchadim", "charcadim": "charchadim",
  "kutb": "kutib", "kutb tur": "kutib tur",
  "ovqatlanamz": "ovqatlanamiz", "choy": "choy"
};

// Matndagi xatoliklarni aniqlab to'g'rilash (Spell Normalizer)
export function normalizeUserText(input) {
  if (!input) return "";
  const lower = input.toLowerCase().replace(/['`ʻ‘]/g, "'");
  const words = lower.split(/[\s,!?.;:]+/).filter(Boolean);

  const correctedWords = words.map(w => {
    // 1. To'g'ridan-to'g'ri xatolar lug'atidan
    if (TYPO_MAP[w]) return TYPO_MAP[w];

    // 2. Levenshtein o'xshashlik tekshiruvi (agar 1-2 harf farq qilsa)
    for (const [typo, corrected] of Object.entries(TYPO_MAP)) {
      if (wordSimilarity(w, typo) >= 0.8) {
        return corrected;
      }
    }
    return w;
  });

  return correctedWords.join(" ");
}

// SEMANTIK MAZMUNLAR MATRITSI (Har bir vaziyat uchun eng yuksak, jozibali va tabiiy tarjimalar)
const INTENT_DATABASE = [
  // 1. SALOMLASHISH VA HOL-AHVOL
  {
    id: "greeting",
    keywords: ["salom", "assalomu alaykum", "qalaysan", "qalaysiz", "yaxshimisiz", "tuzukmisiz", "nima gap"],
    meaning: "Salomlashish va samimiy hol-ahvol so'rash",
    ru: {
      text: "Привет! Рад тебя видеть, как твои дела?",
      meaning: "Salom! Seni ko'rganimdan xursandman, ishlaring qalay?",
      variants: [
        { text: "Привет! Рад тебя видеть, как твои дела?", note: "Samimiy salom" },
        { text: "Здравствуйте! Приятно познакомиться.", note: "Rasmiy va odobli" },
        { text: "Салют! Как настроение?", note: "Jonli so'zlashuv" }
      ],
      joke: { text: "Привет! Только что думал о тебе)", note: "Iliq hazil" }
    },
    en: {
      text: "Hey there! Great to see you, how have you been?",
      meaning: "Salom! Ko'rganimdan xursandman, ahvollaring qanday?",
      variants: [
        { text: "Hey there! Great to see you, how have you been?", note: "Warm greeting" },
        { text: "Hello! Really glad to connect with you.", note: "Polite" },
        { text: "Hi! How's your day going so far?", note: "Casual" }
      ],
      joke: { text: "Hey! I was just thinking about you)", note: "Friendly joke" }
    },
    tr: {
      text: "Merhaba! Seni gördüğüme çok sevindim, nasılsın?",
      meaning: "Salom! Seni ko'rganimdan xursandman, qalaysan?",
      variants: [
        { text: "Merhaba! Seni gördüğüme çok sevindim, nasılsın?", note: "Samimi" },
        { text: "Selam! Günün nasıl geçiyor?", note: "Canlı" }
      ],
      joke: { text: "Selam! Ben de tam seni düşünüyordum)", note: "Şaka" }
    },
    uz: {
      text: "Salom! Ko'rganimdan juda xursandman, ishlaringiz qalay?",
      meaning: "Salom! Ko'rganimdan xursandman, ishlaringiz qalay?",
      variants: [
        { text: "Salom! Ko'rganimdan juda xursandman, ishlaringiz qalay?", note: "Samimiy" },
        { text: "Assalomu alaykum! Tanishganimdan xursandman.", note: "Odobli" }
      ],
      joke: { text: "Salom! Hozirgina sizni eslayotgandim)", note: "Hazil" }
    }
  },

  // 2. KOFE / CHOY / AYLANI SH TAKLIFI
  {
    id: "coffee_walk",
    phrases: ["kofe ichamiz", "kofe ichaylik", "choy ichamiz", "aylanishga boramiz", "kofe ichsak nima deysiz", "qahva ichamiz"],
    keywords: ["kofe", "choy", "qahva", "kafe", "aylanamiz", "aylanaylik", "qahvaxona"],
    meaning: "Kofe ichish yoki birga aylanish taklifi",
    ru: {
      text: "Давай выпьем кофе и приятно пообщаемся?",
      meaning: "Keling, birga kofe ichib suhbatlashamiz?",
      variants: [
        { text: "Давай выпьем кофе и приятно пообщаемся?", note: "Kofe taklifi" },
        { text: "Не против прогуляться и перекусить где-нибудь?", note: "Aylanish taklifi" },
        { text: "Пойдем в уютное место, выпьем чаю или кофе.", note: "Qulay joy" }
      ],
      joke: { text: "С меня вкусный кофе, с тебя отличное настроение)", note: "Kofe hazili" }
    },
    en: {
      text: "Would you like to grab some coffee and chat?",
      meaning: "Birga kofe ichib suhbatlashsak nima deysan?",
      variants: [
        { text: "Would you like to grab some coffee and chat?", note: "Coffee invite" },
        { text: "How about going for a walk somewhere nice?", note: "Walk invite" },
        { text: "Let's find a cozy place for tea or coffee.", note: "Cozy spot" }
      ],
      joke: { text: "Coffee is on me, good vibes are on you)", note: "Coffee joke" }
    },
    tr: {
      text: "Birlikte bir kahve içip sohbet etmeye ne dersin?",
      meaning: "Kofe ichib suhbatlashsak nima deysan?",
      variants: [
        { text: "Birlikte bir kahve içip sohbet etmeye ne dersin?", note: "Kahve daveti" },
        { text: "Biraz yürüyüş yapıp bir şeyler atıştıralım mı?", note: "Yürüyüş" }
      ],
      joke: { text: "Kahveler benden, güzel sohbet senden)", note: "Şaka" }
    },
    uz: {
      text: "Keling, birga qahva ichib maroqli suhbatlashamiz?",
      meaning: "Keling, birga kofe ichib suhbatlashamiz?",
      variants: [
        { text: "Keling, birga qahva ichib maroqli suhbatlashamiz?", note: "Kofe taklifi" },
        { text: "Biroz aylanib, tamaddi qilib kelsak nima deysiz?", note: "Aylanish taklifi" }
      ],
      joke: { text: "Kofe mendan, ajoyib kayfiyat sizdan)", note: "Hazil" }
    }
  },

  // 2.1 KELISHDIK, BORAMIZ / KETDIK
  {
    id: "agreement_go",
    phrases: ["kelishdik boramiz", "kelishdik ketdik", "boramiz kelishdik", "kettik", "boramiz", "ketdik", "kelishdik kettik", "boldi boramiz", "mayli boramiz", "tayyorman ketdik"],
    keywords: ["boramiz", "ketdik", "kettik"],
    meaning: "Kelishdik, boramiz / kettik deb tasdiqlash",
    ru: {
      text: "Договорились, пойдем!",
      meaning: "Kelishdik, boramiz!",
      variants: [
        { text: "Договорились, пойдем!", note: "Aniq rozilik" },
        { text: "Отлично, выдвигаемся!", note: "Harakatga tayyor" },
        { text: "По рукам, поехали!", note: "Jonli so'zlashuv" }
      ],
      joke: { text: "По рукам, теперь уже точно не отвертишься)", note: "Hazil" }
    },
    en: {
      text: "Deal, let's go!",
      meaning: "Kelishdik, kettik!",
      variants: [
        { text: "Deal, let's go!", note: "Enthusiastic" },
        { text: "All set, let's head out!", note: "Ready" },
        { text: "Agreed, count me in!", note: "Agreement" }
      ],
      joke: { text: "Deal, no backing out now)", note: "Joke" }
    },
    tr: {
      text: "Anlaştık, gidelim!",
      meaning: "Kelishdik, ketdik!",
      variants: [
        { text: "Anlaştık, gidelim!", note: "Onay" },
        { text: "Tamamdır, çıkalım!", note: "Hazır" }
      ],
      joke: { text: "Anlaştık, artık geri adım atmak yok)", note: "Şaka" }
    },
    uz: {
      text: "Kelishdik, kettik!",
      meaning: "Kelishdik, kettik!",
      variants: [
        { text: "Kelishdik, kettik!", note: "Aniq" },
        { text: "Bo'ldi, boramiz!", note: "Rozilik" }
      ],
      joke: { text: "Kelishdik, endi orqaga qaytish yo'q)", note: "Hazil" }
    }
  },

  // 3. KOMPLIMENT / MAQTOV / FLIRT
  {
    id: "compliment",
    keywords: ["chiroyli", "chiroylisan", "chiroylisiz", "go'zal", "ajoyib", "kelishgan", "yoqasiz", "yoqasan", "tabassum"],
    meaning: "Go'zallik va joziba haqida samimiy maqtov",
    ru: {
      text: "Ты невероятно красиво выглядишь сегодня!",
      meaning: "Bugun nihoyatda chiroyli ko'rinyapsan!",
      variants: [
        { text: "Ты невероятно красиво выглядишь сегодня!", note: "Jozibali maqtov" },
        { text: "У тебя потрясающая улыбка, глаз не оторвать.", note: "Tabassum maqtovi" },
        { text: "С тобой так легко и приятно общаться.", note: "Samimiy e'tirof" }
      ],
      joke: { text: "Ты так сияешь, что солнцу пора на перерыв)", note: "Flirt hazili" }
    },
    en: {
      text: "You look absolutely stunning today!",
      meaning: "Bugun ajoyib darajada go'zalsan!",
      variants: [
        { text: "You look absolutely stunning today!", note: "Charming compliment" },
        { text: "You have such a mesmerizing smile.", note: "Smile compliment" },
        { text: "It's honestly wonderful talking to you.", note: "Sweet compliment" }
      ],
      joke: { text: "Are you always this charming or is today special?)", note: "Flirt joke" }
    },
    tr: {
      text: "Bugün gerçekten büyüleyici görünüyorsun!",
      meaning: "Bugun haqiqatan maftunkor ko'rinyapsan!",
      variants: [
        { text: "Bugün gerçekten büyüleyici görünüyorsun!", note: "İltifat" },
        { text: "Çok güzel ve içten bir gülüşün var.", note: "Gülüş" }
      ],
      joke: { text: "Gözlerin o kadar parlıyor ki güneş kıskanır)", note: "Şaka" }
    },
    uz: {
      text: "Bugun nihoyatda ajoyib va go'zal ko'rinyapsiz!",
      meaning: "Bugun juda chiroyli ko'rinyapsiz!",
      variants: [
        { text: "Bugun nihoyatda ajoyib va go'zal ko'rinyapsiz!", note: "Maqtov" },
        { text: "Tabassumingiz juda jozibador ekan.", note: "Tabassum" }
      ],
      joke: { text: "Shunchalik chiroylisizki, ko'z tegmasin)", note: "Hazil" }
    }
  },

  // 4. KASB VA ISH (IT, DASTURCHI, BIZNES)
  {
    id: "job_profession",
    keywords: ["dasturchi", "ishlayman", "biznes", "loyiha", "soha", "o'qiyman", "kompaniya"],
    meaning: "O'z kasbi, sohas va ishi haqida ma'lumot berish",
    ru: {
      text: "Я работаю в сфере IT и современных технологий.",
      meaning: "Men IT va zamonaviy texnologiyalar sohasida ishlayman.",
      variants: [
        { text: "Я работаю в сфере IT и современных технологий.", note: "Aniq kasb" },
        { text: "Занимаюсь интересными проектами и разработкой.", note: "Loyiha" },
        { text: "Создаю технологические решения и развиваюсь.", note: "Rivojlanish" }
      ],
      joke: { text: "Превращаю кофе в чистый и работающий код)", note: "IT hazili" }
    },
    en: {
      text: "I work in IT and modern technology development.",
      meaning: "Men IT va zamonaviy dasturlash sohasida ishlayman.",
      variants: [
        { text: "I work in IT and modern technology development.", note: "Professional" },
        { text: "I build interesting software and tech projects.", note: "Projects" }
      ],
      joke: { text: "I basically turn coffee into functional code)", note: "Tech joke" }
    },
    tr: {
      text: "Bilişim ve yazılım teknolojileri alanında çalışıyorum.",
      meaning: "Men IT va dasturiy ta'minot sohasida ishlayman.",
      variants: [
        { text: "Bilişim ve yazılım teknolojileri alanında çalışıyorum.", note: "Meslek" },
        { text: "Teknoloji projeleri geliştiriyorum.", note: "Proje" }
      ],
      joke: { text: "Kahveyi çalışan koda dönüştürüyorum)", note: "Şaka" }
    },
    uz: {
      text: "Men axborot texnologiyalari va dasturlash sohasida ishlayman.",
      meaning: "Men IT va dasturlash sohasida ishlayman.",
      variants: [
        { text: "Men axborot texnologiyalari va dasturlash sohasida ishlayman.", note: "Kasb" },
        { text: "Qiziqarli loyihalar ustida ishlayapman.", note: "Loyiha" }
      ],
      joke: { text: "Qahvani ishlaydigan kodga aylantiraman)", note: "Hazil" }
    }
  },

  // 5. SHAHAR VA MANZIL (Toshkent, yashash joyi)
  {
    id: "location_city",
    keywords: ["toshkent", "samarqand", "buxoro", "shahar", "yashayman", "shaharda"],
    meaning: "Qaysi shahardan ekanligi va yashash joyi haqida",
    ru: {
      text: "Я из Ташкента, живу и работаю здесь.",
      meaning: "Men Toshkentdanman, shu yerda yashayman va ishlayman.",
      variants: [
        { text: "Я из Ташкента, живу и работаю здесь.", note: "Aniq shahar" },
        { text: "Живу в Ташкенте, очень красивый и теплый город.", note: "Tavsif" }
      ],
      joke: { text: "Я оттуда, где самый вкусный плов на планете)", note: "Shahar hazili" }
    },
    en: {
      text: "I'm from Tashkent, living and working here.",
      meaning: "Men Toshkentdanman, shu yerda yashayman va ishlayman.",
      variants: [
        { text: "I'm from Tashkent, living and working here.", note: "Direct city" },
        { text: "I live in Tashkent, it's a very vibrant and warm city.", note: "City praise" }
      ],
      joke: { text: "I'm from the capital of the best food in the world)", note: "Food joke" }
    },
    tr: {
      text: "Taşkent'tenim, burada yaşıyor ve çalışıyorum.",
      meaning: "Toshkentdanman, shu yerda yashayman.",
      variants: [
        { text: "Taşkent'tenim, burada yaşıyor ve çalışıyorum.", note: "Şehir" }
      ],
      joke: { text: "Dünyanın en lezzetli pilavının piştiği şehirdenim)", note: "Şaka" }
    },
    uz: {
      text: "Men Toshkentdanman, shu yerda yashayman va faoliyat yuritaman.",
      meaning: "Men Toshkentdanman, shu yerda yashayman.",
      variants: [
        { text: "Men Toshkentdanman, shu yerda yashayman va faoliyat yuritaman.", note: "Aniq" }
      ],
      joke: { text: "Dunyoning eng mazali palovi tayyorlanadigan shahardanman)", note: "Hazil" }
    }
  },

  // 6. ROZILIK VA KELISHUV
  {
    id: "agreement",
    keywords: ["kelishdik", "roziman", "albatta", "bo'ldi", "yaxshi", "fikr"],
    meaning: "Taklifga to'liq rozilik va kelishuv bildirish",
    ru: {
      text: "Договорились! Отличная идея, я только за.",
      meaning: "Kelishdik! Ajoyib fikr, men faqat roziman.",
      variants: [
        { text: "Договорились! Отличная идея, я только за.", note: "Aniq rozilik" },
        { text: "С удовольствием, время и место обсудим.", note: "Samimiy" },
        { text: "Без проблем, всё в силе!", note: "Qat'iy tasdiq" }
      ],
      joke: { text: "По рукам, теперь уже не отвертишься)", note: "Hazil" }
    },
    en: {
      text: "Deal! Sounds like an amazing plan.",
      meaning: "Kelishdik! Ajoyib reja bo'libdi.",
      variants: [
        { text: "Deal! Sounds like an amazing plan.", note: "Clear agreement" },
        { text: "I'd love that, let's make it happen.", note: "Enthusiastic" }
      ],
      joke: { text: "Deal! No backing out now)", note: "Joke" }
    },
    tr: {
      text: "Anlaştık! Harika bir fikir, ben kesinlikle varım.",
      meaning: "Kelishdik! Ajoyib fikr, men roziman.",
      variants: [
        { text: "Anlaştık! Harika bir fikir, ben kesinlikle varım.", note: "Onay" }
      ],
      joke: { text: "Anlaştık, artık geri adım atmak yok)", note: "Şaka" }
    },
    uz: {
      text: "Kelishdik! Juda ajoyib fikr, men faqat roziman.",
      meaning: "Kelishdik! Men roziman.",
      variants: [
        { text: "Kelishdik! Juda ajoyib fikr, men faqat roziman.", note: "Rozilik" }
      ],
      joke: { text: "Kelishdik, endi orqaga qaytish yo'q)", note: "Hazil" }
    }
  },

  // 7. RAHMAT VA MINNATDORCHILIK
  {
    id: "gratitude",
    keywords: ["rahmat", "katta", "tashakkur", "minnatdorman", "sog"],
    meaning: "E'tibor va yordam uchun samimiy minnatdorchilik",
    ru: {
      text: "Большое спасибо! Очень ценю твоё внимание.",
      meaning: "Katta rahmat! E'tiboringizni juda qadrlayman.",
      variants: [
        { text: "Большое спасибо! Очень ценю твоё внимание.", note: "Katta rahmat" },
        { text: "Благодарю от души, невероятно приятно.", note: "Samimiy" }
      ],
      joke: { text: "С меня шоколадка в знак благодарности)", note: "Hazil" }
    },
    en: {
      text: "Thank you so much! Really appreciate your kindness.",
      meaning: "Katta rahmat! Mehribonligingiz uchun minnatdorman.",
      variants: [
        { text: "Thank you so much! Really appreciate your kindness.", note: "Gratitude" },
        { text: "Thanks a lot, that truly means a lot to me.", note: "Heartfelt" }
      ],
      joke: { text: "I officially owe you one for this)", note: "Joke" }
    },
    tr: {
      text: "Çok teşekkür ederim! Nezaketin için minnettarım.",
      meaning: "Katta rahmat! Muloyimligingiz uchun rahmat.",
      variants: [
        { text: "Çok teşekkür ederim! Nezaketin için minnettarım.", note: "Teşekkür" }
      ],
      joke: { text: "Bunun karşılığında bir tatlı borçlandım)", note: "Şaka" }
    },
    uz: {
      text: "Katta rahmat! E'tiboringiz va samimiyligingiz uchun minnatdorman.",
      meaning: "Katta rahmat!",
      variants: [
        { text: "Katta rahmat! E'tiboringiz va samimiyligingiz uchun minnatdorman.", note: "Rahmat" }
      ],
      joke: { text: "Sendan bitta yaxshi qahva qarz bo'ldim)", note: "Hazil" }
    }
  },

  // 8. TANISHUV / ISM AYTISH
  {
    id: "introduction",
    keywords: ["ismim", "tanishaylik", "men", "isming", "tanishganimdan"],
    meaning: "O'z ismini aytish va tanishish",
    ru: {
      text: "Очень приятно познакомиться, меня зовут (имя).",
      meaning: "Tanishganimdan juda xursandman, mening ismim (ism).",
      variants: [
        { text: "Очень приятно познакомиться, меня зовут (имя).", note: "Tanishuv" },
        { text: "Я (имя). Рад нашему знакомству!", note: "Qisqa" }
      ],
      joke: { text: "Я (имя). Главное — имя не забыть через пять минут)", note: "Ism hazili" }
    },
    en: {
      text: "Lovely to meet you, my name is (name).",
      meaning: "Tanishganimdan xursandman, ismim (ism).",
      variants: [
        { text: "Lovely to meet you, my name is (name).", note: "Polite intro" },
        { text: "I'm (name). Really glad to meet you!", note: "Casual intro" }
      ],
      joke: { text: "I'm (name), just make sure you don't forget it in five minutes)", note: "Joke" }
    },
    tr: {
      text: "Tanıştığımıza çok memnun oldum, adım (isim).",
      meaning: "Tanishganimdan xursandman, ismim (ism).",
      variants: [
        { text: "Tanıştığımıza çok memnun oldum, adım (isim).", note: "Tanışma" }
      ],
      joke: { text: "Ben (isim), beş dakika sonra unutma sakın)", note: "Şaka" }
    },
    uz: {
      text: "Tanishganimdan juda xursandman, mening ismim (ism).",
      meaning: "Tanishganimdan xursandman, ismim (ism).",
      variants: [
        { text: "Tanishganimdan juda xursandman, mening ismim (ism).", note: "Tanishuv" }
      ],
      joke: { text: "Men (ism)man, 5 daqiqadan keyin esdan chiqarmasangiz bo'ldi)", note: "Hazil" }
    }
  },

  // 9. OILAVIY HOLAT (Uylangan / Bo'ydoq / Sevgilisi bor)
  {
    id: "relationship",
    keywords: ["uylangan", "turmush", "sevganim", "bo'ydoq", "yolg'izman", "munosabat"],
    meaning: "Oilaviy holat va munosabatlar haqida javob",
    ru: {
      text: "Моё сердце сейчас абсолютно свободно.",
      meaning: "Mening yuragim hozir butunlay bo'sh.",
      variants: [
        { text: "Моё сердце сейчас абсолютно свободно.", note: "Aniq javob" },
        { text: "Я холост, пока не встретил ту самую.", note: "Samimiy" }
      ],
      joke: { text: "В серьезных отношениях со своей свободой и кофе)", note: "Hazil" }
    },
    en: {
      text: "I am completely single and my heart is free.",
      meaning: "Men butunlay bo'shman va yuragim erkin.",
      variants: [
        { text: "I am completely single and my heart is free.", note: "Direct" },
        { text: "Single, haven't met the right person yet.", note: "Sincere" }
      ],
      joke: { text: "In a serious relationship with my freedom and coffee)", note: "Joke" }
    },
    tr: {
      text: "Şu an tamamen bekarım ve kalbim boş.",
      meaning: "Hozir butunlay bo'ydoqman.",
      variants: [
        { text: "Şu an tamamen bekarım ve kalbim boş.", note: "Net" }
      ],
      joke: { text: "Özgürlüğüm ve kahvemle ciddi bir ilişkim var)", note: "Şaka" }
    },
    uz: {
      text: "Hozircha bo'ydoqman va ko'nglim butunlay bo'sh.",
      meaning: "Bo'ydoqman, ko'nglim bo'sh.",
      variants: [
        { text: "Hozircha bo'ydoqman va ko'nglim butunlay bo'sh.", note: "Aniq" }
      ],
      joke: { text: "O'z erkinligim va qahva bilan jiddiy munosabatdaman)", note: "Hazil" }
    }
  }
];

// So'zma-so'z o'girish uchun boyitilgan lug'at
const LEXICON = {
  ru: {
    "men": "я", "sen": "ты", "siz": "вы", "biz": "мы", "u": "он",
    "ha": "да", "yoq": "нет", "rahmat": "спасибо", "iltimos": "пожалуйста",
    "yaxshi": "хорошо", "a'lo": "отлично", "yomon": "плохо", "qayerda": "где", "qachon": "когда",
    "nega": "почему", "nima": "что", "kim": "кто", "qanday": "как",
    "shahar": "город", "ish": "работа", "uy": "дом", "kofe": "кофе", "choy": "чай",
    "bugun": "сегодня", "ertaga": "завтра", "hozir": "сейчас", "kechqurun": "вечером",
    "boramiz": "пойдем", "keling": "давай", "yashayman": "живу", "ishlayman": "работаю",
    "chiroyli": "красиво", "muloqot": "общение", "vaqt": "время", "zerikdim": "мне скучно"
  },
  en: {
    "men": "I", "sen": "you", "siz": "you", "biz": "we", "u": "it",
    "ha": "yes", "yoq": "no", "rahmat": "thanks", "iltimos": "please",
    "yaxshi": "good", "a'lo": "great", "yomon": "bad", "qayerda": "where", "qachon": "when",
    "nega": "why", "nima": "what", "kim": "who", "qanday": "how",
    "shahar": "city", "ish": "work", "uy": "home", "kofe": "coffee", "choy": "tea",
    "bugun": "today", "ertaga": "tomorrow", "hozir": "now", "kechqurun": "tonight",
    "boramiz": "let's go", "keling": "come", "yashayman": "live", "ishlayman": "work",
    "chiroyli": "beautiful", "vaqt": "time"
  },
  tr: {
    "men": "ben", "sen": "sen", "siz": "siz", "biz": "biz", "u": "o",
    "ha": "evet", "yoq": "hayır", "rahmat": "teşekkürler", "iltimos": "lütfen",
    "yaxshi": "iyi", "a'lo": "harika", "yomon": "kötü", "qayerda": "nerede", "qachon": "ne zaman",
    "nega": "neden", "nima": "ne", "kim": "kim", "qanday": "nasıl",
    "shahar": "şehir", "ish": "iş", "uy": "ev", "kofe": "kahve", "choy": "çay",
    "bugun": "bugün", "ertaga": "yarın", "hozir": "şimdi", "kechqurun": "akşam",
    "boramiz": "gidelim", "keling": "gel", "chiroyli": "güzel", "vaqt": "zaman"
  },
  uz: {}
};

/**
 * Matn uchun eng mos semantik mazmunni fuzzy va normalizatsiya bilan aniqlash
 */
function findBestIntent(normalizedText) {
  const words = normalizedText.split(/\s+/).filter(Boolean);
  let bestIntent = null;
  let highestScore = 0;

  for (const intent of INTENT_DATABASE) {
    let score = 0;
    for (const word of words) {
      for (const kw of intent.keywords) {
        if (word === kw) {
          score += 3; // To'liq moslik
        } else if (wordSimilarity(word, kw) >= 0.72) {
          score += 2; // Imlo xatosi bilan moslik
        } else if (word.includes(kw) || kw.includes(word)) {
          score += 1;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestIntent = intent;
    }
  }

  return highestScore >= 2 ? bestIntent : null;
}

/**
 * Foydalanuvchining o'z gapini tanlangan tilga 100% to'g'ri, xatolarni tuzatib tarjima qilish
 */
export async function translateUserSpeech({ text, targetLang = 'ru', apiKey = '' }) {
  if (!text || !text.trim()) {
    return null;
  }

  const clean = text.trim();
  const normalized = normalizeUserText(clean);
  const langObj = TARGET_LANGUAGES.find(l => l.code === targetLang) || TARGET_LANGUAGES[0];

  // 1. AGAR GEMINI ULANGAN BO'LSA:
  // Gemini har qanday noto'g'ri yozilgan, qisqartirilgan yoki chalkash gapni
  // aqlli tahlil qilib, xatosini tuzatib, eng zo'r va tabiiy tarjimani qaytaradi!
  if (apiKey && apiKey.trim()) {
    try {
      const prompt = `
Sen "SuhbatDosh" ilovasining o'ta aqlli va imlo xatolarini tuzatuvchi professional tarjimonisan.
Foydalanuvchi jonli muloqotda ovoz chiqarib aytish uchun quyidagi matnni kiritdi:
Matn: "${clean}"

DIQQAT QOIDALARI:
1. Matnda imlo xatolari, qisqartmalar (masalan: "kel kofi ichamz", "slom qalysz", "sn juda chroyilsn") bo'lsa ham, uning asl va eng yaqin MAZMUNINI to'g'ri tushun va xatolarini tuzat.
2. Ushbu to'g'rilangan ma'noni ${langObj.name} (${langObj.code.toUpperCase()}) tiliga eng jozibali, tabiiy, ishonchli va so'zlashuvda o'qishga oson qilib tarjima qil.
3. 2-3 ta xilma-xil kuchli variant va 1 ta mos hazil ber.
4. "correctedUzbekMeaning" maydonida foydalanuvchi aslida nima demoqchi bo'lganini chiroyli o'zbekchada yoz.

Faqat toza JSON formatida javob ber:
{
  "correctedUzbekMeaning": "To'g'rilangan aniq o'zbekcha ma'nosi",
  "mainTranslation": "${langObj.name} tilidagi eng zo'r asosiy tarjima",
  "note": "Tarjima turi (masalan: Aniq / Samimiy / Jonli)",
  "variants": [
    { "text": "1-variant matni", "note": "Aniq va tabiiy" },
    { "text": "2-muqobil variant", "note": "Samimiy" }
  ],
  "joke": { "text": "Vaziyatga mos hazil varianti", "note": "Hazil" }
}
`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);

          const correctedMeaning = parsed.correctedUzbekMeaning || clean;
          const variants = (parsed.variants && parsed.variants.length > 0)
            ? parsed.variants.map(v => ({
                text: v.text,
                meaning: correctedMeaning,
                note: v.note || "Tarjima varianti"
              }))
            : [{ text: parsed.mainTranslation, meaning: correctedMeaning, note: parsed.note || "Tarjima" }];

          const jokeVariant = parsed.joke ? [{
            text: parsed.joke.text,
            meaning: correctedMeaning,
            note: parsed.joke.note || "Hazil"
          }] : [];

          const allVariants = [...variants, ...jokeVariant];
          const pronunciation = toPhonetic(parsed.mainTranslation);

          return {
            partnerText: `Siz yozgan gap: "${clean}"`,
            partnerMeaning: `Mazmuni: ${correctedMeaning}`,
            detectedLanguage: langObj,
            userResponse: parsed.mainTranslation,
            userMeaning: correctedMeaning,
            userPronunciation: `[${pronunciation}]`,
            userNote: parsed.note || `Tarjima (${langObj.name})`,
            isJoke: false,
            allVariants: allVariants,
            currentVariantIndex: 0,
            totalVariants: allVariants.length,
            isUserSpeechMode: true
          };
        }
      }
    } catch (e) {
      console.warn("Gemini xatosi, mahalliy ong ishlatiladi:", e);
    }
  }

  // 2. MAHALLIY INTELLEKT: FUZZY VA NORMALIZATSIYA ORQALI ENG YAQIN MAZMUNNI TANLASH
  const bestIntent = findBestIntent(normalized);

  if (bestIntent && bestIntent[targetLang]) {
    const data = bestIntent[targetLang];
    const pronunciation = toPhonetic(data.text);
    const variants = data.variants.map(v => ({
      text: v.text,
      meaning: data.meaning,
      note: v.note
    }));
    if (data.joke) {
      variants.push({
        text: data.joke.text,
        meaning: data.meaning,
        note: data.joke.note
      });
    }

    return {
      partnerText: `Siz yozgan gap: "${clean}"`,
      partnerMeaning: `Aniqlangan mazmun: ${bestIntent.meaning}`,
      detectedLanguage: langObj,
      userResponse: data.text,
      userMeaning: data.meaning,
      userPronunciation: `[${pronunciation}]`,
      userNote: `Aniq tarjima (${langObj.name})`,
      isJoke: false,
      allVariants: variants,
      currentVariantIndex: 0,
      totalVariants: variants.length,
      isUserSpeechMode: true
    };
  }

  // 3. AGAR MAXSUS INTENT TOPILMASA: SO'ZLARNI TUZATIB VA LUG'AT ORQALI TARJIMA QILISH
  let translatedText = clean;
  const words = normalized.split(/\s+/).filter(Boolean);

  if (targetLang === 'ru') {
    const dict = LEXICON.ru;
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else if (targetLang === 'en') {
    const dict = LEXICON.en;
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else if (targetLang === 'tr') {
    const dict = LEXICON.tr;
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else {
    translatedText = normalized;
  }

  const pronunciation = toPhonetic(translatedText);

  return {
    partnerText: `Siz yozgan gap: "${clean}"`,
    partnerMeaning: `Tuzatilgan: ${normalized}`,
    detectedLanguage: langObj,
    userResponse: translatedText,
    userMeaning: normalized,
    userPronunciation: `[${pronunciation}]`,
    userNote: `Tarjima (${langObj.name})`,
    isJoke: false,
    allVariants: [
      { text: translatedText, meaning: normalized, note: `Tarjima (${langObj.name})` }
    ],
    currentVariantIndex: 0,
    totalVariants: 1,
    isUserSpeechMode: true
  };
}
