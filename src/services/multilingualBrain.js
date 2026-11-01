/**
 * SuhbatDosh - Ko'p tilli va Tarixni Eslab Qoluvchi Katta Ong (Multilingual Context Brain)
 * 
 * Tillar: Ruscha (RU), Inglizcha (EN), O'zbekcha (UZ), Turkcha (TR), Qozoqcha (KK), 
 * Nemischa (DE), Fransuzcha (FR), Ispancha (ES) va h.k.
 * 
 * Qoidalar:
 * 1. Suhbat tarixini to'liq eslab qoladi (Recall from memory).
 * 2. Savolga 100% aniq va tabiiy javob + Suhbatni davom ettiruvchi savol.
 * 3. Tagida to'liq O'zbekcha ma'nosi + Lotincha talaffuz o'qilishi.
 * 4. Quruq shablonlarsiz, jonli so'zlashuv va jargonlar.
 * 5. Suhbat mavzusiga mos dinamik hazillar.
 */

import { detectLanguage } from './languageDetector.js';
import { toPhonetic } from './conversationEngine.js';
import { dialogueMemory } from './dialogueMemory.js';
import { translateRussianToUzbek } from './nativeBrain.js';

// INGLIZCHA DIALOG MATRITSI
const EN_DIALOGUE_MAP = [
  // 1. App Testing
  {
    matcher: (t) => /test.*?app|app.*?test|check.*?app|continue.*?dialogue|mind.*?testing/i.test(t),
    meaning: "Yangi ilovani sinab ko'rish uchun suhbatlashishga rozilik so'ramoqda",
    responses: [
      {
        text: "Hey! Not at all, I'd love to test it. What should we start with?",
        meaning: "Salom! Umuman qarshi emasman, sinab ko'rishga tayyorman. Nimadan boshlaymiz?",
        note: "Rozilik + savol"
      },
      {
        text: "Sure thing! Sounds interesting. What kind of app are you building?",
        meaning: "Albatta! Qiziq tuyuldi. Qanday ilova yaratyapsan?",
        note: "Yordam + qiziqish"
      }
    ],
    jokes: [
      {
        text: "As long as your app doesn't take over the world) What's the first test?",
        meaning: "Faqat ilovang dunyoni egallab olmasa bo'ldi) Birinchi test qanday?",
        note: "IT hazili"
      }
    ]
  },

  // 2. City / Where do you live
  {
    matcher: (t) => /which city|what city|where do you live|where are you from|where you from/i.test(t),
    meaning: "Qaysi shahardansan? / Qayerda yashaysan?",
    responses: [
      {
        text: "I'm from (city). Are you local here or did you move recently?",
        meaning: "Men (shahar)danman. O'zing shu yerdanmisan yoki yaqinda ko'chib keldingmi?",
        note: "Aniq javob + savol"
      },
      {
        text: "I live in (city). Have you ever visited that city?",
        meaning: "Men (shahar)da yashayman. U yerga biror marta borganmisan?",
        note: "Suhbatni ulash"
      }
    ],
    jokes: [
      {
        text: "I'm from (city), where Google Maps gets lost too) Do you know this area well?",
        meaning: "Men hatto Google xaritalari ham adashadigan (shahar)danman) Bu hududni yaxshi bilasanmi?",
        note: "Shahar hazili"
      }
    ]
  },

  // 3. What do you do / Work
  {
    matcher: (t) => /what do you do|what are you doing|what's your job|what is your profession|where do you work/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Kasbing nima?",
    responses: [
      {
        text: "I work in (field). Do you enjoy what you do for a living?",
        meaning: "Men (soha) sohasida ishlayman. O'zingga o'z ishing yoqadimi?",
        note: "Kasb + savol"
      },
      {
        text: "Just chilling and chatting right now. How are you planning your evening?",
        meaning: "Hozircha shunchaki dam olib suhbatlashyapman. O'zing kechni qanday rejalashtiryapsan?",
        note: "Hozirgi holat"
      }
    ],
    jokes: [
      {
        text: "I mainly turn coffee into results) What about you?",
        meaning: "Men kofeni natijaga aylantirib turaman) O'zing-chi?",
        note: "Ish hazili"
      }
    ]
  },

  // 4. Greetings
  {
    matcher: (t) => /^(hello|hi|hey|good morning|good afternoon|good evening|what's up)[\s.!?,]*$/i.test(t.trim()) || /\b(hello|hi|hey)\b/i.test(t),
    meaning: "Salom! / Xayrli kun!",
    responses: [
      {
        text: "Hey there! How has your day been going?",
        meaning: "Salom! Kuning qanday o'tyapti?",
        note: "Samimiy salom + savol"
      },
      {
        text: "Hi! Glad to hear from you. What's new today?",
        meaning: "Salom! Eshitganimdan xursandman. Bugun nima yangiliklar?",
        note: "Jonli so'zlashuv"
      }
    ],
    jokes: [
      {
        text: "Hey! I was just thinking about you) How's life?",
        meaning: "Salom! Hozirgina seni o'ylagandim) Hayot qalay?",
        note: "Iliq hazil"
      }
    ]
  },

  // 5. How are you
  {
    matcher: (t) => /how are you|how is it going|how are things|how you doing|how's your day/i.test(t),
    meaning: "Ishlaring qalay? / Ahvoling qanday?",
    responses: [
      {
        text: "Doing great, thank you! What exciting things happened in your day?",
        meaning: "Hammasi a'lo, rahmat! Bugun o'zingda qanday qiziq voqealar bo'ldi?",
        note: "A'lo + savol"
      },
      {
        text: "Can't complain, pretty good! What are your plans for today?",
        meaning: "Yomon emas, ancha yaxshi! Bugunga qanday rejalaring bor?",
        note: "Rejalar"
      }
    ],
    jokes: [
      {
        text: "So good that it's almost suspicious) How about you?",
        meaning: "Shunchalik yaxshiki, hatto shubhali) O'zingda-chi?",
        note: "Kayfiyat hazili"
      }
    ]
  },

  // 6. Name / Acquaintance
  {
    matcher: (t) => /what is your name|what's your name|your name|who are you/i.test(t),
    meaning: "Isming nima? / Tanishaylikmi?",
    responses: [
      {
        text: "I am (name). Very nice to meet you! What's your name?",
        meaning: "Men (ism)man. Tanishganimdan xursandman! O'zingning isming nima?",
        note: "Tanishuv + savol"
      }
    ],
    jokes: [
      {
        text: "I am (name). The main goal is not to forget names in five minutes) And you?",
        meaning: "Men (ism)man. Asosiysi 5 daqiqadan keyin esdan chiqarmaslik) O'zingniki-chi?",
        note: "Ism hazili"
      }
    ]
  },

  // 7. Coffee / Meetup
  {
    matcher: (t) => /coffee|grab a coffee|drink coffee|meet up|hang out|get food/i.test(t),
    meaning: "Kofe ichamizmi? / Uchrashamizmi?",
    responses: [
      {
        text: "I'd love to! What time and which cafe do you prefer?",
        meaning: "Jon deb! Soat nechada va qaysi qahvaxonani ma'qul ko'rasan?",
        note: "Rozilik + vaqt"
      },
      {
        text: "Sure, let's go. Do you know a cozy place around here?",
        meaning: "Albatta, ketdik. Shu atrofda shinam joyni bilasanmi?",
        note: "Joy tanlash"
      }
    ],
    jokes: [
      {
        text: "As long as the coffee is top-notch) What spot do you have in mind?",
        meaning: "Asosiysi kofesi zo'r bo'lsin) Qaysi joy ko'nglingda bor?",
        note: "Kofe hazili"
      }
    ]
  }
];

// TURKCHA DIALOG MATRITSI
const TR_DIALOGUE_MAP = [
  {
    matcher: (t) => /merhaba|selam|günaydın|iyi günler/i.test(t),
    meaning: "Salom! / Xayrli kun!",
    responses: [
      {
        text: "Merhaba! Günün nasıl geçiyor?",
        meaning: "Salom! Kuning qanday o'tyapti?",
        note: "Salom + savol"
      },
      {
        text: "Selam! Seni duyduğuma sevindim, ne haber?",
        meaning: "Salom! Eshitganimdan xursandman, nima gaplar?",
        note: "Do'stona"
      }
    ],
    jokes: [
      {
        text: "Selam! Tam da senden bahsediyordum) Hayat nasıl?",
        meaning: "Salom! Hozirgina sen haqingda gapirayotgandim) Hayot qalay?",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /nasılsın|nasıl gidiyor|ne var ne yok/i.test(t),
    meaning: "Qalaysan? / Ishlar qanday ketyapti?",
    responses: [
      {
        text: "Her şey harika, teşekkürler! Sende ne var ne yok?",
        meaning: "Hammasi ajoyib, rahmat! O'zingda nima gaplar?",
        note: "A'lo + savol"
      }
    ],
    jokes: [
      {
        text: "O kadar iyiyim ki şüpheli) Sende durumlar nasıl?",
        meaning: "Shunchalik yaxshiki, hatto shubhali) O'zingda ahvol qanday?",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /nerelisin|hangi şehir|nerede yaşıyorsun/i.test(t),
    meaning: "Qayerdansan? / Qaysi shaharda yashaysan?",
    responses: [
      {
        text: "Ben (şehir)'liyim. Sen buralı mısın yoksa taşındın mı?",
        meaning: "Men (shahar)likman. O'zing shu yerdanmisan yoki ko'chib kelganmisan?",
        note: "Shahar + savol"
      }
    ],
    jokes: [
      {
        text: "Navigasyonsuz gezilmeyen (şehir)'denim) Şehri iyi bilir misin?",
        meaning: "Navigatorsiz yurib bo'lmaydigan (shahar)likman) Shaharni yaxshi bilasanmi?",
        note: "Shahar hazili"
      }
    ]
  },
  {
    matcher: (t) => /ne iş yapıyorsun|mesleğin ne|ne yapıyorsun/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Kasbing nima?",
    responses: [
      {
        text: "(alan) alanında çalışıyorum. Sen işini seviyor musun?",
        meaning: "(Soha) sohasida ishlayman. O'zing ishingni sevasanmi?",
        note: "Kasb + savol"
      }
    ],
    jokes: [
      {
        text: "Kahveyi sonuca dönüştürüyorum) Sen ne yapıyorsun?",
        meaning: "Kofeni natijaga aylantiraman) O'zing nima ish qilasan?",
        note: "Hazil"
      }
    ]
  }
];

// O'ZBEKCHA DIALOG MATRITSI
const UZ_DIALOGUE_MAP = [
  {
    matcher: (t) => /salom|assalomu alaykum|qalaysiz|qalesiz|yaxshimisiz/i.test(t),
    meaning: "Salomlashish va hol-ahvol so'rash",
    responses: [
      {
        text: "Salom! Rahmat, a'lo darajada. Kuningiz qanday o'tyapti?",
        meaning: "Salom! Rahmat, a'lo darajada. Kuningiz qanday o'tyapti?",
        note: "Samimiy salom + savol"
      },
      {
        text: "Assalomu alaykum! Xursandman eshitganimdan. O'zingizda nima yangiliklar?",
        meaning: "Assalomu alaykum! O'zingizda nima yangiliklar?",
        note: "Odobli"
      }
    ],
    jokes: [
      {
        text: "Salom! Hozirgina sizni eslayotgandim) Kayfiyatlar qalay?",
        meaning: "Salom! Hozirgina sizni eslayotgandim) Kayfiyatlar qalay?",
        note: "Iliq hazil"
      }
    ]
  },
  {
    matcher: (t) => /qayerdansiz|qaysi shahardansiz|qayerda yashaysiz|qayerliksiz/i.test(t),
    meaning: "Shahar va manzil haqida so'ramoqda",
    responses: [
      {
        text: "Men (shahar)danman. O'zingiz shu yerdanmisiz yoki ko'chib kelganmisiz?",
        meaning: "Men (shahar)danman. O'zingiz shu yerdanmisiz yoki ko'chib kelganmisiz?",
        note: "Aniq javob + savol"
      }
    ],
    jokes: [
      {
        text: "Men (shahar)danman, navigatorsiz adashib qolish hech gap emas) Shaharni yaxshi bilasizmi?",
        meaning: "Men (shahar)danman) Shaharni yaxshi bilasizmi?",
        note: "Shahar hazili"
      }
    ]
  },
  {
    matcher: (t) => /nima ish qilasiz|kasbingiz nima|nima bilan bandsiz|qayerda clarifies/i.test(t),
    meaning: "Kasb va mashg'ulot haqida so'ramoqda",
    responses: [
      {
        text: "(soha) sohasida ishlayman. O'zingizga ishingiz yoqadimi?",
        meaning: "(soha) sohasida ishlayman. O'zingizga ishingiz yoqadimi?",
        note: "Kasb + savol"
      }
    ],
    jokes: [
      {
        text: "(soha)daman — asosan qahvani natijalarga aylantiraman) O'zingiz nima ish qilasiz?",
        meaning: "Qahvani natijalarga aylantiraman) O'zingiz nima ish qilasiz?",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /kofe|qahva|aylanamizmi|uchrashamizmi|kofe ichamizmi/i.test(t),
    meaning: "Kofe ichish yoki uchrashuv taklifi",
    responses: [
      {
        text: "Jon deb, ajoyib fikr! Soat nechada va qaysi qahvaxonaga boramiz?",
        meaning: "Jon deb, ajoyib fikr! Soat nechada va qayerga boramiz?",
        note: "Rozilik + vaqt"
      }
    ],
    jokes: [
      {
        text: "Asosiysi qahvasi zo'r bo'lsin) Qaysi joy ko'nglingizda bor?",
        meaning: "Asosiysi kofesi zo'r bo'lsin) Qaysi joy bor?",
        note: "Qahva hazili"
      }
    ]
  }
];

// O'ZBEKCHAGA HAR QANDAY TILNI TARJIMA QILISH (Universal Fast Translator)
export function translateAnyToUzbek(text, langCode = 'ru') {
  if (!text) return '';
  const clean = text.trim();

  // Agar ruscha bo'lsa
  if (langCode === 'ru' || /[а-яё]/i.test(clean)) {
    return translateRussianToUzbek(clean);
  }

  // Agar o'zbekcha bo'lsa
  if (langCode === 'uz') {
    return clean;
  }

  // Agar inglizcha bo'lsa
  if (langCode === 'en') {
    const lower = clean.toLowerCase();
    if (/which city|where are you from|where do you live/i.test(lower)) return "Qaysi shahardansiz? / Qayerda yashaysiz?";
    if (/what do you do|what are you doing/i.test(lower)) return "Nima ish bilan shug'ullanasiz? / Nima qilyapsiz?";
    if (/how are you|how is it going/i.test(lower)) return "Ishlaringiz qalay? / Ahvolingiz qanday?";
    if (/what is your name|what's your name/i.test(lower)) return "Ismingiz nima? / Tanishaylikmi?";
    if (/coffee|hang out|meet up/i.test(lower)) return "Kofe ichamizmi? / Uchrashamizmi?";
    if (/hello|hi|hey/i.test(lower)) return "Salom! / Assalomu alaykum!";
    if (/thank you|thanks/i.test(lower)) return "Rahmat! / Tashakkur!";
    if (/bye|see you/i.test(lower)) return "Xayr! / Ko'rishguncha!";
    if (/yes|sure|okay/i.test(lower)) return "Ha / Albatta / Kelishdik";
    if (/no\b|nope/i.test(lower)) return "Yo'q";
    return `Suhbatdosh (Inglizcha): "${clean}"`;
  }

  // Agar turkcha bo'lsa
  if (langCode === 'tr') {
    const lower = clean.toLowerCase();
    if (/merhaba|selam/i.test(lower)) return "Salom! / Assalomu alaykum!";
    if (/nasılsın|nasıl gidiyor/i.test(lower)) return "Ishlaringiz qalay? / Ahvolingiz qanday?";
    if (/nerelisin/i.test(lower)) return "Qaysi shahardansiz? / Qayerdansiz?";
    if (/ne iş yapıyorsun/i.test(lower)) return "Kasbingiz nima? / Nima ish qilasiz?";
    if (/kahve/i.test(lower)) return "Kofe ichamizmi?";
    return `Suhbatdosh (Turkcha): "${clean}"`;
  }

  // Agar qozoqcha bo'lsa
  if (langCode === 'kk') {
    const lower = clean.toLowerCase();
    if (/сәлем|амансың ба/i.test(lower)) return "Salom! / Assalomu alaykum!";
    if (/қалың қалай|жағдай қалай/i.test(lower)) return "Ishlaringiz qalay? / Qalaysiz?";
    if (/қай қаладансың|қайдансың/i.test(lower)) return "Qaysi shahardansiz? / Qayerdansiz?";
    return `Suhbatdosh (Qozoqcha): "${clean}"`;
  }

  return `Suhbatdoshingiz: "${clean}"`;
}

/**
 * Universal ko'p tilli va tarixiy ong generatori
 */
export function generateMultilingualResponse(input, selectedIndex = 0, isJokeRequested = false) {
  if (!input || !input.trim()) {
    return {
      partnerText: "Привет!",
      partnerMeaning: "Salom! / Assalomu alaykum!",
      detectedLanguage: { code: 'ru', name: 'Rus tili', flag: '🇷🇺' },
      userResponse: "Привет! Как твой день проходит?",
      userMeaning: "Salom! Kuning qanday o'tyapti?",
      userPronunciation: "[Privet! Kak tvoy den proxodit?]",
      userNote: "Samimiy salom + savol",
      isJoke: false,
      allVariants: [
        { text: "Привет! Как твой день проходит?", meaning: "Salom! Kuning qanday o'tyapti?", note: "Samimiy salom + savol" },
        { text: "Салют! Рад слышать, как твое настроение?", meaning: "Salom! Eshitganimdan xursandman, kayfiyating qalay?", note: "Jonli so'zlashuv" }
      ],
      currentVariantIndex: 0,
      totalVariants: 2,
      stepCount: 1
    };
  }

  const clean = input.trim();
  const detectedLang = detectLanguage(clean);
  const langCode = detectedLang.code;
  const partnerMeaning = translateAnyToUzbek(clean, langCode);

  // 1. TARIQATDAN QIDIRISH (Avvalo xotirani tekshirish: ism, ilova, o'tgan mavzu)
  const historyAnswer = dialogueMemory.findAnswerFromHistory(clean, langCode);
  if (historyAnswer) {
    const pronunciation = toPhonetic(historyAnswer.text);
    return {
      partnerText: clean,
      partnerMeaning: partnerMeaning,
      detectedLanguage: detectedLang,
      userResponse: historyAnswer.text,
      userMeaning: historyAnswer.meaning,
      userPronunciation: `[${pronunciation}]`,
      userNote: historyAnswer.note || "Tarixdan eslash",
      isJoke: false,
      allVariants: [
        { text: historyAnswer.text, meaning: historyAnswer.meaning, note: historyAnswer.note || "Xotiradan aniq javob" }
      ],
      currentVariantIndex: 0,
      totalVariants: 1,
      stepCount: dialogueMemory.getStepCount()
    };
  }

  // 2. TIL BO'YICHA SEMANTIK XARITANI TANLASH
  let mapToUse = null;
  if (langCode === 'en') {
    mapToUse = EN_DIALOGUE_MAP;
  } else if (langCode === 'tr') {
    mapToUse = TR_DIALOGUE_MAP;
  } else if (langCode === 'uz') {
    mapToUse = UZ_DIALOGUE_MAP;
  }

  let matched = null;
  if (mapToUse) {
    matched = mapToUse.find(item => item.matcher(clean));
  }

  // Agar tanlangan tilda topilmasa yoki til Ruscha bo'lsa, ruscha eng boy bazaga murojaat qilamiz
  if (!matched && (langCode === 'ru' || !mapToUse)) {
    // nativeBrain'dagi boy bazadan foydalanamiz
    const { generateAcquaintanceResponse } = requireNativeBrain();
    const res = generateAcquaintanceResponse(clean, selectedIndex, isJokeRequested);
    return {
      ...res,
      partnerMeaning: partnerMeaning || res.partnerMeaning,
      stepCount: dialogueMemory.getStepCount()
    };
  }

  // Agar chet tilida matched bo'lmasa, chet tili uchun mantiqiy ulovchi javob
  if (!matched) {
    if (langCode === 'en') {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "That sounds logical! What are your thoughts on that moving forward?", meaning: "Mantiqli eshitildi! Bu borada keyin nima deb o'ylaysan?", note: "Mantiqiy savol" },
          { text: "I totally agree with you. How did you come to that conclusion?", meaning: "Senga to'liq qo'shilaman. Bu fikrga qanday kelding?", note: "Qiziqish" }
        ],
        jokes: [
          { text: "Sounds solid, I won't even argue with that) What's next on your mind?", meaning: "Salobatli eshitildi, bahslashmayman ham) Keyin nima rejalaring bor?", note: "Hazil" }
        ]
      };
    } else if (langCode === 'tr') {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Çok mantıklı! Peki bu konuda daha sonra ne düşünüyorsun?", meaning: "Juda mantiqli! Bu borada keyin nima deb o'ylaysan?", note: "Mantiqiy davom" },
          { text: "Sana katılıyorum. Bu sonuca nasıl vardın?", meaning: "Senga qo'shilaman. Bu xulosaga qanday kelding?", note: "Qiziqish" }
        ],
        jokes: [
          { text: "Kulağa harika geliyor, hiç itiraz etmem) Sırada ne var?", meaning: "Ajoyib eshitildi, e'tiroz bildirmayman) Keyingi rejalar nima?", note: "Hazil" }
        ]
      };
    } else {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Mantiqli eshitildi! Bu borada keyin nima deb o'ylaysiz?", meaning: "Mantiqli eshitildi! Bu borada keyin nima deb o'ylaysiz?", note: "Mantiqiy davom" },
          { text: "To'liq qo'shilaman. Bu fikrga qanday keldingiz?", meaning: "To'liq qo'shilaman. Bu fikrga qanday keldingiz?", note: "Qiziqish" }
        ],
        jokes: [
          { text: "Gap bo'lishi mumkin emas, hatto bahslashmayman ham) Keyin nima rejalaringiz bor?", meaning: "Bahslashmayman ham) Keyin nima rejalaringiz bor?", note: "Hazil" }
        ]
      };
    }
  }

  let candidateList = isJokeRequested && matched.jokes && matched.jokes.length > 0
    ? matched.jokes
    : matched.responses;

  const activeIndex = selectedIndex % candidateList.length;
  const selected = candidateList[activeIndex];
  const pronunciation = toPhonetic(selected.text);

  return {
    partnerText: clean,
    partnerMeaning: matched.meaning || partnerMeaning,
    detectedLanguage: detectedLang,
    userResponse: selected.text,
    userMeaning: selected.meaning,
    userPronunciation: `[${pronunciation}]`,
    userNote: selected.note,
    isJoke: isJokeRequested,
    allVariants: candidateList,
    currentVariantIndex: activeIndex,
    totalVariants: candidateList.length,
    stepCount: dialogueMemory.getStepCount()
  };
}

// Native brainni xavfsiz yuklash
import { generateAcquaintanceResponse as nativeBrainFunc } from './nativeBrain.js';
function requireNativeBrain() {
  return { generateAcquaintanceResponse: nativeBrainFunc };
}
