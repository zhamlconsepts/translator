/**
 * SuhbatDosh - Ko'p tilli va Tarixni Eslab Qoluvchi Katta Ong (Multilingual Context Brain)
 * 
 * Qoidalar:
 * 1. Savollarga FAQAT ANIQ JAVOB beriladi (ortiqcha yopishtirilgan savollarsiz).
 * 2. FAQAT kompliment / flirt vaziyatidagina savol beriladi.
 * 3. Tinch bo'lib qolganda (jimlik, qisqa "ha", "ok", "nega jimsan") suhbatni jonlantiruvchi SAVOL TAKLIF QILINADI.
 * 4. Qolgan ortiqcha narsalar yo'q!
 */

import { detectLanguage } from './languageDetector.js';
import { toPhonetic } from './conversationEngine.js';
import { dialogueMemory } from './dialogueMemory.js';
import { translateRussianToUzbek, generateAcquaintanceResponse as nativeBrainFunc } from './nativeBrain.js';

// INGLIZCHA DIALOG MATRITSI
const EN_DIALOGUE_MAP = [
  // 1. City / Where do you live -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /which city|what city|where do you live|where are you from|where you from/i.test(t),
    meaning: "Qaysi shahardansan? / Qayerda yashaysan?",
    responses: [
      {
        text: "I'm from (city).",
        meaning: "Men (shahar)danman.",
        note: "Aniq javob"
      },
      {
        text: "I live in (city).",
        meaning: "Men (shahar)da yashayman.",
        note: "Qisqa javob"
      }
    ],
    jokes: [
      {
        text: "I'm from (city), where even Google Maps gets lost)",
        meaning: "Men hatto Google xaritalari ham adashadigan (shahar)danman)",
        note: "Shahar hazili"
      }
    ]
  },

  // 2. What do you do / Work -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /what do you do|what are you doing|what's your job|what is your profession|where do you work/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Kasbing nima?",
    responses: [
      {
        text: "I work in (field).",
        meaning: "Men (soha) sohasida ishlayman.",
        note: "Aniq javob"
      },
      {
        text: "Just chilling and relaxing right now.",
        meaning: "Hozircha shunchaki dam olyapman.",
        note: "Dam olish"
      }
    ],
    jokes: [
      {
        text: "I mainly turn coffee into results)",
        meaning: "Men kofeni natijaga aylantirib turaman)",
        note: "Ish hazili"
      }
    ]
  },

  // 3. Greetings -> FAQAT JAVOB!
  {
    matcher: (t) => /^(hello|hi|hey|good morning|good afternoon|good evening|what's up)[\s.!?,]*$/i.test(t.trim()) || /\b(hello|hi|hey)\b/i.test(t),
    meaning: "Salom! / Xayrli kun!",
    responses: [
      {
        text: "Hey there!",
        meaning: "Salom!",
        note: "Oddiy salom"
      },
      {
        text: "Hi! Glad to hear from you.",
        meaning: "Salom! Eshitganimdan xursandman.",
        note: "Do'stona"
      }
    ],
    jokes: [
      {
        text: "Hey! I was just thinking about you)",
        meaning: "Salom! Hozirgina seni o'ylagandim)",
        note: "Iliq hazil"
      }
    ]
  },

  // 4. How are you -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /how are you|how is it going|how are things|how you doing|how's your day/i.test(t),
    meaning: "Ishlaring qalay? / Ahvoling qanday?",
    responses: [
      {
        text: "Doing great, thank you!",
        meaning: "Hammasi a'lo, rahmat!",
        note: "A'lo javob"
      },
      {
        text: "Pretty good, everything is fine.",
        meaning: "Hammasi yaxshi, joyida.",
        note: "Oddiy javob"
      }
    ],
    jokes: [
      {
        text: "So good that it's almost suspicious)",
        meaning: "Shunchalik yaxshiki, hatto shubhali)",
        note: "Kayfiyat hazili"
      }
    ]
  },

  // 5. Name / Acquaintance -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /what is your name|what's your name|your name|who are you/i.test(t),
    meaning: "Isming nima? / Tanishaylikmi?",
    responses: [
      {
        text: "I am (name). Nice to meet you!",
        meaning: "Men (ism)man. Tanishganimdan xursandman!",
        note: "Tanishuv"
      }
    ],
    jokes: [
      {
        text: "I am (name). Just don't forget it in five minutes)",
        meaning: "Men (ism)man. 5 minutdan keyin unutmasang bo'ldi)",
        note: "Ism hazili"
      }
    ]
  },

  // 6. Compliment -> KOMPLIMENTDA SAVOL BERILADI!
  {
    matcher: (t) => /you look great|you are beautiful|handsome|cute|gorgeous|pretty/i.test(t),
    meaning: "Juda chiroylisan / Ajoyib ko'rinyapsan (Kompliment)",
    responses: [
      {
        text: "Thank you so much! Are you always this charming?",
        meaning: "Katta rahmat! O'zing doim shunday e'tiborlimisan?",
        note: "Komplimentga savol"
      },
      {
        text: "Thank you! You look amazing yourself.",
        meaning: "Rahmat! O'zing ham ajoyib ko'rinyapsan.",
        note: "Qaytarma maqtov"
      }
    ],
    jokes: [
      {
        text: "Thank you, I spent hours in front of the mirror) Do you compliment people often?",
        meaning: "Rahmat, oyna oldida soatlab tayyorlandim) Tez-tez maqtov aytib turasanmi?",
        note: "Hazil"
      }
    ]
  },

  // 7. Silence / Stalled dialogue -> TINCH BO'LIB QOLGANDA SAVOL TAKLIF QIL!
  {
    matcher: (t) => /^(?:yes|yeah|yep|sure|ok|okay|cool|nice|good|right)[\s.!?,]*$/i.test(t.trim()) || /why are you quiet|why silent|you there/i.test(t),
    meaning: "Suhbat to'xtab qoldi / Jimlik (Suhbatni jonlantirish)",
    responses: [
      {
        text: "By the way, what are your plans for tonight?",
        meaning: "Aytgancha, bugun kechga qanday rejalaring bor?",
        note: "Reja so'rash"
      },
      {
        text: "Would you like to grab some coffee?",
        meaning: "Birga kofe ichsak nima deysan?",
        note: "Kofe taklifi"
      },
      {
        text: "What kind of music or movies do you like?",
        meaning: "Qanday musiqa yoki filmlarni yoqtirasan?",
        note: "Qiziqish savoli"
      }
    ],
    jokes: [
      {
        text: "Just picking the smartest words to say) What are you thinking about?",
        meaning: "Eng aqlli so'zlarni tanlayotgandim) O'zing nimalarni o'ylayapsan?",
        note: "Hazil"
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
        text: "Merhaba!",
        meaning: "Salom!",
        note: "Salom"
      },
      {
        text: "Selam, seni duyduğuma sevindim!",
        meaning: "Salom, eshitganimdan xursandman!",
        note: "Do'stona"
      }
    ],
    jokes: [
      {
        text: "Selam! Tam da senden bahsediyordum)",
        meaning: "Salom! Hozirgina sen haqingda o'ylayotgandim)",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /nasılsın|nasıl gidiyor|ne var ne yok/i.test(t),
    meaning: "Qalaysan? / Ishlar qanday ketyapti?",
    responses: [
      {
        text: "Her şey harika, teşekkürler!",
        meaning: "Hammasi ajoyib, rahmat!",
        note: "A'lo"
      },
      {
        text: "İyiyim, her şey yolunda.",
        meaning: "Yaxshiman, hammasi joyida.",
        note: "Oddiy"
      }
    ],
    jokes: [
      {
        text: "O kadar iyiyim ki şüpheli)",
        meaning: "Shunchalik yaxshiki, hatto shubhali)",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /nerelisin|hangi şehir|nerede yaşıyorsun/i.test(t),
    meaning: "Qayerdansan? / Qaysi shaharda yashaysan?",
    responses: [
      {
        text: "Ben (şehir)'liyim.",
        meaning: "Men (shahar)likman.",
        note: "Aniq javob"
      }
    ],
    jokes: [
      {
        text: "Navigasyonsuz gezilmeyen (şehir)'denim)",
        meaning: "Navigatorsiz yurib bo'lmaydigan (shahar)likman)",
        note: "Hazil"
      }
    ]
  },
  {
    matcher: (t) => /ne iş yapıyorsun|mesleğin ne|ne yapıyorsun/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Kasbing nima?",
    responses: [
      {
        text: "(alan) alanında çalışıyorum.",
        meaning: "(Soha) sohasida ishlayman.",
        note: "Aniq javob"
      }
    ],
    jokes: [
      {
        text: "Kahveyi sonuca dönüştürüyorum)",
        meaning: "Kofeni natijaga aylantiraman)",
        note: "Hazil"
      }
    ]
  },
  // Kompliment
  {
    matcher: (t) => /çok güzelsin|yakışıklısın|harika görünüyorsun/i.test(t),
    meaning: "Juda chiroylisan (Kompliment)",
    responses: [
      {
        text: "Çok teşekkür ederim! Hep böyle kibar mısın?",
        meaning: "Katta rahmat! O'zing doim shunday muloyimmisan?",
        note: "Komplimentga savol"
      }
    ],
    jokes: [
      {
        text: "Aynanın karşısında saatler harcadım)",
        meaning: "Oyna oldida soatlab tayyorlandim)",
        note: "Hazil"
      }
    ]
  },
  // Jimlik
  {
    matcher: (t) => /^(?:evet|tamam|peki|güzel)[\s.!?,]*$/i.test(t.trim()) || /neden sustun|orada mısın/i.test(t),
    meaning: "Jimlik (Suhbatni jonlantirish)",
    responses: [
      {
        text: "Bu akşam için planların neler?",
        meaning: "Bugun oqshomga rejalaring qanday?",
        note: "Reja so'rash"
      },
      {
        text: "Kahve içmeye ne dersin?",
        meaning: "Kofe ichsak nima deysan?",
        note: "Kofe taklifi"
      }
    ],
    jokes: [
      {
        text: "En akıllı sözleri seçmeye çalışıyordum)",
        meaning: "Eng aqlli so'zlarni tanlayotgandim)",
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
        text: "Salom! Rahmat, hammasi yaxshi.",
        meaning: "Salom! Rahmat, hammasi yaxshi.",
        note: "Salom"
      },
      {
        text: "Assalomu alaykum! Xursandman eshitganimdan.",
        meaning: "Assalomu alaykum! Xursandman eshitganimdan.",
        note: "Odobli"
      }
    ],
    jokes: [
      {
        text: "Salom! Hozirgina sizni eslayotgandim)",
        meaning: "Salom! Hozirgina sizni eslayotgandim)",
        note: "Iliq hazil"
      }
    ]
  },
  {
    matcher: (t) => /qayerdansiz|qaysi shahardansiz|qayerda yashaysiz|qayerliksiz/i.test(t),
    meaning: "Shahar va manzil haqida so'ramoqda",
    responses: [
      {
        text: "Men (shahar)danman.",
        meaning: "Men (shahar)danman.",
        note: "Aniq javob"
      }
    ],
    jokes: [
      {
        text: "Men (shahar)danman, navigatorsiz adashib qolish hech gap emas)",
        meaning: "Men (shahar)danman)",
        note: "Shahar hazili"
      }
    ]
  },
  {
    matcher: (t) => /nima ish qilasiz|kasbingiz nima|nima bilan bandsiz/i.test(t),
    meaning: "Kasb va mashg'ulot haqida so'ramoqda",
    responses: [
      {
        text: "(soha) sohasida ishlayman.",
        meaning: "(soha) sohasida ishlayman.",
        note: "Aniq javob"
      }
    ],
    jokes: [
      {
        text: "(soha)daman — asosan qahvani natijalarga aylantiraman)",
        meaning: "Qahvani natijalarga aylantiraman)",
        note: "Hazil"
      }
    ]
  },
  // Kompliment
  {
    matcher: (t) => /chiroylisiz|ajoyib korinasiz|chiroyli/i.test(t),
    meaning: "Maqtov / Kompliment",
    responses: [
      {
        text: "Katta rahmat, juda yoqimli! O'zingiz doim shunday e'tiborlimisiz?",
        meaning: "Katta rahmat, juda yoqimli! O'zingiz doim shunday e'tiborlimisiz?",
        note: "Komplimentga savol"
      }
    ],
    jokes: [
      {
        text: "Rahmat, oyna oldida rosa harakat qildim)",
        meaning: "Rahmat, oyna oldida rosa harakat qildim)",
        note: "Hazil"
      }
    ]
  },
  // Jimlik
  {
    matcher: (t) => /^(?:ha|mayli|xop|yaxshi|tushunarli)[\s.!?,]*$/i.test(t.trim()) || /nega jimsiz|qayerdasiz/i.test(t),
    meaning: "Suhbat to'xtab qoldi (Suhbatni jonlantirish)",
    responses: [
      {
        text: "Aytgancha, bugun kechga qanday rejalaringiz bor?",
        meaning: "Aytgancha, bugun kechga qanday rejalaringiz bor?",
        note: "Reja so'rash"
      },
      {
        text: "Birga kofe ichsak nima deysiz?",
        meaning: "Birga kofe ichsak nima deysiz?",
        note: "Kofe taklifi"
      }
    ],
    jokes: [
      {
        text: "Eng aqlli so'zlarni tanlayotgandim) O'zingiz nimalarni o'ylayapsiz?",
        meaning: "Eng aqlli so'zlarni tanlayotgandim)",
        note: "Hazil"
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
      userResponse: "Привет!",
      userMeaning: "Salom!",
      userPronunciation: "[Privet!]",
      userNote: "Oddiy salom",
      isJoke: false,
      allVariants: [
        { text: "Привет!", meaning: "Salom!", note: "Oddiy salom" },
        { text: "Салют, рад слышать!", meaning: "Salom, eshitganimdan xursandman!", note: "Jonli so'zlashuv" }
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
    const res = nativeBrainFunc(clean, selectedIndex, isJokeRequested);
    return {
      ...res,
      partnerMeaning: partnerMeaning || res.partnerMeaning,
      stepCount: dialogueMemory.getStepCount()
    };
  }

  // Agar chet tilida matched bo'lmasa, chet tili uchun mantiqiy aniq javob
  if (!matched) {
    if (langCode === 'en') {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Got it, sounds reasonable.", meaning: "Tushundim, mantiqli.", note: "Rozilik" },
          { text: "I agree with that.", meaning: "Bunga qo'shilaman.", note: "Qo'shilish" }
        ],
        jokes: [
          { text: "Sounds solid, I won't even argue)", meaning: "Salobatli eshitildi, bahslashmayman ham)", note: "Hazil" }
        ]
      };
    } else if (langCode === 'tr') {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Anladım, gayet mantıklı.", meaning: "Tushundim, mantiqli.", note: "Rozilik" },
          { text: "Sana katılıyorum.", meaning: "Senga qo'shilaman.", note: "Qo'shilish" }
        ],
        jokes: [
          { text: "Kulağa harika geliyor, itiraz etmem)", meaning: "Ajoyib eshitildi, e'tiroz bildirmayman)", note: "Hazil" }
        ]
      };
    } else {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Tushundim, mantiqli.", meaning: "Tushundim, mantiqli.", note: "Rozilik" },
          { text: "Sizga qo'shilaman.", meaning: "Sizga qo'shilaman.", note: "Qo'shilish" }
        ],
        jokes: [
          { text: "Gap yo'q, bahslashmayman ham)", meaning: "Bahslashmayman ham)", note: "Hazil" }
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
