/**
 * SuhbatDosh - 100% Aniq, Tabiiy va To'g'ri Ong (Direct Natural Brain)
 * 
 * Qoidalar:
 * 1. Savollarga FAQAT ANIQ JAVOB beriladi (ortiqcha yopishtirilgan savollarsiz).
 * 2. FAQAT kompliment / flirt vaziyatidagina savol beriladi.
 * 3. Tinch bo'lib qolganda (jimlik, qisqa "ha", "ok", "nega jimsan") suhbatni jonlantiruvchi SAVOL TAKLIF QILINADI.
 * 4. Qolgan ortiqcha narsalar yo'q!
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

  // 3. Nima bilan bandsan / Mashg'ulot (Чем ты занимаешься?)
  if (/чем.*?(?:ты|вы|сейчас|вообще)?.*?(?:занимаешься|занят|занята)/i.test(lower)) {
    return "Nima ish bilan shug'ullanasiz? / Nima qilyapsiz?";
  }
  if (/что.*?(?:ты|вы|сейчас)?.*?(?:делаешь|поделываешь)|че делаешь/i.test(lower)) {
    return "Nima qilyapsiz? / Nima bilan bandsiz?";
  }

  // 4. Kasb va Ish
  if (/кем.*?(?:работаешь|вы работаете|трудишься)|где.*?(?:работаешь|вы работаете|учишься)|какая.*?професси|чем по жизни|на кого учишься/i.test(lower)) {
    return "Kasbingiz nima? / Nima ish qilasiz?";
  }

  // 5. Salomlashish
  if (/привет|здравствуй|здравствуйте|добрый день|добрый вечер|доброе утро|салют|хай|салам|здорово/i.test(lower)) {
    return "Salom! / Assalomu alaykum!";
  }

  // 6. Hol-ahvol
  if (/как.*?(?:дела|жизнь|поживаешь|поживаете|ты|вы|сам|sama|успехи|оно)|че как/i.test(lower)) {
    return "Ishlaringiz qalay? / Ahvolingiz qanday?";
  }
  if (/как настроение|настрой/i.test(lower)) {
    return "Kayfiyatingiz qalay?";
  }

  // 7. Ism va Tanishuv
  if (/как.*?(?:тебя|вас)?.*?зовут|твое.*?имя|ваше.*?имя|познакомимся|познакомиться|давай познакомимся/i.test(lower)) {
    return "Ismingiz nima? / Tanishaylikmi?";
  }

  // 8. Yosh
  if (/сколько.*?(?:тебе|вам)?.*?лет|какой.*?возраст|сколько исполнилось/i.test(lower)) {
    return "Yoshingiz nechida?";
  }

  // 9. Hobbi, Musiqa va Kino
  if (/музык|кино|фильм|книг|хобби|увлечени|спорт/i.test(lower)) {
    return "Musiqa, kino yoki qiziqishlaringiz haqida so'ramoqda";
  }

  // 10. Kofe va Uchrashuv
  if (/куда.*?(?:пойдем|сходим)|кофе|попьем кофе|посидим|погуляем|встретимся|перекусим|чай/i.test(lower)) {
    return "Qayerga boramiz? / Kofe ichamizmi? / Aylanamizmi?";
  }

  // 11. Rejalar
  if (/какие планы|свободен|свободна|планы на вечер|планы на выходные|есть время/i.test(lower)) {
    return "Qanday rejalaringiz bor? / Bo'shmisiz?";
  }

  // 12. Qayerdasan
  if (/далеко еще|скоро будешь|ты уже тут|где именно/i.test(lower)) {
    return "Yetib keldingizmi? / Qayerdasiz?";
  }

  // 13. Jimlik / Tinchlik
  if (/почему.*?(?:молчишь|не отвечаешь)|куда.*?(?:пропал|пропала)|ты тут|что молчишь/i.test(lower)) {
    return "Nega jim bo'lib qoldingiz? / Shu yerdamisiz?";
  }

  // 14. Haqorat, Baxs, Hujum yoki Kesatish
  if (/дурак|идиот|придурок|тупой|тупая|заткнись|пошел ты|отвали|хватит нести|че ты несешь|бред|чушь|кто ты такой|ты бесишь|надоел|отвяжись/i.test(lower)) {
    return "Sizga nisbatan qo'pollik / baxs / hujum qilinmoqda";
  }

  // 15. Rahmat va Xayr
  if (/спасибо|благодарю|спс|от души|большое спасибо/i.test(lower)) {
    return "Rahmat! / Tashakkur!";
  }
  if (/пока|до встречи|до свидания|бывай|увидимся|спокойной ночи/i.test(lower)) {
    return "Xayr! / Ko'rishguncha!";
  }

  // 15. Maqtov
  if (/красивая|красивый|милая|милый|хорошо выглядишь|стильно|классная|классный|красотка|красавчик/i.test(lower)) {
    return "Juda chiroylisiz / Ajoyib ko'rinyapsiz";
  }

  // 16. Qisqa bir so'zli javoblar (Tinch bo'lib qolish vaziyati)
  if (/^да$|^ага$/i.test(lower)) return "Ha";
  if (/^нет$|^неа$/i.test(lower)) return "Yo'q";
  if (/^понятно$|^ясно$/i.test(lower)) return "Tushunarli";
  if (/^хорошо$|^ладно$|^ок$/i.test(lower)) return "Yaxshi / Mayli";
  if (/^договорились$/i.test(lower)) return "Kelishdik";

  // Agar aniq tushmasa
  if (clean.includes('?')) {
    return `Suhbatdosh savoli: "${clean}"`;
  }
  return `Suhbatdosh gapi: "${clean}"`;
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

  // 2. QAYERDAN (Откуда ты? / Откуда вы?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /откуда|родился|родилась|где вырос/i.test(t),
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

  // 3. KASB VA ISH (Кем работаешь? / Чем занимаешься?) -> FAQAT ANIQ JAVOB!
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

  // 4. SALOM / SALOMLASHISH (Привет / Здравствуйте) -> FAQAT JAVOB!
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

  // 5. HOL-AHVOL (Как дела? / Как жизнь?) -> FAQAT ANIQ JAVOB!
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

  // 6. ISM / TANISHUV (Как тебя зовут?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /как.*?(?:тебя|вас)?.*?зовут|твое.*?имя|ваше.*?имя|познакомимся|познакомиться|давай познакомимся|кто ты/i.test(t),
    meaning: "Isming nima? / Tanishaylikmi?",
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

  // 7. YOSH (Сколько тебе лет?) -> FAQAT ANIQ JAVOB!
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

  // 8. QAYERGA BORAMIZ / KOFE (Куда пойдем? / Пойдем кофе?) -> FAQAT ANIQ JAVOB!
  {
    matcher: (t) => /куда.*?(?:пойдем|сходим)|кофе|попьем кофе|посидим|погуляем|встретимся|перекусим|чай/i.test(t),
    meaning: "Qayerga boramiz? / Kofe ichamizmi? / Aylanamizmi?",
    responses: [
      {
        text: "Го, я только за!",
        meaning: "Kettik, men faqat roziman!",
        note: "Rozilik"
      },
      {
        text: "Давай зайдем в кофейню рядом.",
        meaning: "Yondagi qahvaxonaga kiraylik.",
        note: "Aniq taklif"
      }
    ],
    jokes: [
      {
        text: "Главное, чтобы кофе был нормальный)",
        meaning: "Asosiysi kofesi yaxshi bo'lsin)",
        note: "Kofe hazili"
      }
    ]
  },

  // 9. QAYERDASAN (Ты где?) -> FAQAT ANIQ JAVOB!
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

  // 10. REJALAR (Какие планы?) -> FAQAT ANIQ JAVOB!
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

  // 11. RAHMAT (Спасибо) -> FAQAT JAVOB!
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

  // 12. XAYRLASHUV (Пока / До встречи) -> FAQAT JAVOB!
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

  // 14. BAXS, HAQORAT VA KESATISHGA O'TKIR RADDIYA (GAPDA HAR DOIM YUTIB CHIQISH!)
  {
    matcher: (t) => /дурак|идиот|придурок|тупой|тупая|заткнись|пошел ты|отвали|хватит нести|че ты несешь|бред|чушь|кто ты такой|ты бесишь|надоел|отвяжись/i.test(t),
    meaning: "Qo'pollik / Bahsda mot qilish va yutib chiqish",
    responses: [
      {
        text: "Когда заканчиваются аргументы — обычно переходят на грубость. Что-то по делу скажешь?",
        meaning: "Dalillar tugaganda odatda qo'pollikka o'tishadi. Asosli biror narsa ayta olasanmi?",
        note: "Baxsda mot qilish"
      },
      {
        text: "Твои слова говорят только о твоем уровне воспитания, не более того.",
        meaning: "So'zlaring faqat o'zingning tarbiyang darajasini ko'rsatyapti, ortiq emas.",
        note: "Sovuqqon raddiya"
      },
      {
        text: "Остроумие явно не твой конёк, но за попытку спасибо)",
        meaning: "O'tkir aql senga xos emasligi aniq, ammo urinish uchun rahmat)",
        note: "Qora yumor"
      }
    ],
    jokes: [
      {
        text: "Ты так стараешься задеть, что даже жалко становится) Давай поспокойнее.",
        meaning: "Tegib ketishga shunchalik tirishyapsanki, hatto rahmim kelyapti) Sal bosiqroq bo'l.",
        note: "Yengil zarba"
      }
    ]
  },

  // 15. KOMPLIMENT VAZIYATI (Мақтов - KOMPLIMENTDA SAVOL BERILADI!)
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

  // 14. TINCH BO'LIB QOLGANDA / JIMLIK / SUHBAT TO'XTAGANDA (SAVOL TAKLIF QILINADI!)
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
  },

  // 15. ILOVA TEST QILISH (Привет! Я тестирую своё новое приложение...)
  {
    matcher: (t) => /тестиру|приложен|проверк.*?работ|тест.*?диалог|продолжить диалог|проверить работу/i.test(t),
    meaning: "Salom! Yangi ilovani test qilish uchun suhbatlashishga rozilik so'ramoqda",
    responses: [
      {
        text: "Привет! Я совсем не против, давай протестируем.",
        meaning: "Salom! Men umuman qarshi emasman, qani test qilaylik.",
        note: "Aniq rozilik"
      },
      {
        text: "Без проблем, помогу! Какое приложение создаешь?",
        meaning: "Muammo yo'q, yordam beraman! Qanday ilova yaratyapsan?",
        note: "Yordam + savol"
      }
    ],
    jokes: [
      {
        text: "Только если твое приложение не захватит мир)",
        meaning: "Faqat ilovang dunyoni egallab olmasa bo'ldi)",
        note: "IT hazili"
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
    if (/город/i.test(clean)) {
      matched = {
        meaning: "Qaysi shahardansan? / Qaysi shaharda yashaysan?",
        responses: [
          { text: "Я из (город).", meaning: "Men (shahar)danman.", note: "Aniq javob" },
          { text: "Живу в (город).", meaning: "(Shahar)da yashayman.", note: "Londa javob" }
        ],
        jokes: [
          { text: "Я из (город), где всегда тепло)", meaning: "Men doim iliq bo'lgan (shahar)danman)", note: "Shahar hazili" }
        ]
      };
    } else if (clean.includes('?')) {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "В моем случае это (ответ).", meaning: "Mening holatimda bu (javob).", note: "Aniq javob" },
          { text: "Думаю, в целом это (ответ).", meaning: "Menimcha, umuman olganda bu (javob).", note: "Xulosa" }
        ],
        jokes: [
          { text: "Вопрос с подвохом) Мой ответ — (ответ)", meaning: "Hiylali savol ekan) Mening javobim — (javob)", note: "Hazil" }
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
           .replace(/\bотвлекся\b/g, 'отвлеклась');
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
