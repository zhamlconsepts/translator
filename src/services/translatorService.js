/**
 * SuhbatDosh - Tezkor Foydalanuvchi Tarjimoni (User Direct Speech Translator)
 * 
 * Foydalanuvchi o'zbekcha (yoki boshqa tilda) nima demoqchi bo'lsa yozadi:
 * Ilova uni tanlangan chet tiliga (Rus, Ingliz, Turk, O'zbek) jonli, chiroyli va tabiiy qilib
 * tarjima qiladi, lotincha talaffuzini chiqaradi va ekrandagi Teleprompterga qo'yib beradi!
 */

import { toPhonetic } from './conversationEngine.js';

// Til metama'lumotlari
export const TARGET_LANGUAGES = [
  { code: 'ru', name: 'Ruscha', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿', speechCode: 'uz-UZ' },
  { code: 'en', name: 'Inglizcha', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'tr', name: 'Turkcha', flag: '🇹🇷', speechCode: 'tr-TR' },
];

// O'zbekcha iboralarning chet tillariga tayyor professional tarjimalari
const TRANSLATION_PATTERNS = [
  // 1. Salomlashish
  {
    matcher: (t) => /salom|assalomu alaykum|xayrli kun|qalesan|qalaysiz/i.test(t),
    ru: {
      text: "Привет! Рад тебя видеть.",
      variants: [
        { text: "Привет! Рад тебя видеть.", note: "Samimiy" },
        { text: "Здравствуйте! Приятно познакомиться.", note: "Rasmiy" },
        { text: "Салют, как твои успехи?", note: "Jonli" }
      ],
      joke: { text: "Привет! Только о тебе подумал)", note: "Iliq hazil" }
    },
    en: {
      text: "Hey! Great to see you.",
      variants: [
        { text: "Hey! Great to see you.", note: "Friendly" },
        { text: "Hello! Nice to meet you.", note: "Polite" },
        { text: "Hi there! How are things?", note: "Casual" }
      ],
      joke: { text: "Hey! Was just thinking about you)", note: "Joke" }
    },
    tr: {
      text: "Merhaba! Seni gördüğüme sevindim.",
      variants: [
        { text: "Merhaba! Seni gördüğüme sevindim.", note: "Samimi" },
        { text: "Selam! Tanıştığımıza memnun oldum.", note: "Kibar" }
      ],
      joke: { text: "Selam! Ben de tam seni düşünüyordum)", note: "Şaka" }
    },
    uz: {
      text: "Salom! Ko'rganimdan xursandman.",
      variants: [
        { text: "Salom! Ko'rganimdan xursandman.", note: "Samimiy" },
        { text: "Assalomu alaykum! Tanishganimdan xursandman.", note: "Odobli" }
      ],
      joke: { text: "Salom! Hozirgina sizni eslayotgandim)", note: "Hazil" }
    }
  },

  // 2. Kofe / Choy / Aylanish taklifi
  {
    matcher: (t) => /kofe|qahva|choy|aylanamiz|aylangani|birga|boramiz|ichamiz/i.test(t),
    ru: {
      text: "Давай выпьем кофе и пообщаемся?",
      variants: [
        { text: "Давай выпьем кофе и пообщаемся?", note: "Kofe taklifi" },
        { text: "Не против прогуляться и перекусить?", note: "Aylanish" },
        { text: "Пойдем в уютное место, выпьем чаю.", note: "Choy" }
      ],
      joke: { text: "С меня кофе, с тебя хорошее настроение)", note: "Kofe hazili" }
    },
    en: {
      text: "Would you like to grab some coffee together?",
      variants: [
        { text: "Would you like to grab some coffee together?", note: "Coffee offer" },
        { text: "How about going for a walk?", note: "Walk" }
      ],
      joke: { text: "Coffee is on me, good vibes are on you)", note: "Joke" }
    },
    tr: {
      text: "Birlikte bir kahve içmeye ne dersin?",
      variants: [
        { text: "Birlikte bir kahve içmeye ne dersin?", note: "Kahve teklifi" },
        { text: "Biraz yürüyüş yapalım mı?", note: "Yürüyüş" }
      ],
      joke: { text: "Kahveler benden, sohbet senden)", note: "Şaka" }
    },
    uz: {
      text: "Keling, birga kofe ichib suhbatlashamiz?",
      variants: [
        { text: "Keling, birga kofe ichib suhbatlashamiz?", note: "Kofe taklifi" },
        { text: "Biroz aylanib kelsak nima deysiz?", note: "Aylanish" }
      ],
      joke: { text: "Kofe mendan, yaxshi kayfiyat sizdan)", note: "Hazil" }
    }
  },

  // 3. Kompliment / Maqtov
  {
    matcher: (t) => /chiroyli|ajoyib|gozal|go'zal|zo'r|yoqasiz|kelishgan|chiroylisiz|chiroylisan/i.test(t),
    ru: {
      text: "Ты потрясающе выглядишь!",
      variants: [
        { text: "Ты потрясающе выглядишь!", note: "Kompliment" },
        { text: "У тебя очень красивая улыбка.", note: "Tabassum" },
        { text: "С тобой невероятно приятно общаться.", note: "Iliq so'z" }
      ],
      joke: { text: "Ты так сияешь, что солнце отдыхает)", note: "Maqtov hazili" }
    },
    en: {
      text: "You look absolutely stunning!",
      variants: [
        { text: "You look absolutely stunning!", note: "Compliment" },
        { text: "You have such a beautiful smile.", note: "Smile" },
        { text: "It's so lovely talking to you.", note: "Sweet" }
      ],
      joke: { text: "Are you always this charming or is today special?)", note: "Joke" }
    },
    tr: {
      text: "Harika görünüyorsun!",
      variants: [
        { text: "Harika görünüyorsun!", note: "İltifat" },
        { text: "Çok güzel bir gülüşün var.", note: "Gülüş" }
      ],
      joke: { text: "Gözlerin o kadar parlıyor ki güneş kıskanır)", note: "Şaka" }
    },
    uz: {
      text: "Juda ajoyib ko'rinyapsiz!",
      variants: [
        { text: "Juda ajoyib ko'rinyapsiz!", note: "Maqtov" },
        { text: "Tabassumingiz juda chiroyli ekan.", note: "Tabassum" }
      ],
      joke: { text: "Shunchalik chiroyliki, ko'z tegmasin)", note: "Hazil" }
    }
  },

  // 4. Qayerdansiz / Shahar haqida aytish
  {
    matcher: (t) => /men.*?(?:toshkent|samarqand|buxoro|andijon|namangan|farg|shahridan|yashayman)|shahardanam/i.test(t),
    ru: {
      text: "Я из Ташкента, живу здесь.",
      variants: [
        { text: "Я из Ташкента, живу здесь.", note: "Aniq" },
        { text: "Живу в Ташкенте, отличный город.", note: "Shahar" }
      ],
      joke: { text: "Я оттуда, где самый вкусный плов в мире)", note: "Hazil" }
    },
    en: {
      text: "I am from Tashkent, living here.",
      variants: [
        { text: "I am from Tashkent, living here.", note: "Direct" },
        { text: "I live in Tashkent, it's a great city.", note: "City" }
      ],
      joke: { text: "I'm from the city of the world's best food)", note: "Joke" }
    },
    tr: {
      text: "Taşkent'tenim, burada yaşıyorum.",
      variants: [
        { text: "Taşkent'tenim, burada yaşıyorum.", note: "Net" }
      ],
      joke: { text: "Dünyanın en lezzetli pilavının yapıldığı yerdenim)", note: "Şaka" }
    },
    uz: {
      text: "Men Toshkentdanman, shu yerda yashayman.",
      variants: [
        { text: "Men Toshkentdanman, shu yerda yashayman.", note: "Aniq" }
      ],
      joke: { text: "Dunyoning eng mazali palovi tayyorlanadigan joydanman)", note: "Hazil" }
    }
  },

  // 5. Kasb / Ish haqida aytish
  {
    matcher: (t) => /dasturchi|it|ishlayman|biznes|oqiyman|kasbim|sohada/i.test(t),
    ru: {
      text: "Я работаю в сфере IT и технологий.",
      variants: [
        { text: "Я работаю в сфере IT и технологий.", note: "Kasb" },
        { text: "Занимаюсь интересными проектами.", note: "Loyiha" }
      ],
      joke: { text: "Превращаю кофе в работающий код)", note: "IT hazili" }
    },
    en: {
      text: "I work in IT and technology.",
      variants: [
        { text: "I work in IT and technology.", note: "Job" },
        { text: "I work on creative tech projects.", note: "Projects" }
      ],
      joke: { text: "I turn coffee into clean code)", note: "Joke" }
    },
    tr: {
      text: "Bilişim ve teknoloji alanında çalışıyorum.",
      variants: [
        { text: "Bilişim ve teknoloji alanında çalışıyorum.", note: "Meslek" }
      ],
      joke: { text: "Kahveyi çalışan koda dönüştürüyorum)", note: "Şaka" }
    },
    uz: {
      text: "IT va texnologiyalar sohasida ishlayman.",
      variants: [
        { text: "IT va texnologiyalar sohasida ishlayman.", note: "Kasb" }
      ],
      joke: { text: "Qahvani ishlaydigan kodga aylantiraman)", note: "Hazil" }
    }
  },

  // 6. Roziman / Kelishdik / Yaxshi
  {
    matcher: (t) => /roziman|kelishdik|mayli|xop|bo'ladi|albatta|yaxshi/i.test(t),
    ru: {
      text: "Договорились, отличная идея!",
      variants: [
        { text: "Договорились, отличная идея!", note: "Rozilik" },
        { text: "Я только за, с удовольствием.", note: "Samimiy" },
        { text: "Без проблем, всё в силе.", note: "Tasdiq" }
      ],
      joke: { text: "По рукам, обратного пути нет)", note: "Hazil" }
    },
    en: {
      text: "Deal! Sounds like a great plan.",
      variants: [
        { text: "Deal! Sounds like a great plan.", note: "Agreed" },
        { text: "I'm totally in, with pleasure.", note: "Friendly" }
      ],
      joke: { text: "Deal! No backing out now)", note: "Joke" }
    },
    tr: {
      text: "Anlaştık, harika bir fikir!",
      variants: [
        { text: "Anlaştık, harika bir fikir!", note: "Onay" },
        { text: "Ben varım, seve seve.", note: "Samimi" }
      ],
      joke: { text: "Anlaştık, artık geri dönüş yok)", note: "Şaka" }
    },
    uz: {
      text: "Kelishdik, ajoyib fikr!",
      variants: [
        { text: "Kelishdik, ajoyib fikr!", note: "Rozilik" },
        { text: "Men faqat roziman, jon deb.", note: "Samimiy" }
      ],
      joke: { text: "Kelishdik, endi orqaga yo'l yo'q)", note: "Hazil" }
    }
  },

  // 7. Rahmat / Tashakkur
  {
    matcher: (t) => /rahmat|tashakkur|katta rahmat|sog bul|minnatdorman/i.test(t),
    ru: {
      text: "Большое спасибо, очень приятно!",
      variants: [
        { text: "Большое спасибо, очень приятно!", note: "Rahmat" },
        { text: "От души благодарю тебя.", note: "Samimiy" }
      ],
      joke: { text: "С меня шоколадка в знак благодарности)", note: "Hazil" }
    },
    en: {
      text: "Thank you so much, really appreciate it!",
      variants: [
        { text: "Thank you so much, really appreciate it!", note: "Thanks" },
        { text: "Thanks a lot, that's very kind of you.", note: "Kind" }
      ],
      joke: { text: "I owe you one for this)", note: "Joke" }
    },
    tr: {
      text: "Çok teşekkür ederim, çok naziksin!",
      variants: [
        { text: "Çok teşekkür ederim, çok naziksin!", note: "Teşekkür" }
      ],
      joke: { text: "Bunun karşılığında bir tatlı borçlandım)", note: "Şaka" }
    },
    uz: {
      text: "Katta rahmat, juda minnatdorman!",
      variants: [
        { text: "Katta rahmat, juda minnatdorman!", note: "Rahmat" }
      ],
      joke: { text: "Sendan bitta qahva qarz bo'ldi)", note: "Hazil" }
    }
  },

  // 8. Tanishuv / Ism
  {
    matcher: (t) => /mening ismim|ismim|men.*?(?:man|man\b)|tanishaylik/i.test(t),
    ru: {
      text: "Очень приятно, меня зовут (имя).",
      variants: [
        { text: "Очень приятно, меня зовут (имя).", note: "Tanishuv" },
        { text: "Я (имя). Рад знакомству!", note: "Qisqa" }
      ],
      joke: { text: "Я (имя). Главное — имя не забыть через пять минут)", note: "Hazil" }
    },
    en: {
      text: "Nice to meet you, I am (name).",
      variants: [
        { text: "Nice to meet you, I am (name).", note: "Intro" }
      ],
      joke: { text: "I'm (name), just don't forget it in five minutes)", note: "Joke" }
    },
    tr: {
      text: "Tanıştığımıza memnun oldum, adım (isim).",
      variants: [
        { text: "Tanıştığımıza memnun oldum, adım (isim).", note: "Tanışma" }
      ],
      joke: { text: "Ben (isim), beş dakika sonra unutma sakın)", note: "Şaka" }
    },
    uz: {
      text: "Tanishganimdan xursandman, ismim (ism).",
      variants: [
        { text: "Tanishganimdan xursandman, ismim (ism).", note: "Tanishuv" }
      ],
      joke: { text: "Men (ism)man, 5 daqiqadan keyin unutmang yana)", note: "Hazil" }
    }
  }
];

// O'zbekcha so'zlarni chet tillariga tezkor lug'aviy o'girish
const WORD_DICT = {
  ru: {
    "men": "я", "sen": "ты", "siz": "вы", "biz": "мы", "u": "он",
    "ha": "да", "yoq": "нет", "yo'q": "нет", "rahmat": "спасибо", "iltimos": "пожалуйста",
    "yaxshi": "хорошо", "a'lo": "отлично", "yomon": "плохо", "qayerda": "где", "qachon": "когда",
    "nega": "почему", "nima": "что", "kim": "кто", "qanday": "как",
    "shahar": "город", "ish": "работа", "uy": "дом", "kofe": "кофе", "choy": "чай",
    "bugun": "сегодня", "ertaga": "завтра", "hozir": "сейчас", "kechqurun": "вечером",
    "boraman": "пойду", "kelaman": "приду", "yashayman": "живу", "ishlayman": "работаю",
    "chiroyli": "красиво", "gap": "разговор", "muloqot": "общение", "vaqt": "время"
  },
  en: {
    "men": "I", "sen": "you", "siz": "you", "biz": "we", "u": "it",
    "ha": "yes", "yoq": "no", "yo'q": "no", "rahmat": "thanks", "iltimos": "please",
    "yaxshi": "good", "a'lo": "great", "yomon": "bad", "qayerda": "where", "qachon": "when",
    "nega": "why", "nima": "what", "kim": "who", "qanday": "how",
    "shahar": "city", "ish": "work", "uy": "home", "kofe": "coffee", "choy": "tea",
    "bugun": "today", "ertaga": "tomorrow", "hozir": "now", "kechqurun": "tonight",
    "boraman": "will go", "kelaman": "will come", "yashayman": "live", "ishlayman": "work",
    "chiroyli": "beautiful", "vaqt": "time"
  },
  tr: {
    "men": "ben", "sen": "sen", "siz": "siz", "biz": "biz", "u": "o",
    "ha": "evet", "yoq": "hayır", "yo'q": "hayır", "rahmat": "teşekkürler", "iltimos": "lütfen",
    "yaxshi": "iyi", "a'lo": "harika", "yomon": "kötü", "qayerda": "nerede", "qachon": "ne zaman",
    "nega": "neden", "nima": "ne", "kim": "kim", "qanday": "nasıl",
    "shahar": "şehir", "ish": "iş", "uy": "ev", "kofe": "kahve", "choy": "çay",
    "bugun": "bugün", "ertaga": "yarın", "hozir": "şimdi", "kechqurun": "akşam",
    "chiroyli": "güzel", "vaqt": "zaman"
  },
  uz: {}
};

/**
 * Foydalanuvchining o'z gapini tanlangan tilga professional tarjima qilish
 */
export async function translateUserSpeech({ text, targetLang = 'ru', apiKey = '' }) {
  if (!text || !text.trim()) {
    return null;
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const langObj = TARGET_LANGUAGES.find(l => l.code === targetLang) || TARGET_LANGUAGES[0];

  // 1. Agar Gemini ulangan bo'lsa, eng o'tkir professional tarjima va variantlar olamiz!
  if (apiKey && apiKey.trim()) {
    try {
      const prompt = `
Sen "SuhbatDosh" ilovasining yuqori intellektli tarjimonisan.
Foydalanuvchi o'zi jonli muloqotda ovoz chiqarib aytmoqchi bo'lgan gapini yozdi:
"${clean}"

Vazifang:
Ushbu fikrni ${langObj.name} (${langObj.code.toUpperCase()}) tiliga eng tabiiy, jozibador va ishonchli so'zlashuv uslubida tarjima qil.
Foydalanuvchiga 2-3 ta yaxshi variant ber va hazil varianti ham qo'sh.

Faqat toza JSON formatida javob ber:
{
  "mainTranslation": "${langObj.name} tilidagi eng zo'r asosiy tarjima",
  "uzbekMeaning": "O'zbekcha to'liq ma'nosi",
  "note": "Tarjima turi (masalan: Aniq / Jonli / Samimiy)",
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

          const variants = (parsed.variants && parsed.variants.length > 0)
            ? parsed.variants.map(v => ({
                text: v.text,
                meaning: clean,
                note: v.note || "Tarjima varianti"
              }))
            : [{ text: parsed.mainTranslation, meaning: clean, note: parsed.note || "Tarjima" }];

          const jokeVariant = parsed.joke ? [{
            text: parsed.joke.text,
            meaning: clean,
            note: parsed.joke.note || "Hazil"
          }] : [];

          const allVariants = [...variants, ...jokeVariant];
          const pronunciation = toPhonetic(parsed.mainTranslation);

          return {
            partnerText: `Siz aytmoqchisiz (${clean}):`,
            partnerMeaning: clean,
            detectedLanguage: langObj,
            userResponse: parsed.mainTranslation,
            userMeaning: parsed.uzbekMeaning || clean,
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
      console.warn("Gemini tarjimasi xatosi, mahalliy bazadan tarjima qilinadi:", e);
    }
  }

  // 2. Mahalliy professional shablonlar
  const matched = TRANSLATION_PATTERNS.find(item => item.matcher(lower));
  if (matched && matched[targetLang]) {
    const data = matched[targetLang];
    const pronunciation = toPhonetic(data.text);
    const variants = data.variants.map(v => ({
      text: v.text,
      meaning: clean,
      note: v.note
    }));
    if (data.joke) {
      variants.push({
        text: data.joke.text,
        meaning: clean,
        note: data.joke.note
      });
    }

    return {
      partnerText: `Siz yozgan gap (${clean}):`,
      partnerMeaning: clean,
      detectedLanguage: langObj,
      userResponse: data.text,
      userMeaning: clean,
      userPronunciation: `[${pronunciation}]`,
      userNote: `Aniq tarjima (${langObj.name})`,
      isJoke: false,
      allVariants: variants,
      currentVariantIndex: 0,
      totalVariants: variants.length,
      isUserSpeechMode: true
    };
  }

  // 3. Tezkor lug'aviy / umumiy tarjima (Fallback)
  let translatedText = clean;
  if (targetLang === 'ru') {
    const dict = WORD_DICT.ru;
    const words = lower.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else if (targetLang === 'en') {
    const dict = WORD_DICT.en;
    const words = lower.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else if (targetLang === 'tr') {
    const dict = WORD_DICT.tr;
    const words = lower.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
    const mapped = words.map(w => dict[w] || w).join(' ');
    translatedText = mapped.charAt(0).toUpperCase() + mapped.slice(1);
    if (clean.includes('?')) translatedText += '?';
  } else {
    translatedText = clean;
  }

  const pronunciation = toPhonetic(translatedText);

  return {
    partnerText: `Siz yozgan gap (${clean}):`,
    partnerMeaning: clean,
    detectedLanguage: langObj,
    userResponse: translatedText,
    userMeaning: clean,
    userPronunciation: `[${pronunciation}]`,
    userNote: `Tarjima (${langObj.name})`,
    isJoke: false,
    allVariants: [
      { text: translatedText, meaning: clean, note: `Tarjima (${langObj.name})` }
    ],
    currentVariantIndex: 0,
    totalVariants: 1,
    isUserSpeechMode: true
  };
}
