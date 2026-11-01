/**
 * SuhbatDosh - 100% Aniq, Tabiiy va To'g'ri Ong (Direct Natural Brain)
 * 
 * Qoidalar:
 * 1. Savollarga FAQAT ANIQ JAVOB beriladi (ortiqcha yopishtirilgan savollarsiz).
 * 2. FAQAT kompliment / flirt vaziyatidagina savol beriladi.
 * 3. Tinch bo'lib qolganda (jimlik, qisqa "ha", "ok", "nega jimsan") suhbatni jonlantiruvchi SAVOL TAKLIF QILINADI.
 * 4. Bahsda, haqoratlarda va to'qnashuvlarda — 100% YUTIB CHIQADIGAN O'TKIR RADDIYALAR!
 * 5. Ortiqcha shablon yoki "(ответ)" kabi xatolar butunlay olib tashlangan!
 */

import { detectLanguage } from './languageDetector.js';
import { toPhonetic } from './conversationEngine.js';

export function analyzeGenderFromSpeech(text) {
  if (!text) return { speakerGender: 'unknown', inferredUserGender: 'male' };
  const lower = text.toLowerCase();

  let speakerGender = 'unknown';
  let inferredUserGender = 'male';

  if (/\b(я пошла|я устала|я подумала|я решила|я видела|я слышала|я хотела|я сделала|девушка|милая)\b/i.test(lower)) {
    speakerGender = 'female';
  } else if (/\b(я пошел|я устал|я подумал|я решил|я видел|я слышал|я хотел|я сделал|парень|мужчина|бро)\b/i.test(lower)) {
    speakerGender = 'male';
  }

  return { speakerGender, inferredUserGender };
}

// Ruscha so'zlarni tezkor o'zbekchaga o'girish lug'ati
const RU_TO_UZ_DICTIONARY = {
  // Savol olmoshlari
  "кто": "kim", "что": "nima", "где": "qayerda", "куда": "qayerga", "откуда": "qayerdan",
  "когда": "qachon", "почему": "nega", "зачем": "nima uchun", "как": "qanday",
  "сколько": "qancha", "какой": "qanday", "какая": "qanday", "какое": "qanday", "какие": "qanday",
  // Kishilik olmoshlari
  "ты": "sen", "вы": "siz", "я": "men", "мы": "biz", "он": "u", "она": "u", "они": "ular",
  "тебя": "seni", "вас": "sizni", "меня": "meni", "нас": "bizni",
  "тебе": "senga", "вам": "sizga", "мне": "menga", "нам": "bizga",
  "твой": "sening", "твоя": "sening", "твое": "sening", "ваш": "sizning", "ваша": "sizning", "мое": "mening", "мой": "mening", "моя": "mening",
  // Fe'llar
  "делаешь": "qilyapsan", "делаете": "qilyapsiz", "делает": "qilyapti",
  "работаешь": "ishlaysan", "работаете": "ishlaysiz", "работает": "ishlaydi",
  "живешь": "yashaysan", "живете": "yashaysiz",
  "думаешь": "o'ylaysan", "думаете": "o'ylaysiz",
  "знаешь": "bilasan", "знаете": "bilasiz",
  "хочешь": "xohlaysan", "хотите": "xohlaysiz",
  "любишь": "yoqtirasan", "любите": "yoqtirasiz",
  "гуляешь": "aylanyapsan", "гулять": "aylanish", "пойдешь": "borasanmi",
  "спишь": "uxlayapsanmi", "поел": "ovqatlandingmi", "кушал": "ovqatlanganmisan",
  "молчишь": "jimsan", "отвечаешь": "javob beryapsan",
  // Otlar
  "город": "shahar", "города": "shahar", "городе": "shaharda",
  "работа": "ish", "работе": "ishda", "работу": "ishni",
  "дом": "uy", "дома": "uyda", "домой": "uyga",
  "время": "vaqt", "времени": "vaqt",
  "день": "kun", "вечер": "oqshom", "вечером": "kechqurun", "утро": "tong", "утром": "ertalab",
  "ночь": "tun", "ночью": "kechasi",
  "погода": "ob-havo", "погоде": "ob-havo",
  "настроение": "kayfiyat", "настроении": "kayfiyat",
  "музыка": "musiqa", "фильм": "film", "кино": "kino", "книга": "kitob",
  "кофе": "qahva", "чай": "choy",
  "девушка": "qiz", "парень": "yigit", "друг": "do'st", "подруга": "dugona",
  "приложение": "ilova", "телефон": "telefon", "номер": "raqam",
  // Sifatlar va holatlar
  "хорошо": "yaxshi", "отлично": "a'lo", "плохо": "yomon", "нормально": "yaxshi",
  "красивая": "chiroyli", "красивый": "kelishgan", "умный": "aqlli",
  "холодно": "sovuq", "жарко": "issiq", "свободен": "bo'sh", "свободна": "bo'sh",
  "сегодня": "bugun", "завтра": "ertaga", "сейчас": "hozir", "всегда": "doim",
  "очень": "juda", "тоже": "ham", "здесь": "bu yerda", "тут": "bu yerda", "там": "u yerda",
  "да": "ha", "нет": "yo'q", "не": "emas"
};

// SUHBATDOSH SAVOLI VA GAPINI O'ZBEKCHAGA 100% ANIQ TARJIMA QILISH
export function translateRussianToUzbek(text) {
  if (!text) return '';
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Ilova / Dastur / Test qilish
  if (/что за приложени|какое приложени|про что приложени/i.test(lower)) {
    return "Qanday ilova bu? / Nima vazifa bajaradi?";
  }
  if (/не против|давай.*?провер|давай.*?тест/i.test(lower)) {
    return "Roziman, qani tekshirib ko'raylik!";
  }
  if (/тестиру|приложен|проверк.*?работ|тест.*?диалог|продолжить диалог|проверить работу/i.test(lower)) {
    return "Salom! Men yangi ilovamni test qilyapman. Uning ishlashini tekshirish uchun suhbatlashishga qarshi emasmisan?";
  }

  // 2. Shahar va Manzil
  if (/город|города|городе|городской/i.test(lower) && /како|где|откуда|из|твой|ваш/i.test(lower)) {
    return "Qaysi shahardansiz? / Qaysi shaharda yashaysiz?";
  }
  if (/откуда ты|откуда вы|откуда родом|где родился|где родилась|ты откуда/i.test(lower)) {
    return "Qayerdansiz? / Asli qayerliksiz?";
  }
  if (/где.*?(?:живешь|вы живете|ты|находишься)|ты где/i.test(lower)) {
    return "Qayerda yashaysiz? / Qayerdasiz?";
  }

  // 3. Mashg'ulot va Kasb
  if (/чем.*?(?:ты|вы|сейчас|вообще)?.*?(?:занимаешься|занят|занята)/i.test(lower)) {
    return "Nima ish bilan shug'ullanasiz? / Nima qilyapsiz?";
  }
  if (/что.*?(?:ты|вы|сейчас)?.*?(?:делаешь|поделываешь)|че делаешь/i.test(lower)) {
    return "Nima qilyapsiz? / Nima bilan bandsiz?";
  }
  if (/кем.*?(?:работаешь|вы работаете|трудишься)|где.*?(?:работаешь|вы работаете|учишься)|какая.*?професси|чем по жизни|на кого учишься/i.test(lower)) {
    return "Kasbingiz nima? / Nima ish qilasiz?";
  }

  // 4. Kim / Ism / Tanishuv
  if (/(?:ты кто|кто ты|вы кто|кто вы|кто это|кто ты такой|кто ты такая)/i.test(lower)) {
    return "Kimsiz? / Ismingiz nima?";
  }
  if (/как.*?(?:тебя|вас)?.*?зовут|твое.*?имя|ваше.*?имя|познакомимся|познакомиться|давай познакомимся/i.test(lower)) {
    return "Ismingiz nima? / Tanishaylikmi?";
  }

  // 5. Nima yangiliklar?
  if (/что нового|что новенького|как оно|как жизнь молодая|какие новости|что интересного/i.test(lower)) {
    return "Nima yangiliklar bor? / Yangiliklar bormi?";
  }

  // 6. Aylanish / Uchrashuv / Kofe
  if (/пойдешь.*?(?:гулять|прогуляться)|погуляем|гулять|сходим куда|прогулка|выйдешь|пройдемся/i.test(lower)) {
    return "Aylangani boramizmi? / Aylanamizmi?";
  }
  if (/куда.*?(?:пойдем|сходим)|кофе|попьем кофе|посидим|встретимся|перекусим|чай/i.test(lower)) {
    return "Qayerga boramiz? / Kofe ichamizmi? / Uchrashamizmi?";
  }

  // 7. Oilaviy holat / Munsobat
  if (/ты женат|женат/i.test(lower)) {
    return "Uylanganmisiz? / Oilalimisiz?";
  }
  if (/ты замужем|замужем/i.test(lower)) {
    return "Turmushga chiqqanmisiz?";
  }
  if (/есть.*?девушка|девушка есть/i.test(lower)) {
    return "Qizingiz / sevganingiz bormi?";
  }
  if (/есть.*?парень|парень есть/i.test(lower)) {
    return "Yigitingiz bormi?";
  }
  if (/в отношениях|сердце свободно|есть пара/i.test(lower)) {
    return "Munosabatdamisiz? / Ko'nglingiz bo'shmi?";
  }

  // 8. Salomlashish
  if (/привет|здравствуй|здравствуйте|добрый день|добрый вечер|доброе утро|салют|хай|салам|здорово/i.test(lower)) {
    return "Salom! / Assalomu alaykum!";
  }

  // 9. Hol-ahvol
  if (/как.*?(?:дела|жизнь|поживаешь|поживаете|ты|вы|сам|сама|успехи)|че как/i.test(lower)) {
    return "Ishlaringiz qalay? / Ahvolingiz qanday?";
  }
  if (/как настроение|настрой/i.test(lower)) {
    return "Kayfiyatingiz qalay?";
  }

  // 10. Yosh
  if (/сколько.*?(?:тебе|вам)?.*?лет|какой.*?возраст|сколько исполнилось/i.test(lower)) {
    return "Yoshingiz nechida?";
  }

  // 11. Ob-havo
  if (/погода|погодка|холодно на улице|жарко на улице|дождь идет/i.test(lower)) {
    return "Ob-havo qanday? / Ko'chada havo qanday?";
  }

  // 12. Uyqu / Tong
  if (/как спалось|выспался|выспалась|как сон/i.test(lower)) {
    return "Qanday uxlab turdingiz? / Yaxshi dam oldingizmi?";
  }

  // 13. Ovqat
  if (/ты кушал|ты поела|голоден|голодна|хочешь есть|что ел/i.test(lower)) {
    return "Ovqatlandingizmi? / Qorningiz ochmi?";
  }

  // 14. Nega yozyapsan
  if (/зачем.*?(?:пишешь|звонишь)|почему.*?(?:написал|написала)|что хотел|что хотела|чего звонишь/i.test(lower)) {
    return "Nega yozdingiz / qo'ng'iroq qildingiz?";
  }

  // 15. Tuyg'ular / Fikr
  if (/я тебе нравлюсь|что.*?обо мне думаешь|как я тебе|нравлюсь ли я/i.test(lower)) {
    return "Sizga yoqamanmi? / Men haqimda nima deb o'ylaysiz?";
  }

  // 16. Vaqt
  if (/сколько времени|который час|который сейчас час/i.test(lower)) {
    return "Soat necha bo'ldi?";
  }

  // 17. Rejalar
  if (/какие планы|свободен|свободна|планы на вечер|планы на выходные|есть время/i.test(lower)) {
    return "Qanday rejalaringiz bor? / Bo'shmisiz?";
  }

  // 18. Qayerdasan
  if (/далеко еще|скоро будешь|ты уже тут|где именно/i.test(lower)) {
    return "Yetib keldingizmi? / Qayerdasiz?";
  }

  // 19. Jimlik / Tinchlik
  if (/почему.*?(?:молчишь|не отвечаешь)|куда.*?(?:пропал|пропала)|ты тут|что молчишь/i.test(lower)) {
    return "Nega jim bo'lib qoldingiz? / Shu yerdamisiz?";
  }

  // 20. Haqorat, Baxs, Hujum yoki Kesatish
  if (/дурак|идиот|придурок|тупой|тупая|заткнись|пошел ты|пошла ты|отвали|хватит нести|че ты несешь|бред|чушь|кто ты такой|ты бесишь|надоел|отвяжись|клоун|урод|козел|овца|рот закрой|завали|соси|лох|нафиг|нах|мразь|сука|дебил/i.test(lower)) {
    return "Sizga nisbatan qo'pollik / bahsli hujum qilinmoqda";
  }

  // 21. Rahmat va Xayr
  if (/спасибо|благодарю|спс|от души|большое спасибо/i.test(lower)) {
    return "Rahmat! / Tashakkur!";
  }
  if (/пока|до встречи|до свидания|бывай|увидимся|спокойной ночи|доброй ночи/i.test(lower)) {
    return "Xayr! / Ko'rishguncha!";
  }

  // 22. Maqtov
  if (/красивая|красивый|милая|милый|хорошо выглядишь|стильно|классная|классный|красотка|красавчик/i.test(lower)) {
    return "Juda chiroylisiz / Ajoyib ko'rinyapsiz (Kompliment)";
  }

  // 23. Qisqa bir so'zli javoblar
  if (/^да$|^ага$/i.test(lower)) return "Ha";
  if (/^нет$|^неа$/i.test(lower)) return "Yo'q";
  if (/^понятно$|^ясно$/i.test(lower)) return "Tushunarli";
  if (/^хорошо$|^ладно$|^ок$/i.test(lower)) return "Yaxshi / Mayli";
  if (/^договорились$/i.test(lower)) return "Kelishdik";

  // Agar maxsus pattern topilmasa: So'zma-so'z o'girib tabiiy ma'no yasash
  const words = lower.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
  const translatedWords = words.map(w => RU_TO_UZ_DICTIONARY[w] || w);
  const translatedStr = translatedWords.join(' ');

  if (translatedStr && translatedStr !== words.join(' ')) {
    return clean.includes('?') ? `${translatedStr}?` : translatedStr;
  }

  if (clean.includes('?')) {
    return "Suhbatdosh savoli";
  }
  return "Suhbatdosh gapi";
}

// SUHBAT JAVOBLARI MATRITSI (FAQAT ANIQ JAVOB, KOMPLIMENTDA SAVOL, TINCHLIKDA TAKLIF SAVOLI)
const CONTINUITY_DIALOGUE_MAP = [
  // 1. BOSHLANG'ICH GAPGA ROZILIK (Давай, не против! / Что нужно делать?)
  {
    matcher: (t) => /не против|что.*?делать|что.*?надо|слушаю|давай.*?попробу|давай.*?провер/i.test(t),
    meaning: "Roziman, qani boshlaylik! Nima qilish kerak?",
    responses: [
      {
        text: "Супер, спасибо! Просто общайся со мной как обычно.",
        meaning: "Super, rahmat! Shunchaki men bilan odatdagidek suhbatlash.",
        note: "Tushuntirish"
      },
      {
        text: "Да ничего сложного, просто пообщаемся пару минут.",
        meaning: "Hech qanday qiyin joyi yo'q, shunchaki ikki daqiqa suhbatlashamiz.",
        note: "Oddiy javob"
      },
      {
        text: "Отлично! Расскажи пару слов о себе.",
        meaning: "Ajoyib! O'zing haqingda qisqacha aytib ber.",
        note: "Tanishuv"
      }
    ],
    jokes: [
      {
        text: "Главное — не задавать вопросы по высшей математике)",
        meaning: "Asosiysi oliy matematikadan savol bermasang bo'ldi)",
        note: "Hazil"
      }
    ]
  },

  // 2. SHAHAR VA MANZIL (Ты из какого города? / Где живешь?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /город|города|городе|городской/i.test(t) && /како|где|откуда|из|твой|ваш/i.test(t),
    meaning: "Qaysi shahardansan? / Qaysi shaharda yashaysan?",
    responses: [
      {
        text: "Я из (город).",
        meaning: "Men (shahar)danman.",
        note: "Aniq javob"
      },
      {
        text: "Живу в (город).",
        meaning: "(Shahar)da yashayman.",
        note: "Qisqa javob"
      },
      {
        text: "Я из (страна), сейчас живу в (город).",
        meaning: "Men (davlat)danman, hozir (shahar)da yashayman.",
        note: "Batafsil javob"
      }
    ],
    jokes: [
      {
        text: "Я из (город), где без навигатора не обойтись)",
        meaning: "(Shahar)danman, navigatorsiz adashib qolasan)",
        note: "Shahar hazili"
      }
    ]
  },

  // 3. QAYERDAN (Откуда ты? / Откуда вы?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /откуда|где родился|где родилась|где вырос|ты откуда/i.test(t),
    meaning: "Qayerdansan? / Asli qayerliksan?",
    responses: [
      {
        text: "Я из (страна), живу в (город).",
        meaning: "Men (davlat)danman, (shahar)da yashayman.",
        note: "Aniq javob"
      },
      {
        text: "Сам из (город).",
        meaning: "O'zim (shahar)danman.",
        note: "Londa javob"
      }
    ],
    jokes: [
      {
        text: "Я оттуда, где круглый год солнце и вкусная еда)",
        meaning: "Men yil bo'yi quyosh porlaydigan va mazali taomlar joyidanman)",
        note: "Hazil"
      }
    ]
  },

  // 4. KASB VA ISH (Кем работаешь? / Чем занимаешься?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /кем.*?(?:работаешь|вы работаете|трудишься)|где.*?(?:работаешь|вы работаете|учишься)|какая.*?професси|чем по жизни|на кого учишься|чем.*?(?:ты|вы|сейчас|вообще)?.*?(?:занимаешься|занят|занята)/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Kasbing nima?",
    responses: [
      {
        text: "Работаю в сфере (сфера).",
        meaning: "(Soha) sohasida ishlayman.",
        note: "Aniq javob"
      },
      {
        text: "Да так, отдыхаю и общаюсь.",
        meaning: "Shunchaki dam olyapman va muloqot qilyapman.",
        note: "Hozirgi holat"
      },
      {
        text: "Занимаюсь проектами в (сфера).",
        meaning: "(Soha)da loyihalar qilyapman.",
        note: "Kasbiy loyiha"
      }
    ],
    jokes: [
      {
        text: "Превращаю кофе в полезные дела)",
        meaning: "Kofeni foydali ishlarga aylantirmoqdaman)",
        note: "Ish hazili"
      }
    ]
  },

  // 5. KIM / ISM / TANISHUV (Ты кто? / Кто ты? / Как тебя зовут?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /(?:ты кто|кто ты|вы кто|кто вы|кто это|кто ты такой|кто ты такая)/i.test(t) || /как.*?(?:тебя|вас)?.*?зовут|твое.*?имя|ваше.*?имя|познакомимся|познакомиться|давай познакомимся/i.test(t),
    meaning: "Kimsan? / Isming nima? / Tanishaylikmi?",
    responses: [
      {
        text: "Я (имя). Очень приятно познакомиться!",
        meaning: "Men (ism)man. Tanishganimdan juda xursandman!",
        note: "Tanishuv"
      },
      {
        text: "Меня зовут (имя).",
        meaning: "Mening ismim (ism).",
        note: "Qisqa"
      },
      {
        text: "Твой приятный собеседник на этот вечер)",
        meaning: "Bu oqshomgi xushchaqchaq suhbatdoshing)",
        note: "Jozibador"
      }
    ],
    jokes: [
      {
        text: "Я (имя). Главное — имя не забыть через пять минут)",
        meaning: "Men (ism)man. Asosiysi 5 minutdan keyin esdan chiqarmaslik)",
        note: "Ism hazili"
      }
    ]
  },

  // 6. NIMA YANGILIKLAR? (Что нового? / Что новенького?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /что нового|что новенького|как оно|как жизнь молодая|какие новости|что интересного/i.test(t),
    meaning: "Nima yangiliklar bor? / Yangiliklar bormi?",
    responses: [
      {
        text: "Всё отлично, иду вперед и развиваюсь.",
        meaning: "Hammasi a'lo, rivojlanib oldinga boryapman.",
        note: "Ijobiy javob"
      },
      {
        text: "Да потихоньку, работа и дела. Всё стабильно.",
        meaning: "Sekin-asta, ish va yumushlar. Hammasi bir tekis.",
        note: "Oddiy javob"
      },
      {
        text: "Каждый день приносит что-то новое и интересное.",
        meaning: "Har bir kun yangi va qiziqarli narsalar keltiryapti.",
        note: "Falsafiy"
      }
    ],
    jokes: [
      {
        text: "Столько нового, что даже не знаю, с чего начать)",
        meaning: "Shunchalik ko'p yangilik borki, nimadan boshlashni ham bilmayman)",
        note: "Hazil"
      }
    ]
  },

  // 7. AYLANI SH / UCHRASHUV / KOFE (Пойдешь гулять? / Погуляем?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /пойдешь.*?(?:гулять|прогуляться)|погуляем|гулять|сходим куда|прогулка|выйдешь|пройдемся|встретимся|куда.*?(?:пойдем|сходим)|кофе|попьем кофе|посидим|перекусим|чай/i.test(t),
    meaning: "Aylangani boramizmi? / Aylanamizmi? / Kofe ichamizmi?",
    responses: [
      {
        text: "Давай, я только за! Во сколько?",
        meaning: "Ketdik, men faqat roziman! Soat nechada?",
        note: "Aniq rozilik"
      },
      {
        text: "С удовольствием прогуляюсь.",
        meaning: "Jon deb aylanardim.",
        note: "Rozilik"
      },
      {
        text: "Давай зайдем в кофейню рядом.",
        meaning: "Yondagi qahvaxonaga kiraylik.",
        note: "Kofe taklifi"
      }
    ],
    jokes: [
      {
        text: "Если там будет вкусно и тепло — я уже бегу)",
        meaning: "Agar u yerda mazali va iliq bo'lsa — hoziroq yugurdim)",
        note: "Hazil"
      }
    ]
  },

  // 8. OILAVIY HOLAT / MUNOSABAT (Ты женат? / Замужем? / Есть девушка / парень?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /ты женат|ты замужем|женат|замужем|есть.*?девушка|девушка есть|есть.*?парень|парень есть|в отношениях|сердце свободно|есть пара|свободен ли|свободна ли/i.test(t),
    meaning: "Uylanganmisan? / Yigiting yoki qizing bormi?",
    responses: [
      {
        text: "Нет, моё сердце свободно.",
        meaning: "Yo'q, yuragim butunlay bo'sh.",
        note: "Aniq javob"
      },
      {
        text: "Свободен, в активном поиске.",
        meaning: "Bo'shman, izlanishdaman.",
        note: "Faol izlanish"
      },
      {
        text: "Один, пока не встретил ту самую.",
        meaning: "Yolg'izman, hali o'sha insonimni uchratmadim.",
        note: "Samimiy"
      }
    ],
    jokes: [
      {
        text: "В серьезных отношениях со своей свободой и кофе)",
        meaning: "O'z erkinligim va kofe bilan jiddiy munosabatdaman)",
        note: "Hazil"
      }
    ]
  },

  // 9. SALOM / SALOMLASHISH (Привет / Здравствуйте) -> FAQAT JAVOB!
  {
    matcher: (t) => /^(привет|здравствуй|здравствуйте|добрый день|добрый вечер|доброе утро|салам|хай|салют|здорово)[\s.!?,]*$/i.test(t) || /привет|здравствуй|добрый день|салют/i.test(t),
    meaning: "Salom! / Assalomu alaykum!",
    responses: [
      {
        text: "Привет!",
        meaning: "Salom!",
        note: "Oddiy salom"
      },
      {
        text: "Салют, рад слышать!",
        meaning: "Salom, eshitganimdan xursandman!",
        note: "Jonli so'zlashuv"
      },
      {
        text: "Привет-привет!",
        meaning: "Salom-salom!",
        note: "Do'stona"
      }
    ],
    jokes: [
      {
        text: "Привет! Только о тебе подумал)",
        meaning: "Salom! Hozirgina seni o'ylagandim)",
        note: "Iliq hazil"
      }
    ]
  },

  // 10. HOL-AHVOL (Как дела? / Как жизнь?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /как.*?(?:дела|жизнь|поживаешь|поживаете|ты|вы|сам|сама|успехи|оно|настроение)|че как/i.test(t),
    meaning: "Ishlaring qalay? / Ahvoling qanday?",
    responses: [
      {
        text: "Всё отлично, спасибо!",
        meaning: "Hammasi a'lo, rahmat!",
        note: "A'lo javob"
      },
      {
        text: "Да потихоньку, всё в порядке.",
        meaning: "Sekin-asta, hammasi joyida.",
        note: "Oddiy javob"
      },
      {
        text: "Идёт, на позитиве!",
        meaning: "Bo'ladi, yaxshi kayfiyatda!",
        note: "Jonli jargon"
      }
    ],
    jokes: [
      {
        text: "Всё настолько хорошо, что даже подозрительно)",
        meaning: "Hammasi shunchalik yaxshiki, hatto shubhali)",
        note: "Kayfiyat hazili"
      }
    ]
  },

  // 11. YOSH (Сколько тебе лет?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /сколько.*?(?:тебе|вам)?.*?лет|какой.*?возраст|сколько исполнилось/i.test(t),
    meaning: "Yoshing nechida?",
    responses: [
      {
        text: "Мне (возраст).",
        meaning: "Menga (yosh)da.",
        note: "Aniq javob"
      },
      {
        text: "Мне сейчас (возраст).",
        meaning: "Hozir yoshim (yosh)da.",
        note: "Yosh"
      }
    ],
    jokes: [
      {
        text: "Мне (возраст), но в душе вечные 18)",
        meaning: "Menga (yosh)da, ammo qalbimda hamon 18 yoshman)",
        note: "Yosh hazili"
      }
    ]
  },

  // 12. QAYERDASAN (Ты где?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /где ты|ты где|где находишься|далеко еще|скоро будешь|ты уже тут/i.test(t),
    meaning: "Qayerdasan? / Qayerga yetding?",
    responses: [
      {
        text: "На подходе, минут через пять буду.",
        meaning: "Kelib qoldim, 5 minutda yetib boraman.",
        note: "Aniq vaqt"
      },
      {
        text: "В дороге, скоро буду.",
        meaning: "Yo'ldaman, tezda boraman.",
        note: "Lokatsiya"
      }
    ],
    jokes: [
      {
        text: "Уже лечу на всех парах, не теряй)",
        meaning: "Shiddat bilan uchyapman, yo'qotib qo'yma)",
        note: "Hazil"
      }
    ]
  },

  // 13. REJALAR (Какие планы?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /свободен|свободна|есть время|планы на вечер|планы на выходные|какие планы/i.test(t),
    meaning: "Qanday rejalaring bor? / Bo'shmisan?",
    responses: [
      {
        text: "Пока планов нет, вполне свободен.",
        meaning: "Hozircha rejam yo'q, bemalol bo'shman.",
        note: "Aniq javob"
      },
      {
        text: "Вечер совершенно свободный.",
        meaning: "Kechqurun butunlay bo'shman.",
        note: "Bo'sh vaqt"
      }
    ],
    jokes: [
      {
        text: "Мой план — спокойно отдохнуть)",
        meaning: "Mening rejam — tinchgina dam olish)",
        note: "Reja hazili"
      }
    ]
  },

  // 14. OB-HAVO (Какая погода?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /погода|погодка|холодно на улице|жарко на улице|дождь идет/i.test(t),
    meaning: "Ob-havo qanday? / Ko'chada havo qanday?",
    responses: [
      {
        text: "Погода отличная, самое то для прогулки.",
        meaning: "Ob-havo ajoyib, aynan aylanishga mos.",
        note: "Ob-havo"
      },
      {
        text: "На улице свежо, лучше одеться потеплее.",
        meaning: "Ko'chada salqin, iliqroq kiyingan ma'qul.",
        note: "Maslahat"
      }
    ],
    jokes: [
      {
        text: "Погода шепчет: возьми кофе и никуда не спеши)",
        meaning: "Ob-havo aytmoqda: kofe ol va shoshilma)",
        note: "Hazil"
      }
    ]
  },

  // 15. UYQU / TONG (Как спалось?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /как спалось|выспался|выспалась|как сон/i.test(t),
    meaning: "Qanday uxlab turdingiz? / Yaxshi dam oldingizmi?",
    responses: [
      {
        text: "Отлично выспался, полон энергии!",
        meaning: "A'lo darajada uxladim, kuchga to'laman!",
        note: "Energiya"
      },
      {
        text: "Вполне неплохо, готов к новому дню.",
        meaning: "Yomon emas, yangi kunga tayyorman.",
        note: "Tayyorgarlik"
      }
    ],
    jokes: [
      {
        text: "Спал бы еще часов десять, но дела зовут)",
        meaning: "Yana o'n soat uxlardim-u, ammo ishlar chaqiryapti)",
        note: "Hazil"
      }
    ]
  },

  // 16. OVQAT (Ты кушал? / Голоден?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /ты кушал|ты поела|голоден|голодна|хочешь есть|что ел|пообедал|поужинал/i.test(t),
    meaning: "Ovqatlandingizmi? / Qorningiz ochmi?",
    responses: [
      {
        text: "Да, недавно перекусил.",
        meaning: "Ha, yaqinda tamaddi qildim.",
        note: "Aniq javob"
      },
      {
        text: "Честно говоря, не отказался бы перекусить.",
        meaning: "Rostini aytsam, biror narsa yeb olgan bo'lardim.",
        note: "Ovqatlanish"
      }
    ],
    jokes: [
      {
        text: "Я всегда готов съесть что-нибудь вкусное)",
        meaning: "Mazali biror narsa yeyishga doim tayyorman)",
        note: "Hazil"
      }
    ]
  },

  // 17. NEGA YOZYAPSAN / QO'NG'IROQ (Зачем пишешь? / Что хотел?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /зачем.*?(?:пишешь|звонишь)|почему.*?(?:написал|написала)|что хотел|что хотела|чего звонишь/i.test(t),
    meaning: "Nega yozdingiz / qo'ng'iroq qildingiz?",
    responses: [
      {
        text: "Хотел пообщаться и узнать, как твои дела.",
        meaning: "Suhbatlashmoqchi edim va ishlaring qalayligini bilmoqchi edim.",
        note: "Samimiy maqsad"
      },
      {
        text: "Просто вспомнил о тебе и решил написать.",
        meaning: "Shunchaki seni esladim va yozgim keldi.",
        note: "Iliq munosabat"
      }
    ],
    jokes: [
      {
        text: "Решил проверить, не скучаешь ли ты без меня)",
        meaning: "Mensiz zerikib qolmayapsanmikan deb tekshirib ko'rdim)",
        note: "Hazil"
      }
    ]
  },

  // 18. TUYG'ULAR (Я тебе нравлюсь?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /я тебе нравлюсь|что.*?обо мне думаешь|как я тебе|нравлюсь ли я/i.test(t),
    meaning: "Sizga yoqamanmi? / Men haqimda nima deb o'ylaysiz?",
    responses: [
      {
        text: "Очень нравишься, ты невероятно интересный человек.",
        meaning: "Juda yoqasan, sen nihoyatda qiziqarli insonsan.",
        note: "Yoqish"
      },
      {
        text: "С тобой очень легко и приятно общаться.",
        meaning: "Sen bilan muloqot qilish juda oson va yoqimli.",
        note: "Ijobiy munosabat"
      }
    ],
    jokes: [
      {
        text: "С каждой минутой нашего общения всё больше)",
        meaning: "Muloqotimizning har daqiqasida yanada ko'proq)",
        note: "Flirt hazil"
      }
    ]
  },

  // 19. VAQT (Сколько времени?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /сколько времени|который час|который сейчас час/i.test(t),
    meaning: "Soat necha bo'ldi?",
    responses: [
      {
        text: "Сейчас самое время для отличного общения.",
        meaning: "Hozir ajoyib suhbat uchun ayni vaqti.",
        note: "Vaqt"
      },
      {
        text: "Точное время не важно, когда беседа интересная.",
        meaning: "Suhbat qiziq bo'lsa, aniq vaqt muhim emas.",
        note: "Falsafiy"
      }
    ],
    jokes: [
      {
        text: "Счастливые часов не наблюдают)",
        meaning: "Baxtlilar soatga qaramaydilar)",
        note: "Hazil"
      }
    ]
  },

  // 20. RAHMAT (Спасибо) -> FAQAT JAVOB!
  {
    matcher: (t) => /спасибо|благодарю|спс|от души|большое спасибо/i.test(t),
    meaning: "Rahmat! / Tashakkur!",
    responses: [
      {
        text: "Пожалуйста!",
        meaning: "Arzimaydi / Marhamat!",
        note: "Xushmuomala"
      },
      {
        text: "Да не за что, всегда рад помочь.",
        meaning: "Arzimaydi, doim yordam berishdan xursandman.",
        note: "Samimiy"
      }
    ],
    jokes: [
      {
        text: "С тебя улыбка — и мы в расчете)",
        meaning: "Sendan bitta tabassum — hisobimiz tenglashdi)",
        note: "Hazil"
      }
    ]
  },

  // 21. XAYRLASHUV (Пока / До встречи) -> FAQAT JAVOB!
  {
    matcher: (t) => /пока|до встречи|до свидания|бывай|увидимся|спокойной ночи|доброй ночи/i.test(t),
    meaning: "Xayr! / Ko'rishguncha!",
    responses: [
      {
        text: "До встречи!",
        meaning: "Ko'rishguncha!",
        note: "Ezgu tilak"
      },
      {
        text: "Давай, на связи!",
        meaning: "Bo'pti, aloqadamiz!",
        note: "Aloqa"
      }
    ],
    jokes: [
      {
        text: "Бывай, не пропадай надолго)",
        meaning: "Xayr, uzoqqa yo'qolib ketma)",
        note: "Hazil"
      }
    ]
  },

  // 22. BAXS, HAQORAT VA KESATISHGA O'TKIR RADDIYA (GAPDA HAR DOIM YUTIB CHIQISH!)
  {
    matcher: (t) => /дурак|идиот|придурок|тупой|тупая|заткнись|пошел ты|пошла ты|отвали|хватит нести|че ты несешь|бред|чушь|кто ты такой|ты бесишь|надоел|отвяжись|клоун|урод|козел|овца|рот закрой|завали|соси|лох|нафиг|нах|мразь|сука|дебил/i.test(t),
    meaning: "Qo'pollik / Bahsda mot qilish va yutib chiqish",
    responses: [
      {
        text: "Когда заканчиваются аргументы — переходят на грубость. Что-то умное по теме скажешь?",
        meaning: "Dalillar tugaganda odatda qo'pollikka o'tishadi. Mavzu bo'yicha aqli biror gap ayta olasanmi?",
        note: "Baxsda mot qilish"
      },
      {
        text: "Твои слова показывают только твой уровень воспитания и слабость, не более.",
        meaning: "So'zlaring faqat o'zingning tarbiyang darajasini va ojizligingni ko'rsatyapti, ortiq emas.",
        note: "Sovuqqon raddiya"
      },
      {
        text: "Сарказм и хамство не сделают тебя умнее. Попробуй общаться фактами.",
        meaning: "Sarkazm va qo'pollik seni aqlliroq qilib qo'ymaydi. Asoslar bilan gaplashishni o'rgan.",
        note: "O'tkir javob"
      }
    ],
    jokes: [
      {
        text: "Ты так стараешься меня задеть, что даже жалко становится) Давай поспокойнее.",
        meaning: "Menga tegib ketishga shunchalik tirishyapsanki, hatto rahmim kelyapti) Sal bosiqroq bo'l.",
        note: "Qora yumor"
      }
    ]
  },

  // 23. KOMPLIMENT VAZIYATI (Мақтов - KOMPLIMENTDA SAVOL BERILADI!)
  {
    matcher: (t) => /красив|милая|милый|хорошо выглядит|стильно|классная|классный|красотка|красавчик/i.test(t),
    meaning: "Juda chiroylisan / Ajoyib ko'rinyapsan (Kompliment)",
    responses: [
      {
        text: "Спасибо, очень приятно! Ты всегда такой внимательный?",
        meaning: "Rahmat, juda yoqimli! O'zing doim shunday e'tiborlimisan?",
        note: "Komplimentga savol"
      },
      {
        text: "Спасибо! Ты тоже потрясающе выглядишь.",
        meaning: "Rahmat! O'zing ham ajoyib ko'rinyapsan.",
        note: "Qaytarma maqtov"
      },
      {
        text: "Приятно слышать! Часто делаешь комплименты?",
        meaning: "Eshitish yoqimli! O'zing tez-tez maqtov aytib turasanmi?",
        note: "Flirt savol"
      }
    ],
    jokes: [
      {
        text: "Спасибо, старался перед зеркалом) А ты часто комплименты делаешь?",
        meaning: "Rahmat, oyna oldida rosa harakat qildim) Tez-tez maqtov aytib turasanmi?",
        note: "Maqtov hazili"
      }
    ]
  },

  // 24. TINCH BO'LIB QOLGANDA / JIMLIK / SUHBAT TO'XTAGANDA (SAVOL TAKLIF QILINADI!)
  {
    matcher: (t) => /^(?:да|ага|понятно|ясно|хорошо|ок|ладно|мда|угу)[\s.!?,]*$/i.test(t.trim()) || /почему.*?(?:молчишь|не отвечаешь)|куда.*?(?:пропал|пропала)|ты тут|что молчишь|тишина/i.test(t),
    meaning: "Suhbat to'xtab qoldi / Jimlik (Suhbatni jonlantirish)",
    responses: [
      {
        text: "Кстати, а какие у тебя планы на вечер?",
        meaning: "Aytgancha, kechga qanday rejalaring bor?",
        note: "Reja so'rash"
      },
      {
        text: "Не против перекусить или выпить кофе?",
        meaning: "Biror narsa yeb olamizmi yoki kofe ichamizmi?",
        note: "Kofe taklifi"
      },
      {
        text: "Кстати, а ты какую музыку или фильмы любишь?",
        meaning: "Aytgancha, qanday musiqa yoki filmlarni yoqtirasan?",
        note: "Qiziqish savoli"
      },
      {
        text: "О чем задумался? Что интересного расскажешь?",
        meaning: "Nimalarni o'ylab qolding? Nima qiziq gaplar bor?",
        note: "Jimlikni buzish"
      }
    ],
    jokes: [
      {
        text: "Не молчу, просто подбираю самые умные слова) Ты о чем подумал?",
        meaning: "Jim turganim yo'q, eng aqlli so'zlarni tanlayotgandim) O'zing nima deb o'ylading?",
        note: "Jimlik hazili"
      }
    ]
  }
];

/**
 * Universal suhbatni generatori
 */
export function generateAcquaintanceResponse(input, selectedIndex = 0, isJokeRequested = false) {
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
      totalVariants: 2
    };
  }

  const clean = input.trim();
  const lang = detectLanguage(clean);
  const { speakerGender, inferredUserGender } = analyzeGenderFromSpeech(clean);
  const partnerMeaning = translateRussianToUzbek(clean);

  // Semantik mavzuni topish (aniq matcherlar bo'yicha)
  let matched = CONTINUITY_DIALOGUE_MAP.find(item => item.matcher(clean));

  if (!matched) {
    if (clean.includes('?')) {
      // Har qanday noma'lum savolga mantiqiy, ishonchli va tabiiy javoblar (HECH QANDAY '(ответ)' YO'Q!)
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Думаю, да, вполне.", meaning: "Menimcha shunday, to'liq.", note: "Aniq javob" },
          { text: "Всё зависит от ситуации, но в целом да.", meaning: "Vaziyatga bog'liq, lekin umuman olganda ha.", note: "Mantiqiy javob" },
          { text: "Честно говоря, пока сложно сказать однозначно.", meaning: "Rostini aytsam, hozircha bir narsa deyish qiyin.", note: "Xulosa" }
        ],
        jokes: [
          { text: "Вопрос отличный, на такую тему можно долго рассуждать)", meaning: "Ajoyib savol, bu mavzuda uzoq bahslashsa bo'ladi)", note: "Hazil" }
        ]
      };
    } else {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Понял тебя, звучит разумно.", meaning: "Tushundim seni, mantiqli.", note: "Rozilik" },
          { text: "Полностью согласен с тобой.", meaning: "Senga to'liq qo'shilaman.", note: "Qo'shilish" }
        ],
        jokes: [
          { text: "Звучит солидно, даже спорить не буду)", meaning: "Salobatli eshitildi, bahslashmayman ham)", note: "Hazil" }
        ]
      };
    }
  }

  let candidateList = isJokeRequested && matched.jokes && matched.jokes.length > 0
    ? matched.jokes
    : matched.responses;

  // Jins grammatikasi (tabiiy so'zlar)
  let variants = candidateList.map(v => {
    let t = v.text;
    if (inferredUserGender === 'female') {
      t = t.replace(/\bпонял\b/g, 'поняла')
           .replace(/\bосвободился\b/g, 'освободилась')
           .replace(/\bсвободен\b/g, 'свободна')
           .replace(/\bрад\b/g, 'рада')
           .replace(/\bбыл\b/g, 'была')
           .replace(/\bсогласен\b/g, 'согласна')
           .replace(/\bстарался\b/g, 'старалась')
           .replace(/\bпришел\b/g, 'пришла')
           .replace(/\bотвлекся\b/g, 'отвлеклась')
           .replace(/\bхолост\b/g, 'не замужем')
           .replace(/\bодин\b/g, 'одна');
    } else {
      t = t.replace(/\bпоняла\b/g, 'понял')
           .replace(/\bосвободилась\b/g, 'освободился')
           .replace(/\bсвободна\b/g, 'свободен')
           .replace(/\bрада\b/g, 'рад')
           .replace(/\bбыла\b/g, 'был')
           .replace(/\bсогласна\b/g, 'согласен')
           .replace(/\bстаралась\b/g, 'старался')
           .replace(/\bпришла\b/g, 'пришел')
           .replace(/\bотвлеклась\b/g, 'отвлекся');
    }

    return { ...v, text: t };
  });

  const activeIndex = selectedIndex % variants.length;
  const selected = variants[activeIndex];
  const pronunciation = toPhonetic(selected.text);

  return {
    partnerText: clean,
    partnerMeaning: matched.meaning || partnerMeaning,
    detectedLanguage: lang,
    genderContext: { speakerGender, inferredUserGender },
    userResponse: selected.text,
    userMeaning: selected.meaning,
    userPronunciation: `[${pronunciation}]`,
    userNote: selected.note,
    isJoke: isJokeRequested,
    allVariants: variants,
    currentVariantIndex: activeIndex,
    totalVariants: variants.length
  };
}
