/**
 * SuhbatDosh - Suhbatni Jonlantiruvchi va Davom Ettiruvchi Aqlli Ong (Smart Continuity Brain)
 * 
 * Formula: [Savolga 100% aniq va tabiiy javob] + [Suhbatni qizdiruvchi mantiqiy ulovchi savol]
 * Har bir qismning tagida uning to'liq O'zbekcha tarjimasi aniq chiqib turadi!
 * Suhbat mavzusiga qarab o'zgaruvchi kreativ hazillar (Dynamic Contextual Jokes).
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
    return "Qanday ilova bu? / Nima haqida?";
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
  if (/как.*?(?:дела|жизнь|поживаешь|поживаете|ты|вы|сам|сама|успехи|оно)|че как/i.test(lower)) {
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

  // 13. Jimlik
  if (/почему.*?(?:молчишь|не отвечаешь)|куда.*?(?:пропал|пропала)/i.test(lower)) {
    return "Nega jim bo'lib qoldingiz? / Qayerga yo'qoldingiz?";
  }

  // 14. Rahmat va Xayr
  if (/спасибо|благодарю|спс|от души|большое спасибо/i.test(lower)) {
    return "Rahmat! / Tashakkur!";
  }
  if (/пока|до встречи|до свидания|бывай|увидимся|спокойной ночи/i.test(lower)) {
    return "Xayr! / Ko'rishguncha!";
  }

  // 15. Maqtov
  if (/красивая|красивый|милая|милый|хорошо выглядишь|стильно|классная|классный/i.test(lower)) {
    return "Juda chiroylisiz / Ajoyib ko'rinyapsiz";
  }

  // 16. Qisqa rozilik
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

// SUHBATNI DAVOM ETTIRUVCHI SEMANTIK JAVOBLAR XARITASI
const CONTINUITY_DIALOGUE_MAP = [
  // 1. ILOVA TEST QILISH (Привет! Я тестирую своё новое приложение...)
  {
    matcher: (t) => /тестиру|приложен|проверк.*?работ|тест.*?диалог|продолжить диалог|проверить работу/i.test(t),
    meaning: "Salom! Yangi ilovani test qilish uchun suhbatlashishga rozilik so'ramoqda",
    responses: [
      {
        text: "Привет! Я совсем не против, давай протестируем. С чего начнем?",
        meaning: "Salom! Men umuman qarshi emasman, qani test qilaylik. Nimadan boshlaymiz?",
        note: "Rozilik + ulovchi savol"
      },
      {
        text: "Без проблем, с удовольствием помогу! Какое приложение создаешь?",
        meaning: "Muammo yo'q, jon deb yordam beraman! Qanday ilova yaratyapsan?",
        note: "Yordam + qiziqish"
      },
      {
        text: "Звучит интересно, я готов! Задавай любые вопросы, что проверяем?",
        meaning: "Qiziq eshitildi, men tayyorman! Istalgan savolingni ber, nimani tekshiryapmiz?",
        note: "Tayyorlik + savol"
      }
    ],
    jokes: [
      {
        text: "Только если твое приложение не захватит мир) О чем поговорим для проверки?",
        meaning: "Faqat ilovang dunyoni egallab olmasa bo'ldi) Tekshirish uchun nima haqida gaplashamiz?",
        note: "IT hazili"
      },
      {
        text: "Главное, чтобы багов не было) С какого вопроса начнем тест?",
        meaning: "Asosiysi xatoliklar (baglar) bo'lmasin) Qaysi savoldan testni boshlaymiz?",
        note: "Dasturchi hazili"
      }
    ]
  },

  // 1.1 ILTIMOSGA ROZILIK (Давай / Не против / Без проблем)
  {
    matcher: (t) => /^(?:да,?\s*)?(?:давай|не против|без проблем|конечно|погнали|го|я за)[\s.!?,]*$/i.test(t.trim()) || /не против|давай.*?попробу|давай.*?провер/i.test(t),
    meaning: "Roziman, qani davom etaylik / Muammo yo'q!",
    responses: [
      {
        text: "Отлично, спасибо! Как тебя зовут и как твой день проходит?",
        meaning: "Ajoyib, rahmat! Isming nima va kuning qanday o'tyapti?",
        note: "Rahmat + tanishuv"
      },
      {
        text: "Супер! Расскажи, чем занимаешься или какие планы на сегодня?",
        meaning: "Super! Nima bilan bandsan yoki bugunga qanday rejalar bor?",
        note: "Mavzuni ochish"
      },
      {
        text: "Круто! Спроси у меня что-нибудь интересное, проверим приложение.",
        meaning: "Zo'r! Mendan biror qiziq narsa so'ra, ilovani tekshirib ko'ramiz.",
        note: "Savol so'rash"
      }
    ],
    jokes: [
      {
        text: "Только чур не задавать вопросы по высшей математике) Как твой настрой?",
        meaning: "Faqat oliy matematikadan savol bermaysan) Kayfiyating qalay?",
        note: "Do'stona hazil"
      }
    ]
  },

  // 1.2 ILOVA HAQIDA SO'ROV (Что за приложение? / Какое приложение?)
  {
    matcher: (t) => /что за приложени|какое приложени|про что приложени|зачем приложени/i.test(t),
    meaning: "Qanday ilova bu? / Nima vazifa bajaradi?",
    responses: [
      {
        text: "Это умный суфлер для живого общения. А ты какими приложениями чаще всего пользуешься?",
        meaning: "Bu jonli muloqot uchun aqlli yordamchi. O'zing qaysi ilovalardan ko'proq foydalanasan?",
        note: "Tushuntirish + savol"
      },
      {
        text: "Помогает легко общаться и знакомиться на любом языке. Ты иностранные языки учил?",
        meaning: "Har qanday tilda oson muloqot qilishga yordam beradi. O'zing chet tillarini o'rganganmisan?",
        note: "Til haqida savol"
      }
    ],
    jokes: [
      {
        text: "Пока секретная разработка) А ты любишь тестировать разные новинки?",
        meaning: "Hozircha maxfiy loyiha) O'zing turli yangiliklarni sinab ko'rishni yoqtirasanmi?",
        note: "Sirli hazil"
      }
    ]
  },

  // 2. NIMA BILAN BANDSAN / NIMA QILYAPSAN (Чем ты занимаешься? / Чем занят?)
  {
    matcher: (t) => /чем.*?(?:ты|вы|сейчас|вообще)?.*?(?:занимаешься|занят|занята)|что.*?(?:ты|вы|сейчас)?.*?(?:делаешь|поделываешь)|че делаешь/i.test(t),
    meaning: "Nima ish bilan shug'ullanasan? / Nima qilyapsan?",
    responses: [
      {
        text: "Работаю в сфере (сфера). А тебе твоя деятельность нравится?",
        meaning: "(Soha) sohasida ishlayman. O'zingga o'z ishing yoqadimi?",
        note: "Kasb + ulovchi savol"
      },
      {
        text: "Да так, отдыхаю и общаюсь. А ты как вечер планируешь провести?",
        meaning: "Shunchaki dam olyapman va muloqot qilyapman. O'zing kechni qanday o'tkazmoqchisan?",
        note: "Dam olish + rejalar"
      },
      {
        text: "Занимаюсь проектами в (сфера). А ты в какой сфере крутишься?",
        meaning: "(Soha)da loyihalar qilyapman. O'zing qaysi sohadisan?",
        note: "Soha haqida savol"
      }
    ],
    jokes: [
      {
        text: "Превращаю кофе в полезные дела) А ты чем обычно занимаешься?",
        meaning: "Kofeni foydali ishlarga aylantirmoqdaman) O'zing odatda nima bilan bandsan?",
        note: "Mashg'ulot hazili"
      },
      {
        text: "Пытаюсь победить лень, пока 1:0 в её пользу) А ты что интересного делаешь?",
        meaning: "Dangasalikni yengishga harakat qilyapman, hozircha u yutyapti) O'zing nima qiziq ish qilyapsan?",
        note: "Yengil hazil"
      }
    ]
  },

  // 3. SHAHAR VA MANZIL (Ты из какого города? / В каком городе?)
  {
    matcher: (t) => /город|города|городе|городской/i.test(t) && /како|где|откуда|из|твой|ваш/i.test(t),
    meaning: "Qaysi shahardansan? / Qaysi shaharda yashaysan?",
    responses: [
      {
        text: "Я из (город). А ты сам местный или тоже переехал?",
        meaning: "Men (shahar)danman. O'zing shu yerdanmisan yoki ko'chib kelganmisan?",
        note: "Aniq javob + Ulovchi savol"
      },
      {
        text: "Живу в (город). Ты давно в этом городе живешь?",
        meaning: "(Shahar)da yashayman. Bu shaharda ko'pdan beri yashaysanmi?",
        note: "Suhbatni davom ettirish"
      },
      {
        text: "Я из (страна), сейчас в (город). Бывал там когда-нибудь?",
        meaning: "Men (davlat)danman, hozir (shahar)daman. U yerda biror marta bo'lganmisan?",
        note: "Batafsil javob"
      }
    ],
    jokes: [
      {
        text: "Я из (город), где без навигатора не обойтись) А ты город хорошо знаешь?",
        meaning: "(Shahar)danman, navigatorsiz adashib qolasan) Shaharni yaxshi bilasanmi?",
        note: "Shahar hazili"
      }
    ]
  },

  // 4. QAYERDAN (Откуда ты? / Откуда вы?)
  {
    matcher: (t) => /откуда|родился|родилась|где вырос/i.test(t),
    meaning: "Qayerdansan? / Asli qayerliksan?",
    responses: [
      {
        text: "Я из (страна), живу в (город). А ты откуда родом?",
        meaning: "Men (davlat)danman, (shahar)da yashayman. O'zing qayerdansan?",
        note: "To'liq javob + savol"
      },
      {
        text: "Сам из (город). Давно здесь находишься?",
        meaning: "O'zim (shahar)danman. Bu yerda ancha bo'ldingmi?",
        note: "Suhbatni ulovchi"
      }
    ],
    jokes: [
      {
        text: "Я оттуда, где круглый год солнце и вкусная еда) А ты откуда?",
        meaning: "Men yil bo'yi quyosh porlaydigan va mazali taomlar pishadigan joydanman) O'zing qayerdansan?",
        note: "Yurt hazili"
      }
    ]
  },

  // 5. SALOM / SALOMLASHISH (Привет / Здравствуйте)
  {
    matcher: (t) => /^(привет|здравствуй|здравствуйте|добрый день|добрый вечер|доброе утро|салам|хай|салют|здорово)[\s.!?,]*$/i.test(t) || /привет|здравствуй|добрый день|салют/i.test(t),
    meaning: "Salom! / Assalomu alaykum!",
    responses: [
      {
        text: "Привет! Как твой день проходит?",
        meaning: "Salom! Kuning qanday o'tyapti?",
        note: "Samimiy salom + savol"
      },
      {
        text: "Салют! Рад слышать, как твое настроение?",
        meaning: "Salom! Eshitganimdan xursandman, kayfiyating qalay?",
        note: "Jonli so'zlashuv"
      },
      {
        text: "Привет-привет! Что хорошего расскажешь?",
        meaning: "Salom-salom! Nima yangiliklar bor?",
        note: "Do'stona"
      }
    ],
    jokes: [
      {
        text: "Привет! Только о тебе подумал) Как жизнь?",
        meaning: "Salom! Hozirgina seni o'ylagandim) Hayot qalay?",
        note: "Iliq hazil"
      }
    ]
  },

  // 6. HOL-AHVOL (Как дела? / Как жизнь?)
  {
    matcher: (t) => /как.*?(?:дела|жизнь|поживаешь|поживаете|ты|вы|сам|сама|успехи|оно|настроение)|че как/i.test(t),
    meaning: "Ishlaring qalay? / Ahvoling qanday?",
    responses: [
      {
        text: "Всё отлично, спасибо! А у тебя что интересного произошло за день?",
        meaning: "Hammasi a'lo, rahmat! O'zingda kun davomida nima qiziq bo'ldi?",
        note: "Suhbatni qizdirish"
      },
      {
        text: "Идёт! Сам как, какие планы на сегодня?",
        meaning: "Bo'ladi, zo'r! O'zing qandaysan, bugunga qanday rejalar?",
        note: "Jonli jargon"
      },
      {
        text: "Да потихоньку, на позитиве. Как твой настрой?",
        meaning: "Sekin-asta, yaxshi kayfiyatda. O'zingda kayfiyat qanday?",
        note: "Ijobiy savol"
      }
    ],
    jokes: [
      {
        text: "Всё настолько хорошо, что даже подозрительно) А у тебя как день?",
        meaning: "Hammasi shunchalik yaxshiki, hatto shubhali) O'zingda kun qalay?",
        note: "Kayfiyat hazili"
      }
    ]
  },

  // 7. ISM / TANISHUV (Как тебя зовут?)
  {
    matcher: (t) => /как.*?(?:тебя|вас)?.*?зовут|твое.*?имя|ваше.*?имя|познакомимся|познакомиться|давай познакомимся|кто ты/i.test(t),
    meaning: "Isming nima? / Tanishaylikmi?",
    responses: [
      {
        text: "Я (имя). Очень приятно! А тебя как зовут?",
        meaning: "Men (ism)man. Tanishganimdan juda xursandman! O'zingning isming nima?",
        note: "To'g'ridan-to'g'ri tanishuv"
      },
      {
        text: "Меня зовут (имя). Давно в этом месте бываешь?",
        meaning: "Mening ismim (ism). Bu yerga tez-tez kelib turasanmi?",
        note: "Joyga bog'lash"
      },
      {
        text: "Приятно познакомиться, я (имя). Чем увлекаешься?",
        meaning: "Tanishganimdan xursandman, men (ism)man. Qiziqishlaring nima?",
        note: "Qiziqishga o'tish"
      }
    ],
    jokes: [
      {
        text: "Я (имя). Главное — имя не забыть через пять минут) А тебя как?",
        meaning: "Men (ism)man. Asosiysi 5 minutdan keyin esdan chiqarmaslik) O'zingniki-chi?",
        note: "Ism hazili"
      }
    ]
  },

  // 8. YOSH (Сколько тебе лет?)
  {
    matcher: (t) => /сколько.*?(?:тебе|вам)?.*?лет|какой.*?возраст|сколько исполнилось/i.test(t),
    meaning: "Yoshing nechida?",
    responses: [
      {
        text: "Мне (возраст). А ты на сколько себя ощущаешь?",
        meaning: "Menga (yosh)da. O'zing o'zingni necha yoshda his qilasan?",
        note: "Qiziqarli savol"
      },
      {
        text: "Мне сейчас (возраст). Сколько мне дашь на вид?",
        meaning: "Hozir yoshim (yosh)da. Ko'rinishimdan nechaga o'xshatasan?",
        note: "O'yinli savol"
      }
    ],
    jokes: [
      {
        text: "Мне (возраст), но в душе вечные 18) А тебе сколько?",
        meaning: "Menga (yosh)da, ammo qalbimda hamon 18 yoshman) O'zing nechadasan?",
        note: "Yosh hazili"
      }
    ]
  },

  // 9. KASB VA ISH (Кем работаешь? / Где работаешь?)
  {
    matcher: (t) => /кем.*?(?:работаешь|вы работаете|трудишься)|где.*?(?:работаешь|вы работаете|учишься)|какая.*?професси|чем по жизни|на кого учишься/i.test(t),
    meaning: "Kasbing nima? / Nima ish qilasan?",
    responses: [
      {
        text: "Работаю в сфере (сфера). А тебе твоя работа нравится?",
        meaning: "(Soha) sohasida ishlayman. O'zingga ishing yoqadimi?",
        note: "Aniq javob + savol"
      },
      {
        text: "Я (сфера). А ты давно в своей профессии?",
        meaning: "Men (soha)man. O'zing o'z sohangda ancha bo'ldimi?",
        note: "Tajribani so'rash"
      },
      {
        text: "Занимаюсь проектами в (сфера). У тебя плотный график или есть время отдыхать?",
        meaning: "(Soha)da ishlayman. Ishing tig'izmi yoki dam olishga vaqt bormi?",
        note: "Dam olishga ulash"
      }
    ],
    jokes: [
      {
        text: "Работаю в (сфера) — в основном превращаю кофе в результат) А ты чем занят?",
        meaning: "(Soha)da ishlayman — kofeni natijalarga aylantiraman) O'zing nima ish qilasan?",
        note: "Ish hazili"
      }
    ]
  },

  // 10. HOBBI, MUSIQA VA KINO (Музыка / Кино / Хобби)
  {
    matcher: (t) => /музык|кино|фильм|книг|чита|хобби|увлечени|спорт|гулять|сериал|песн/i.test(t),
    meaning: "Qiziqishlaringiz / Musiqa / Kino haqida",
    responses: [
      {
        text: "Люблю хорошую музыку, фильмы и прогулки. А у тебя какие увлечения?",
        meaning: "Yaxshi musiqa, kinolarni va sayr qilishni yoqtiraman. O'zing nimaga ko'proq qiziqasan?",
        note: "Hobbi + savol"
      },
      {
        text: "В свободное время слушаю треки и отдыхаю. Какой жанр тебе ближе?",
        meaning: "Bo'sh vaqtimda musiqalar eshitib dam olaman. Senga qaysi janr ko'proq yoqadi?",
        note: "Didni so'rash"
      },
      {
        text: "Да, очень люблю! Какую классную вещь ты недавно смотрел или слушал?",
        meaning: "Ha, juda yoqtiraman! Yaqinda qaysi ajoyib narsani ko'rding yoki eshitding?",
        note: "Jonli savol"
      }
    ],
    jokes: [
      {
        text: "Мое главное хобби — вкусно поесть и выспаться) А ты чем горишь?",
        meaning: "Mening asosiy hobbiyim — mazza qilib ovqatlanish va to'yib uxlash) O'zing nimaga qiziqasan?",
        note: "Hobbi hazili"
      }
    ]
  },

  // 11. KOFE / QAYERGA BORAMIZ (Куда пойдем? / Пойдем кофе?)
  {
    matcher: (t) => /куда.*?(?:пойдем|сходим)|кофе|попьем кофе|посидим|погуляем|встретимся|перекусим|чай/i.test(t),
    meaning: "Qayerga boramiz? / Kofe ichamizmi? / Aylanamizmi?",
    responses: [
      {
        text: "Го, я только за! Во сколько и куда пойдем?",
        meaning: "Kettik, men faqat roziman! Soat nechada va qayerga boramiz?",
        note: "Jonli rozilik + vaqt"
      },
      {
        text: "Давай в кофейню рядом зайдем. Ты какой кофе больше любишь?",
        meaning: "Yondagi qahvaxonaga kiraylik. Qaysi kofeni ko'proq yoqtirasan?",
        note: "Didni so'rash"
      },
      {
        text: "С удовольствием. Знаешь здесь классное место?",
        meaning: "Jon deb. Shu yerda zo'r joyni bilasanmi?",
        note: "Joy tanlash"
      }
    ],
    jokes: [
      {
        text: "Главное, чтобы кофе был нормальный) Какое место знаешь?",
        meaning: "Asosiysi kofesi yaxshi bo'lsin) Qaysi joyni bilasan?",
        note: "Kofe hazili"
      }
    ]
  },

  // 12. QAYERDASAN (Ты где? / Где находишься?)
  {
    matcher: (t) => /где ты|ты где|где находишься|далеко еще|скоро будешь|ты уже тут/i.test(t),
    meaning: "Qayerdasan? / Qayerga yetding?",
    responses: [
      {
        text: "На подходе, минут через пять буду. Ты уже на месте?",
        meaning: "Kelib qoldim, 5 minutda yetib boraman. O'zing joyidami san?",
        note: "Aniq vaqt + savol"
      },
      {
        text: "В дороге, скоро буду. Где именно тебя встретить?",
        meaning: "Yo'ldaman, tezda boraman. Aynan qayerda kutib olay seni?",
        note: "Lokatsiya"
      }
    ],
    jokes: [
      {
        text: "Уже лечу на всех парах, не теряй) Ты кофе уже заказал?",
        meaning: "Shiddat bilan uchyapman, yo'qotib qo'yma) Kofe buyurtma berib qo'ydingmi?",
        note: "Hazil"
      }
    ]
  },

  // 13. BO'SHMISAN / REJALAR (Какие планы? / Ты свободен?)
  {
    matcher: (t) => /свободен|свободна|есть время|планы на вечер|планы на выходные|какие планы/i.test(t),
    meaning: "Qanday rejalaring bor? / Bo'shmisan?",
    responses: [
      {
        text: "Пока планов нет, вполне свободен. Что интересного предложишь?",
        meaning: "Hozircha rejam yo'q, bemalol bo'shman. Nima qiziq taklifing bor?",
        note: "Ochiq taklif"
      },
      {
        text: "Вечер совершенно свободный. Есть классная идея, куда сходить?",
        meaning: "Kechqurun butunlay bo'shman. Qayerga borish haqida yaxshi g'oyang bormi?",
        note: "Fikr so'rash"
      }
    ],
    jokes: [
      {
        text: "Мой план — спокойно отдохнуть) А у тебя какие грандиозные замыслы?",
        meaning: "Mening rejam — tinchgina dam olish) O'zingda qanday katta rejalaring bor?",
        note: "Reja hazili"
      }
    ]
  },

  // 14. MAQTOV (Ты красивая / красивый)
  {
    matcher: (t) => /красив|милая|милый|хорошо выглядит|стильно|классная|классный|красотка|красавчик/i.test(t),
    meaning: "Juda chiroylisan / Ajoyib ko'rinyapsan",
    responses: [
      {
        text: "Спасибо, приятно слышать! Ты всегда так внимателен?",
        meaning: "Rahmat, juda yoqimli! O'zing doim shunday e'tiborlimisan?",
        note: "E'tiborga javob"
      },
      {
        text: "Спасибо! Ты тоже отлично выглядишь. Давно сюда пришел?",
        meaning: "Rahmat! O'zing ham ajoyib ko'rinyapsan. Bu yerga kelganingga ancha bo'ldimi?",
        note: "Suhbatni ulash"
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

  // 15. RAHMAT (Спасибо)
  {
    matcher: (t) => /спасибо|благодарю|спс|от души|большое спасибо/i.test(t),
    meaning: "Rahmat! / Tashakkur!",
    responses: [
      {
        text: "Да не за что! Всегда рад помочь. Как твой день проходит?",
        meaning: "Arzimaydi! Doim yordam berishdan xursandman. Kuning qanday o'tyapti?",
        note: "Samimiy + davomiylik"
      },
      {
        text: "Всегда пожалуйста! Чем еще могу помочь?",
        meaning: "Doim marhamat! Yana nimada yordam bera olaman?",
        note: "Yordam taklifi"
      }
    ],
    jokes: [
      {
        text: "С тебя улыбка — и мы в расчете) Договорились?",
        meaning: "Sendan bitta tabassum — hisobimiz tenglashdi) Kelishdikmi?",
        note: "Hazil"
      }
    ]
  },

  // 16. XAYRLASHUV (Пока / До встречи)
  {
    matcher: (t) => /пока|до встречи|до свидания|бывай|увидимся|спокойной ночи|доброй ночи/i.test(t),
    meaning: "Xayr! / Ko'rishguncha!",
    responses: [
      {
        text: "Давай, на связи! Напишешь, как освободишься?",
        meaning: "Bo'pti, aloqadamiz! Bo'shaganingda yozasanmi?",
        note: "Aloqa saqlash"
      },
      {
        text: "До встречи! Отличного тебе продолжения дня.",
        meaning: "Ko'rishguncha! Kuning ajoyib davom etsin.",
        note: "Ezgu tilak"
      }
    ],
    jokes: [
      {
        text: "Бывай, не пропадай надолго) Спишемся?",
        meaning: "Xayr, uzoqqa yo'qolib ketma) Yozishamiz-a?",
        note: "Ochiq eshik"
      }
    ]
  },

  // 17. NEGA JIMSAN (Почему молчишь?)
  {
    matcher: (t) => /почему.*?(?:молчишь|не отвечаешь)|куда.*?(?:пропал|пропала)|ты тут|ответь/i.test(t),
    meaning: "Nega jim bo'lib qolding? / Shu yerdamisan?",
    responses: [
      {
        text: "Я тут, просто немного отвлекся. О чем мы говорили?",
        meaning: "Shu yerdaman, biroz chalg'idim. Nima haqida gaplashayotgandik?",
        note: "Qaytish + savol"
      },
      {
        text: "Здесь я, на связи! Что ты имел в виду?",
        meaning: "Shu yerdaman, aloqadaman! Nima demoqchi eding?",
        note: "Aniqlovchi savol"
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

  // 18. QISQA ROZILIK (Да / Понятно / Ясно / Хорошо / Ок)
  {
    matcher: (t) => /^да$|^ага$|^понятно$|^ясно$|^хорошо$|^ок$|^ладно$|^договорились$|^круто$|^класс$/i.test(t.trim()),
    meaning: "Tushunarli / Yaxshi / Kelishdik",
    responses: [
      {
        text: "Отлично! А дальше какие мысли или планы?",
        meaning: "Ajoyib! Keyin qanday fikrlaring yoki rejalaring bor?",
        note: "Keyingi qadam"
      },
      {
        text: "Договорились. Чем сейчас займемся?",
        meaning: "Kelishdik. Hozir nima bilan mashg'ul bo'lamiz?",
        note: "Harakat taklifi"
      }
    ],
    jokes: [
      {
        text: "Краткость — сестра таланта) А подробнее расскажешь?",
        meaning: "Qisqalik — iste'dodning singlisi) Batafsilroq aytib berasanmi?",
        note: "Hazil"
      }
    ]
  }
];

/**
 * Universal suhbatni davom ettiruvchi generator
 */
export function generateAcquaintanceResponse(input, selectedIndex = 0, isJokeRequested = false) {
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
        { text: "Салют! Рад слышать, как твое настроение?", meaning: "Salom! Eshitganimdan xursandman, kayfiyating qalay?", note: "Jonli so'zlashuv" },
        { text: "Привет-привет! Что хорошего расскажешь?", meaning: "Salom-salom! Nima yangiliklar bor?", note: "Do'stona" }
      ],
      currentVariantIndex: 0,
      totalVariants: 3
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
          { text: "Я из (город). А ты сам местный или тоже переехал?", meaning: "Men (shahar)danman. O'zing shu yerdanmisan yoki ko'chib kelganmisan?", note: "Aniq javob + savol" },
          { text: "Живу в (город). Ты давно в этом городе?", meaning: "(Shahar)da yashayman. Bu shaharda ko'pdan beri yashaysanmi?", note: "Londa javob" }
        ],
        jokes: [
          { text: "Я из (город), где всегда тепло) А ты откуда?", meaning: "Men doim iliq bo'lgan (shahar)danman) O'zing qayerdansan?", note: "Shahar hazili" }
        ]
      };
    } else if (clean.includes('?')) {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Интересный вопрос! В моем случае это (ответ). А у тебя как с этим?", meaning: "Qiziqarli savol! Mening holatimda bu (javob). O'zingda bu qanday?", note: "Mantiqiy javob + savol" },
          { text: "Думаю, в целом это (ответ). Ты почему решил об этом спросить?", meaning: "Menimcha, umuman olganda bu (javob). Nega bu haqda so'rab qolding?", note: "Qiziqish" },
          { text: "Смотря как посмотреть, но скорее (ответ). А твое какое мнение?", meaning: "Qanday qarashga bog'liq, ammo ko'proq (javob). O'zingning fikring qanday?", note: "Fikr almashish" }
        ],
        jokes: [
          { text: "Вопрос с подвохом) Мой ответ — (ответ), а твой какой?", meaning: "Hiylali savol ekan) Mening javobim — (javob), o'zingniki-chi?", note: "Hazil" }
        ]
      };
    } else {
      matched = {
        meaning: partnerMeaning,
        responses: [
          { text: "Звучит логично! А что думаешь насчет этого дальше?", meaning: "Mantiqli eshitildi! Bu borada keyin nima deb o'ylaysan?", note: "Mantiqiy davom" },
          { text: "Понял тебя. И как тебе такое развитие событий?", meaning: "Tushundim seni. Va bu voqealar rivojiga qanday qaraysan?", note: "Fikr so'rash" },
          { text: "Любопытная мысль! Ты давно к такому выводу пришел?", meaning: "Qiziq fikr! Bu xulosaga kelganingga ancha bo'ldimi?", note: "Suhbatni chuqurlashtirish" }
        ],
        jokes: [
          { text: "Звучит солидно, даже спорить не буду) А что дальше?", meaning: "Salobatli eshitildi, bahslashmayman ham) Keyin-chi?", note: "Hazil" }
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
