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

  // 6. Relationship status -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /are you single|are you married|do you have a girlfriend|do you have a boyfriend|in a relationship/i.test(t),
    meaning: "Uylanganmisan? / Yigiting yoki qizing bormi?",
    responses: [
      {
        text: "No, I'm completely single and free.",
        meaning: "Yo'q, butunlay bo'shman.",
        note: "Aniq javob"
      },
      {
        text: "Single, haven't met the right one yet.",
        meaning: "Bo'ydoqman, hali o'sha insonimni uchratmadim.",
        note: "Samimiy"
      }
    ],
    jokes: [
      {
        text: "In a serious relationship with freedom and coffee)",
        meaning: "Ozodlik va kofe bilan jiddiy munosabatdaman)",
        note: "Hazil"
      }
    ]
  },

  // 7. Hang out / Walk / Meet -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /wanna hang out|wanna walk|let's meet|wanna grab coffee|go for a walk/i.test(t),
    meaning: "Aylangani boramizmi? / Kofe ichamizmi?",
    responses: [
      {
        text: "Sure, I'd love to! What time?",
        meaning: "Albatta, jon deb! Soat nechada?",
        note: "Aniq rozilik"
      },
      {
        text: "Sounds great, let's do it.",
        meaning: "Ajoyib eshitildi, ketdik.",
        note: "Rozilik"
      }
    ],
    jokes: [
      {
        text: "If there's good coffee involved, I'm already on my way)",
        meaning: "Agar yaxshi kofe bo'lsa, allaqachon yo'ldaman)",
        note: "Hazil"
      }
    ]
  },

  // 8. Compliment -> KOMPLIMENTDA SAVOL BERILADI!
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

  // 9. Insult / Debate comeback -> GAPDA YUTIB CHIQISH VA MOT QILISH!
  {
    matcher: (t) => /idiot|stupid|shut up|get lost|bullshit|nonsense|who do you think|annoying|leave me alone|fuck/i.test(t),
    meaning: "Qo'pollik / Bahsda mot qilish va yutib chiqish",
    responses: [
      {
        text: "When people run out of smart arguments, they resort to insults. Anything constructive to say?",
        meaning: "Aqlli dalillar tugaganda haqoratga o'tishadi. Mavzu bo'yicha asosli biror gaping bormi?",
        note: "Baxsda mot qilish"
      },
      {
        text: "Your words say a lot about your manners, but nothing about me.",
        meaning: "So'zlaring men haqimda emas, o'zingning tarbiyang haqida aytib turibdi.",
        note: "Sovuqqon raddiya"
      },
      {
        text: "Wit was never your strong suit, but thanks for trying)",
        meaning: "O'tkir aql senga xos emasligi aniq, ammo urinish uchun rahmat)",
        note: "Qora yumor"
      }
    ],
    jokes: [
      {
        text: "You're trying so hard to offend me that it's almost cute) Take a breath.",
        meaning: "Tegib ketishga shunchalik urinyapsanki, hatto kulgili) Chuqurroq nafas ol.",
        note: "Yengil zarba"
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
  },
  // Hakaret / Tartışma
  {
    matcher: (t) => /aptal|salak|kes sesini|defol|saçmalık|gerizekalı|terbiyesiz/i.test(t),
    meaning: "Qo'pollik / Bahsda mot qilish va yutib chiqish",
    responses: [
      {
        text: "Argümanlar bitince hakarete geçilir. Konu hakkında mantıklı bir sözün var mı?",
        meaning: "Dalillar tugaganda odatda haqoratga o'tishadi. Mavzu bo'yicha asosli biror gaping bormi?",
        note: "Baxsda mot qilish"
      },
      {
        text: "Sözlerin benim hakkımda değil, sadece kendi seviyeni gösteriyor.",
        meaning: "So'zlaring men haqimda emas, faqat o'zingning darajangni ko'rsatyapti.",
        note: "Sovuqqon raddiya"
      }
    ],
    jokes: [
      {
        text: "Beni kırmaya o kadar uğraşıyorsun ki neredeyse üzüleceğim) Biraz sakin ol.",
        meaning: "Meni xafa qilishga shunchalik urinyapsanki, hatto rahmim kelyapti) Sal bosiqroq bo'l.",
        note: "Hazil"
      }
    ]
  }
];

// O'ZBEKCHA DIALOG MATRITSI
const UZ_DIALOGUE_MAP = [
  // 1. Salomlashish va hol-ahvol
  {
    matcher: (t) => /salom|assalomu alaykum|qalaysiz|qalesiz|qalesan|yaxshimisiz|yaxshimisan|tuzukmisiz/i.test(t),
    meaning: "Salomlashish va hol-ahvol so'rash",
    responses: [
      {
        text: "Salom! Rahmat, hammasi a'lo darajada.",
        meaning: "Salom! Rahmat, hammasi a'lo darajada.",
        note: "Salom"
      },
      {
        text: "Assalomu alaykum! Eshitganimdan xursandman.",
        meaning: "Assalomu alaykum! Eshitganimdan xursandman.",
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

  // 2. Shahar va manzil (Qayerdansan / Qayerdansiz)
  {
    matcher: (t) => /qayerdansan|qayerdansiz|qaysi shahardansan|qaysi shahardansiz|qayerda yashaysan|qayerda yashaysiz|qayerliksiz|qayerliksan/i.test(t),
    meaning: "Qaysi shahardansan? / Qayerda yashaysan?",
    responses: [
      {
        text: "Men (shahar)danman.",
        meaning: "Men (shahar)danman.",
        note: "Aniq javob"
      },
      {
        text: "(shahar)da yashayman.",
        meaning: "(shahar)da yashayman.",
        note: "Qisqa javob"
      }
    ],
    jokes: [
      {
        text: "Men (shahar)danman, navigatorsiz adashib qolish hech gap emas)",
        meaning: "Men (shahar)danman, navigatorsiz adashib qolasiz)",
        note: "Shahar hazili"
      }
    ]
  },

  // 3. Kim / Ism / Tanishuv
  {
    matcher: (t) => /ismingiz nima|isming nima|tanishaylik|kimsan|kimsiz|otim|isming/i.test(t),
    meaning: "Ismingiz nima? / Tanishaylikmi?",
    responses: [
      {
        text: "Men (ism)man. Tanishganimdan xursandman!",
        meaning: "Men (ism)man. Tanishganimdan xursandman!",
        note: "Tanishuv"
      },
      {
        text: "Ismim (ism).",
        meaning: "Ismim (ism).",
        note: "Qisqa"
      }
    ],
    jokes: [
      {
        text: "Men (ism)man. Besh daqiqadan keyin unutmasangiz bo'lgani)",
        meaning: "Men (ism)man. Besh daqiqadan keyin unutmasangiz bo'lgani)",
        note: "Ism hazili"
      }
    ]
  },

  // 4. Mashg'ulot / Ish / Kasb
  {
    matcher: (t) => /nima ish qilasiz|nima ish qilasan|kasbingiz nima|kasbing nima|nima bilan bandsiz|nima bilan bandsan|nima qilyapsan|nima qilyapsiz/i.test(t),
    meaning: "Kasbingiz nima? / Nima ish qilasiz?",
    responses: [
      {
        text: "(soha) sohasida ishlayman.",
        meaning: "(soha) sohasida ishlayman.",
        note: "Aniq javob"
      },
      {
        text: "Hozircha dam olyapman va suhbatlashyapman.",
        meaning: "Hozircha dam olyapman va suhbatlashyapman.",
        note: "Hozirgi holat"
      }
    ],
    jokes: [
      {
        text: "(soha)daman — asosan qahvani natijalarga aylantiraman)",
        meaning: "(soha)daman — asosan qahvani natijalarga aylantiraman)",
        note: "Ish hazili"
      }
    ]
  },

  // 5. Aylanish / Uchrashuv / Kofe
  {
    matcher: (t) => /aylanamizmi|aylangani boramizmi|qayerga boramiz|kofe ichamizmi|yur aylanaylik|uchrashamizmi/i.test(t),
    meaning: "Aylangani boramizmi? / Kofe ichamizmi?",
    responses: [
      {
        text: "Ketdik, men faqat roziman! Soat nechada?",
        meaning: "Ketdik, men faqat roziman! Soat nechada?",
        note: "Aniq rozilik"
      },
      {
        text: "Yondagi qahvaxonaga kiraylik.",
        meaning: "Yondagi qahvaxonaga kiraylik.",
        note: "Kofe taklifi"
      }
    ],
    jokes: [
      {
        text: "U yerda mazali shirinliklar bo'lsa — hoziroq yugurdim)",
        meaning: "U yerda mazali shirinliklar bo'lsa — hoziroq yugurdim)",
        note: "Hazil"
      }
    ]
  },

  // 6. Oilaviy holat
  {
    matcher: (t) => /uylanganmisan|uylanganmisiz|turmushga chiqqanmisan|yigiting bormi|qizing bormi|sevganing bormi|oilalimisiz/i.test(t),
    meaning: "Oilalimisiz? / Sevganingiz bormi?",
    responses: [
      {
        text: "Yo'q, ko'nglim butunlay bo'sh.",
        meaning: "Yo'q, ko'nglim butunlay bo'sh.",
        note: "Aniq javob"
      },
      {
        text: "Hozircha bo'ydoqman, o'sha insonimni uchratmadim.",
        meaning: "Hozircha bo'ydoqman, o'sha insonimni uchratmadim.",
        note: "Samimiy"
      }
    ],
    jokes: [
      {
        text: "O'z erkinligim va kofe bilan jiddiy munosabatdaman)",
        meaning: "O'z erkinligim va kofe bilan jiddiy munosabatdaman)",
        note: "Hazil"
      }
    ]
  },

  // 7. Bahsda yutish va haqoratga o'tkir raddiya (GAPDA DOIM YUTIB CHIQISH)
  {
    matcher: (t) => /ahmoq|tentak|jinni|yoqol|bor yoqol|asabimga tegma|befarosat|tupoy|chala|ogzingni yop|tur yoqol|kaltabin|odobsiz/i.test(t),
    meaning: "Qo'pollik / Bahsda mot qilish va yutib chiqish",
    responses: [
      {
        text: "Dalillar tugaganda odatda qo'pollikka o'tishadi. Asosli biror narsa ayta olasizmi?",
        meaning: "Dalillar tugaganda odatda qo'pollikka o'tishadi. Asosli biror narsa ayta olasizmi?",
        note: "Baxsda mot qilish"
      },
      {
        text: "So'zlaringiz faqat o'zingizning tarbiyangiz darajasini ko'rsatyapti, ortiq emas.",
        meaning: "So'zlaringiz faqat o'zingizning tarbiyangiz darajasini ko'rsatyapti, ortiq emas.",
        note: "Sovuqqon raddiya"
      },
      {
        text: "Qo'pollik va kibr sizni aqlliroq qilib qo'ymaydi. Fikrlar bilan gaplashishni o'rganing.",
        meaning: "Qo'pollik va kibr sizni aqlliroq qilib qo'ymaydi. Fikrlar bilan gaplashishni o'rganing.",
        note: "O'tkir javob"
      }
    ],
    jokes: [
      {
        text: "Tegib ketishga shunchalik urinyapsizki, hatto rahmim kelyapti) Sal bosiqroq bo'ling.",
        meaning: "Tegib ketishga shunchalik urinyapsizki, hatto rahmim kelyapti) Sal bosiqroq bo'ling.",
        note: "Qora yumor"
      }
    ]
  },

  // 8. Kompliment (KOMPLIMENTDA SAVOL BERILADI!)
  {
    matcher: (t) => /chiroylisiz|chiroylisan|ajoyib korinasiz|chiroyli|gozalsiz|zo'r ko'rinasiz|kelishgan/i.test(t),
    meaning: "Maqtov / Kompliment",
    responses: [
      {
        text: "Katta rahmat, juda yoqimli! O'zingiz doim shunday e'tiborlimisiz?",
        meaning: "Katta rahmat, juda yoqimli! O'zingiz doim shunday e'tiborlimisiz?",
        note: "Komplimentga savol"
      },
      {
        text: "Rahmat! O'zingiz ham juda ajoyib ko'rinyapsiz.",
        meaning: "Rahmat! O'zingiz ham juda ajoyib ko'rinyapsiz.",
        note: "Qaytarma maqtov"
      }
    ],
    jokes: [
      {
        text: "Rahmat, oyna oldida rosa harakat qildim) Tez-tez maqtov aytib turasizmi?",
        meaning: "Rahmat, oyna oldida rosa harakat qildim) Tez-tez maqtov aytib turasizmi?",
        note: "Hazil"
      }
    ]
  },

  // 9. Jimlik (SAVOL TAKLIF QILINADI!)
  {
    matcher: (t) => /^(?:ha|mayli|xop|xo'p|hop|yaxshi|tushunarli)[\s.!?,]*$/i.test(t.trim()) || /nega jimsiz|nega jimsan|shu yerdamisiz|qayerdasiz/i.test(t),
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
      },
      {
        text: "Qanday musiqa yoki filmlarni yoqtirasiz?",
        meaning: "Qanday musiqa yoki filmlarni yoqtirasiz?",
        note: "Qiziqish savoli"
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
    if (/what is your name|what's your name|who are you/i.test(lower)) return "Ismingiz nima? / Tanishaylikmi?";
    if (/what's new|what is new/i.test(lower)) return "Nima yangiliklar bor?";
    if (/single|married|boyfriend|girlfriend/i.test(lower)) return "Uylanganmisiz? / Sevgilingiz bormi?";
    if (/coffee|hang out|meet up|walk/i.test(lower)) return "Kofe ichamizmi? / Aylanamizmi?";
    if (/beautiful|handsome|cute|pretty|look great/i.test(lower)) return "Juda chiroylisiz / Ajoyib ko'rinyapsiz (Kompliment)";
    if (/idiot|stupid|shut up|get lost|loser/i.test(lower)) return "Sizga nisbatan qo'pollik / baxs qilinmoqda";
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
    if (/ne iş yapıyorsun|ne yapıyorsun/i.test(lower)) return "Kasbingiz nima? / Nima ish qilasiz?";
    if (/kahve/i.test(lower)) return "Kofe ichamizmi?";
    if (/güzel|harika/i.test(lower)) return "Juda chiroylisiz (Kompliment)";
    if (/aptal|salak|kes sesini/i.test(lower)) return "Sizga nisbatan qo'pollik qilinmoqda";
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
