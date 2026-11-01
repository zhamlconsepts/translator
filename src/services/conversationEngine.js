/**
 * SuhbatDosh Aqlli Ong — Suhbat Yordamchisi (Conversation Engine)
 * - Matnni tushunish
 * - O'zbekcha ma'nosini chiqarish
 * - Jinsga moslash (Erkak / Ayol grammatikasi: Rus, Ingliz, O'zbek)
 * - 4 xil ohang: Do'stona, Qiziqarli/Flirt, Rasmiy, Qisqa
 * - Har bir javob tagida O'zbekcha tarjimasi + Lotincha talaffuz o'qilishi
 * - "Yangilash" (Regenerate) imkoniyati
 */

import { detectLanguage } from './languageDetector.js';

// Lotincha talaffuzga o'girish (Cyrillic to Latin phonetic transliteration)
export function toPhonetic(cyrillicText) {
  if (!cyrillicText) return '';
  const map = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'Ye', 'е': 'e',
    'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
    'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r',
    'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x', 'Ц': 'Ts', 'ц': 'ts',
    'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Sh', 'щ': 'sh',
    'Ъ': '', 'ъ': '', 'Ы': 'I', 'ы': 'i', 'Ь': '', 'ь': '',
    'Э': 'E', 'э': 'e', 'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya'
  };

  return cyrillicText.split('').map((char, i, arr) => {
    // E harfi so'z boshida yoki unlidan keyin 'Ye' bo'ladi
    if (char === 'е' || char === 'Е') {
      const prev = arr[i - 1];
      if (!prev || 'аеёиоуыэюя АЕЁИОУЫЭЮЯ'.includes(prev)) {
        return char === 'Е' ? 'Ye' : 'ye';
      }
      return char === 'Е' ? 'E' : 'e';
    }
    return map[char] !== undefined ? map[char] : char;
  }).join('');
}

// Interlocutor aytgan gapning O'zbekcha ma'nosi (Fast semantic dictionary + rules)
export function translateToUzbek(input, langCode) {
  if (!input) return '';
  const clean = input.trim().toLowerCase();

  // Ruscha keng tarqalgan iboralar
  const ruMap = [
    { regex: /привет|здравствуй|хай|добрый день|добрый вечер|доброе утро/i, tr: "Salom! / Xayrli kun!" },
    { regex: /как дела|как жизнь|как поживаешь|как ты|как успехи|как настроение/i, tr: "Ishlar qanday? / Qalaysan? / Kayfiyat qalay?" },
    { regex: /чем занимаешься|что делаешь/i, tr: "Nima ish bilan bandsan? / Nima qilyapsan?" },
    { regex: /ты где|где находишься|где ты/i, tr: "Qayerdasan? / Qayerda turibsan?" },
    { regex: /почему молчишь|почему не отвечаешь/i, tr: "Nega jim bo'lib qolding? / Nega javob bermayapsan?" },
    { regex: /ты мне нравишься|я скучаю|скучаю по тебе/i, tr: "Menga yoqasan / Seni sog'indim" },
    { regex: /ты очень красивая|красивый|прекрасно выглядишь|ты милая|ты супер/i, tr: "Juda chiroylisan / Ajoyib ko'rinyapsan / Qoyilsan" },
    { regex: /пойдем|пошли|давай встретимся|выпьем кофе|погуляем/i, tr: "Keling/Yuring, uchrashaylik / Birga kofe ichamiz / Aylanib kelamiz" },
    { regex: /ты свободна|ты свободен|есть планы на вечер/i, tr: "Bo'shmisan? / Bugun kechqurunga rejalaring bormi?" },
    { regex: /спасибо|благодарю/i, tr: "Rahmat / Tashakkur" },
    { regex: /пожалуйста/i, tr: "Iltimos / Arzimaydi" },
    { regex: /да|конечно|согласен|согласна|давай/i, tr: "Ha / Albatta / Roziman / Qani ketdik" },
    { regex: /нет|не хочу|не могу|не согласен|не согласна/i, tr: "Yo'q / Xohlamayman / Qila olmayman" },
    { regex: /что нового|какие новости/i, tr: "Nima yangiliklar bor?" },
    { regex: /откуда ты|где живешь/i, tr: "Qayerdansan? / Qayerda yashaysan?" },
    { regex: /кем работаешь|где учишься/i, tr: "Kim bo'lib clarifies/ishlaysan? / Qayerda o'qiysan?" },
    { regex: /я устал|я устала|у меня проблемы|тяжелый день/i, tr: "Charchadim / Ishlarim og'ir bo'ldi / Qiyin kun o'tdi" },
    { regex: /пока|до встречи|до свидания|спокойной ночи/i, tr: "Xayr / Ko'rishguncha / Xayrli tun" },
  ];

  // Inglizcha keng tarqalgan iboralar
  const enMap = [
    { regex: /hello|hi|hey|good morning|good afternoon|good evening/i, tr: "Salom! / Xayrli kun!" },
    { regex: /how are you|how is it going|what's up|how you doing/i, tr: "Qalaysan? / Ishlar qalay? / Nima yangiliklar?" },
    { regex: /what are you doing|what you up to/i, tr: "Nima bilan bandsan? / Nima qilyapsan?" },
    { regex: /you look great|you are beautiful|handsome/i, tr: "Ajoyib ko'rinyapsan / Chiroylisan" },
    { regex: /let's meet|coffee|hang out/i, tr: "Keling ko'rishaylik / Kofe ichamiz / Aylanamiz" },
    { regex: /are you free|any plans/i, tr: "Bo'shmisan? / Biror rejang bormi?" },
    { regex: /thank you|thanks/i, tr: "Rahmat!" },
    { regex: /bye|see you|good night/i, tr: "Xayr / Ko'rishguncha / Xayrli tun" },
  ];

  if (langCode === 'ru' || /[а-яё]/i.test(input)) {
    for (const item of ruMap) {
      if (item.regex.test(clean)) return item.tr;
    }
  }

  if (langCode === 'en' || /^[a-zA-Z\s,.'!?-]+$/.test(input)) {
    for (const item of enMap) {
      if (item.regex.test(clean)) return item.tr;
    }
  }

  // Umumiy yoki qisqa matnlar
  if (clean.length < 30) {
    return `Suhbatdoshingiz: "${input}"`;
  }
  return "Suhbatdosh jumlasi (quyida unga eng mos javoblar tayyorlandi)";
}

/**
 * Suhbat kontekstini aniqlash
 */
function identifyContext(input) {
  const t = input.toLowerCase();

  if (/привет|здравствуй|добрый|салам|хай|hello|hi|hey|salom|merhaba/i.test(t)) return 'greeting';
  if (/как дела|как поживаешь|как жизнь|как ты|как успехи|how are you|what's up|nasılsın|qalay/i.test(t)) return 'how_are_you';
  if (/чем занимаешься|что делаешь|what are you doing|nima qilyapsan/i.test(t)) return 'doing_what';
  if (/красив|милая|милый|нравишься|скучаю|прекрасн|секси|beautiful|pretty|gorgeous|chiroyli/i.test(t)) return 'compliment_or_flirt';
  if (/кофе|встретимся|погуляем|пойдем|пошли|ужин|кино|coffee|meet|dinner|uchrash/i.test(t)) return 'invitation';
  if (/свободн|планы|сегодня вечером|выходн|free|plans|weekend|boshmisan/i.test(t)) return 'plans';
  if (/где ты|куда|откуда|where are you|where from|qayerda/i.test(t)) return 'location';
  if (/почему|зачем|why|nega/i.test(t)) return 'why_question';
  if (/спасибо|благодар|thank/i.test(t)) return 'gratitude';
  if (/пока|до встречи|до свидан|bye|see you|xayr/i.test(t)) return 'farewell';
  if (/устал|тяжело|грустно|tired|sad|charchadim/i.test(t)) return 'tired_or_sad';
  if (/да|конечно|yes|ha/i.test(t)) return 'affirmative';
  if (/нет|не хочу|no|yoq/i.test(t)) return 'negative';

  return 'general';
}

/**
 * Jins grammatikasini to'g'irlash (Gender Agreement)
 * userGender: 'male' (Erkak) | 'female' (Ayol)
 * partnerGender: 'male' (Erkak) | 'female' (Ayol)
 */
function applyGender(text, userGender, partnerGender) {
  let res = text;

  if (userGender === 'female') {
    // Men ayol bo'lsam:
    res = res.replace(/\bрад\b/g, 'рада')
             .replace(/\bустал\b/g, 'устала')
             .replace(/\bготов\b/g, 'готова')
             .replace(/\bсогласен\b/g, 'согласна')
             .replace(/\bуверен\b/g, 'уверена')
             .replace(/\bсвободен\b/g, 'свободна')
             .replace(/\bпонял\b/g, 'поняла')
             .replace(/\bвидел\b/g, 'видела')
             .replace(/\bслышал\b/g, 'слышала')
             .replace(/\bподумал\b/g, 'подумала')
             .replace(/\bрешил\b/g, 'решила')
             .replace(/\bпошел\b/g, 'пошла')
             .replace(/\bждал\b/g, 'ждала')
             .replace(/\bзабыл\b/g, 'забыла')
             .replace(/\bхотел\b/g, 'хотела');
  } else {
    // Men erkak bo'lsam:
    res = res.replace(/\bрада\b/g, 'рад')
             .replace(/\bустала\b/g, 'устал')
             .replace(/\bготова\b/g, 'готов')
             .replace(/\bсогласна\b/g, 'согласен')
             .replace(/\bуверена\b/g, 'уверен')
             .replace(/\bсвободна\b/g, 'свободен')
             .replace(/\bпоняла\b/g, 'понял')
             .replace(/\bвидела\b/g, 'видел')
             .replace(/\bслышала\b/g, 'слышал')
             .replace(/\bподумала\b/g, 'подумал')
             .replace(/\bрешила\b/g, 'решил')
             .replace(/\bпошла\b/g, 'пошел')
             .replace(/\bждала\b/g, 'ждал')
             .replace(/\bзабыла\b/g, 'забыл')
             .replace(/\bхотела\b/g, 'хотел');
  }

  if (partnerGender === 'female') {
    // Suhbatdoshim ayol kishi bo'lsa:
    res = res.replace(/\bкрасивый\b/g, 'красивая')
             .replace(/\bумный\b/g, 'умница')
             .replace(/\bмилый\b/g, 'милая')
             .replace(/\bдорогой\b/g, 'дорогая')
             .replace(/\bты свободен\b/g, 'ты свободна')
             .replace(/\bты устал\b/g, 'ты устала')
             .replace(/\bты готов\b/g, 'ты готова');
  } else {
    // Suhbatdoshim erkak kishi bo'lsa:
    res = res.replace(/\bкрасивая\b/g, 'красивый')
             .replace(/\bмилая\b/g, 'милый')
             .replace(/\bдорогая\b/g, 'дорогой')
             .replace(/\bты свободна\b/g, 'ты свободен')
             .replace(/\bты устала\b/g, 'ты устал')
             .replace(/\bты готова\b/g, 'ты готов');
  }

  return res;
}

/**
 * Rus tili uchun javoblar bazasi (Boyitilgan variantlar to'plami)
 */
const RU_RESPONSES = {
  greeting: [
    {
      friendly: [
        { t: "Привет! Очень рад тебя видеть, как твои дела?", u: "Salom! Seni ko'rganimdan juda xursandman, ishlaring qalay?" },
        { t: "Привет! Только что думал о тебе, как ты?", u: "Salom! Hozirgina sen haqda o'ylayotgandim, o'zing qalaysan?" },
        { t: "Привет-привет! Как твое настроение сегодня?", u: "Salom-salom! Bugun kayfiyating qalay?" }
      ],
      flirty: [
        { t: "Привет! С твоим появлением мой день стал намного лучше.", u: "Salom! Sen paydo bo'lishing bilan kunim ancha go'zallashdi." },
        { t: "Привет! Ты как всегда сияешь. Чем порадуешь сегодня?", u: "Salom! Doimgidek yarqirab turibsan. Bugun meni nima bilan xursand qilasan?" },
        { t: "Привет! Не думал, что сегодня встречу кого-то настолько приятного.", u: "Salom! Bugun bunchalik yoqimli insonni uchrataman deb o'ylamagandim." }
      ],
      formal: [
        { t: "Здравствуйте! Рад приветствовать вас. Как ваши дела?", u: "Assalomu alaykum! Sizni ko'rganimdan xursandman. Ishlaringiz qanday?" },
        { t: "Добрый день! Надеюсь, ваш день проходит продуктивно.", u: "Xayrli kun! Umid qilamanki, kuningiz unumli o'tmoqda." }
      ],
      short: [
        { t: "Привет! Как ты?", u: "Salom! Qalaysan?" },
        { t: "Привет! Рад слышать.", u: "Salom! Eshitganimdan xursandman." },
        { t: "Салют! Всё супер?", u: "Salom! Hammasi zo'rmi?" }
      ]
    }
  ],
  how_are_you: [
    {
      friendly: [
        { t: "Всё отлично, спасибо! День насыщенный, а у тебя как?", u: "Hammasi zo'r, rahmat! Kunim juda sermazmun o'tyapti, senda-chi?" },
        { t: "Да потихоньку, всё хорошо! Как твои успехи?", u: "Sekin-asta, hammasi yaxshi! Sendagi yangiliklar qanday?" },
        { t: "Прекрасно! Главное настроение на высоте, ты сам(а) как?", u: "Ajoyib! Eng muhimi kayfiyat a'lo darajada, o'zing qalaysan?" }
      ],
      flirty: [
        { t: "Теперь, когда ты спросил(а), вообще отлично! А у тебя?", u: "Endi sen so'raganingdan keyin, umuman a'lo bo'ldi! Senda-chi?" },
        { t: "Было обычно, но твое сообщение сделало мой день ярче.", u: "Oddiy o'tayotgandi, lekin sening xabaring kunimni yoritib yubordi." }
      ],
      formal: [
        { t: "Спасибо, всё в порядке, работаем. Как ваши дела?", u: "Rahmat, hammasi joyida, ishlayapmiz. Sizning ishlaringiz qanday?" },
        { t: "Благодарю, всё отлично. Надеюсь, у вас тоже всё благополучно.", u: "Tashakkur, hammasi a'lo. Sizda ham barchasi yaxshi deb umid qilaman." }
      ],
      short: [
        { t: "Всё супер, а ты?", u: "Hammasi zo'r, o'zing-chi?" },
        { t: "Отлично! У тебя?", u: "Juda yaxshi! Senda-chi?" },
        { t: "Нормально, живём!", u: "Yaxshi, harakatdamiz!" }
      ]
    }
  ],
  doing_what: [
    {
      friendly: [
        { t: "Да так, отдыхаю и строю планы на вечер. А ты чем занят(а)?", u: "Shunchaki dam olyapman va kechqurunga reja qilyapman. O'zing nima qilyapsan?" },
        { t: "Заканчиваю пару дел, скоро буду свободен. Что у тебя интересного?", u: "Bir-ikkita ishlarni bitiryapman, tez orada bo'shayman. Senda nima qiziq?" }
      ],
      flirty: [
        { t: "Думаю о том, чем бы нам заняться вместе.", u: "Birga nima qilsak ekan deb o'ylab turgandim." },
        { t: "Отвлекаюсь на разговор с самым интересным человеком.", u: "Eng qiziqarli inson bilan suhbatga chalg'iyapman." }
      ],
      formal: [
        { t: "Занимаюсь текущими задачами. Если у вас есть вопрос, я слушаю.", u: "Joriy vazifalar bilan mashg'ulman. Agar savolingiz bo'lsa, eshitaman." }
      ],
      short: [
        { t: "Отдыхаю, а ты?", u: "Dam olyapman, sen-chi?" },
        { t: "Работаю потихоньку.", u: "Sekin ishlayapman." }
      ]
    }
  ],
  compliment_or_flirt: [
    {
      friendly: [
        { t: "Огромное спасибо! Мне безумно приятно это слышать.", u: "Katta rahmat! Buni eshitish menga juda yoqimli." },
        { t: "Спасибо! Ты тоже сегодня выглядишь просто сногсшибательно.", u: "Rahmat! O'zing ham bugun ko'zni qamashtiradigan darajada chiroylisan." }
      ],
      flirty: [
        { t: "Спасибо, но рядом с тобой невозможно выглядеть иначе.", u: "Rahmat, lekin sening yoningda boshqacha ko'rinishning iloji yo'q." },
        { t: "Ты умеешь делать комплименты... Моё сердце чуть быстрее забилось.", u: "Sen maqtov aytishni bilarkansan... Yuragim tezroq ura boshladi." },
        { t: "Осторожно, а то я к таким приятным словам быстро привыкну!", u: "Ehtiyot bo'l, bunday yoqimli so'zlarga tez o'rganib qolaman!" }
      ],
      formal: [
        { t: "Благодарю вас за такие добрые слова. Очень приятно.", u: "Bunday ezgu so'zlaringiz uchun tashakkur. Juda yoqimli." }
      ],
      short: [
        { t: "Спасибо, приятно!", u: "Rahmat, juda yoqimli!" },
        { t: "Ты тоже супер!", u: "Sen ham qoyilsan!" }
      ]
    }
  ],
  invitation: [
    {
      friendly: [
        { t: "Отличная идея, я с удовольствием! Во сколько и куда?", u: "Ajoyib fikr, jon deb boraman! Soat nechida va qayerga?" },
        { t: "Звучит заманчиво! Давай так и сделаем.", u: "Juda qiziq eshitilyapti! Qani, shunday qilamiz." }
      ],
      flirty: [
        { t: "От такого предложения я просто не имею права отказаться.", u: "Bunday taklifdan rad etishga shunchaki haqqim yo'q." },
        { t: "Только если угостишь самым вкусным кофе и своей улыбкой.", u: "Faqat eng shirin kofe va chiroyli tabassuming bilan siylasang." }
      ],
      formal: [
        { t: "Спасибо за приглашение. Давайте согласуем удобное время.", u: "Taklif uchun rahmat. Keling qulay vaqtni kelishib olamiz." }
      ],
      short: [
        { t: "Давай, я за!", u: "Qani ketdik, men roziman!" },
        { t: "С удовольствием!", u: "Jon deb!" }
      ]
    }
  ],
  plans: [
    {
      friendly: [
        { t: "Пока особых планов нет, а что ты предлагаешь?", u: "Hozircha jiddiy rejalarim yo'q, sen nima taklif qilasan?" },
        { t: "Я вполне свободен, открыт для любых классных идей!", u: "Men bemalol bo'shman, ajoyib g'oyalarga tayyorman!" }
      ],
      flirty: [
        { t: "Мои планы зависят от того, что ты предложишь.", u: "Mening rejalarim sen nima taklif qilishingga bog'liq." },
        { t: "Для тебя у меня всегда найдется свободное время.", u: "Sen uchun menda har doim bo'sh vaqt topiladi." }
      ],
      formal: [
        { t: "На вечер запланированы дела, но я могу освободить немного времени.", u: "Kechqurunga ishlarim bor edi, ammo biroz vaqt ajrata olaman." }
      ],
      short: [
        { t: "Свободен, а что?", u: "Bo'shman, tinchlikmi?" },
        { t: "Есть время!", u: "Vaqtim bor!" }
      ]
    }
  ],
  tired_or_sad: [
    {
      friendly: [
        { t: "Понимаю тебя, отдохни обязательно. Если захочешь выговориться, я рядом.", u: "Seni tushunaman, albatta dam ol. Agar dardlashmoqchi bo'lsang, men yoningdaman." },
        { t: "Держись! Сложные дни проходят, всё наладится.", u: "Bardam bo'l! Og'ir kunlar o'tib ketadi, hammasi iziga tushadi." }
      ],
      flirty: [
        { t: "Тебе срочно нужна порция тепла и чашка горячего чая в приятной компании.", u: "Senga zudlik bilan shinam davrada iliq choy va e'tibor kerak." }
      ],
      formal: [
        { t: "Сочувствую. Желаю вам поскорее набраться сил и отдохнуть.", u: "Hamdardman. Tezroq kuch to'plab, yaxshi dam olishingizni tilayman." }
      ],
      short: [
        { t: "Отдохни хорошенько!", u: "Yaxshilab dam ol!" },
        { t: "Я с тобой, держись.", u: "Men sen bilanman, chida." }
      ]
    }
  ],
  gratitude: [
    {
      friendly: [
        { t: "Не за что! Всегда рад помочь, обращайся в любое время.", u: "Arzimaydi! Doim yordam berishga tayyorman, istagan payt murojaat qil." }
      ],
      flirty: [
        { t: "Ради тебя — всё что угодно!", u: "Sen uchun bo'lsa — har narsaga tayyorman!" }
      ],
      formal: [
        { t: "Всегда пожалуйста! Был рад оказаться полезным.", u: "Marhamat! Foydam tekkanidan bag'oyat mamnunman." }
      ],
      short: [
        { t: "Не за что!", u: "Arzimaydi!" },
        { t: "На здоровье!", u: "Salomat bo'ling!" }
      ]
    }
  ],
  general: [
    {
      friendly: [
        { t: "Интересно! Расскажи об этом подробнее, мне любопытно.", u: "Qiziqarli! Bu haqda batafsilroq aytib ber, juda qiziqyapman." },
        { t: "Полностью согласен с тобой, очень точная мысль.", u: "Senga to'liq qo'shilaman, juda aniq fikr bildirding." },
        { t: "Да, ты абсолютно прав(а). А что ты думаешь делать дальше?", u: "Ha, mutlaqo haqsanki. Keyin nima qilishni o'ylayapsan?" }
      ],
      flirty: [
        { t: "С тобой так легко и увлекательно общаться, время просто летит.", u: "Sen bilan gaplashish shunchalik oson va maroqliki, vaqt uchib ketyapti." },
        { t: "Мне нравится, как ты рассуждаешь. Это очень притягивает.", u: "Fikr yuritishing menga juda yoqadi. Bu o'ziga rom qiladi." }
      ],
      formal: [
        { t: "Очень интересная точка зрения. Давайте обсудим детальнее.", u: "Juda qiziq nuqtai nazar. Keling batafsilroq gaplashib olamiz." }
      ],
      short: [
        { t: "Да, полностью согласен!", u: "Ha, to'liq qo'shilaman!" },
        { t: "Интересная мысль.", u: "Qiziqarli fikr." },
        { t: "Понял тебя.", u: "Seni tushundim." }
      ]
    }
  ]
};

/**
 * Ingliz tili javoblar to'plami
 */
const EN_RESPONSES = {
  greeting: [
    {
      friendly: [
        { t: "Hey! Great to see you, how have you been?", u: "Salom! Seni ko'rganimdan xursandman, ishlaring qalay o'tyapti?" },
        { t: "Hello there! How's your day going so far?", u: "Salom! Bugungi kuning qanday boshlandi?" }
      ],
      flirty: [
        { t: "Hey! You just made my day so much brighter.", u: "Salom! Keling bilan kunimni yoritib yubording." },
        { t: "Hey you! Looking amazing as always.", u: "Salom! Doimgidek ajoyib ko'rinyapsan." }
      ],
      formal: [
        { t: "Hello! Pleased to see you. How are you doing today?", u: "Assalomu alaykum! Sizni ko'rganimdan mamnunman. Bugun ahvolingiz qanday?" }
      ],
      short: [
        { t: "Hey! How are you?", u: "Salom! Qalaysan?" },
        { t: "Hi there!", u: "Salom!" }
      ]
    }
  ],
  general: [
    {
      friendly: [
        { t: "That sounds awesome! Tell me more about it.", u: "Ajoyib eshitilyapti! Bu haqda ko'proq aytib ber." },
        { t: "Totally agree with you, that makes total sense.", u: "Senga to'liq qo'shilaman, juda to'g'ri fikr." }
      ],
      flirty: [
        { t: "I really enjoy talking to you, you have great energy.", u: "Sen bilan gaplashish juda yoqadi, energiyang zo'r." }
      ],
      formal: [
        { t: "That is very interesting. I would like to hear more details.", u: "Bu juda qiziq. Batafsil eshitishni xohlardim." }
      ],
      short: [
        { t: "Totally agree!", u: "To'liq qo'shilaman!" },
        { t: "Sounds good!", u: "Yaxshi eshitilyapti!" }
      ]
    }
  ]
};

/**
 * Asosiy Javob Generatori
 * @param {string} input - suhbatdosh gapi
 * @param {string} userGender - 'male' | 'female'
 * @param {string} partnerGender - 'male' | 'female'
 * @param {number} variationIndex - yangilash bosilganda variantni almashtirish indeksi
 */
export function generateSuggestions(input, userGender = 'male', partnerGender = 'female', variationIndex = 0) {
  if (!input || !input.trim()) {
    return {
      detectedLanguage: { code: 'ru', name: 'Rus tili', flag: '🇷🇺' },
      partnerMeaning: "Suhbatdosh hali gapirmadi (Mikrofonni yoqing)",
      options: [
        {
          id: 'opt-1',
          tone: 'friendly',
          toneName: 'Do‘stona',
          text: userGender === 'female' ? "Привет! Очень рада тебя видеть, как дела?" : "Привет! Очень рад тебя видеть, как дела?",
          uzMeaning: "Salom! Seni ko'rganimdan juda xursandman, ishlaring qalay?",
          pronunciation: "[Privyet! Ochen rad(a) tebya vidyet, kak dela?]"
        },
        {
          id: 'opt-2',
          tone: 'flirty',
          toneName: 'Qiziqarli & Jonli',
          text: "Привет! С твоим появлением день стал намного ярче.",
          uzMeaning: "Salom! Sen kelishing bilan kun ancha yorishdi.",
          pronunciation: "[Privyet! S tvoim poyavleniyem dyen stal namnogo yarche]"
        },
        {
          id: 'opt-3',
          tone: 'formal',
          toneName: 'Rasmiy',
          text: "Здравствуйте! Рад(а) приветствовать вас. Как ваши дела?",
          uzMeaning: "Assalomu alaykum! Sizni qutlashdan mamnunman. Ishlaringiz qanday?",
          pronunciation: "[Zdravstvuyte! Rad privetstvovat vas. Kak vashi dela?]"
        },
        {
          id: 'opt-4',
          tone: 'short',
          toneName: 'Qisqa',
          text: "Привет! Как ты?",
          uzMeaning: "Salom! Qalaysan?",
          pronunciation: "[Privyet! Kak ti?]"
        }
      ]
    };
  }

  const lang = detectLanguage(input);
  const partnerMeaning = translateToUzbek(input, lang.code);
  const context = identifyContext(input);

  const dataSource = (lang.code === 'en') ? EN_RESPONSES : RU_RESPONSES;
  const pool = dataSource[context] || dataSource['general'];
  const block = pool[0];

  const pickItem = (arr) => {
    if (!arr || arr.length === 0) return { t: "Да, согласен", u: "Ha, roziman" };
    return arr[variationIndex % arr.length];
  };

  const tones = [
    { key: 'friendly', name: 'Do‘stona', icon: '😊' },
    { key: 'flirty', name: 'Qiziqarli & Jonli', icon: '✨' },
    { key: 'formal', name: 'Rasmiy & Odobli', icon: '👔' },
    { key: 'short', name: 'Qisqa & Londa', icon: '⚡' },
  ];

  const options = tones.map((toneObj, idx) => {
    const rawChoice = pickItem(block[toneObj.key] || block['friendly']);
    const finalText = applyGender(rawChoice.t, userGender, partnerGender);
    const phonetic = toPhonetic(finalText);

    return {
      id: `opt-${idx + 1}-${variationIndex}`,
      tone: toneObj.key,
      toneName: toneObj.name,
      icon: toneObj.icon,
      text: finalText,
      uzMeaning: rawChoice.u,
      pronunciation: `[${phonetic}]`
    };
  });

  return {
    detectedLanguage: lang,
    partnerMeaning,
    options
  };
}

