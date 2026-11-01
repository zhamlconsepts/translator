/**
 * SuhbatDosh - Ko'p bosqichli Suhbat Xotirasi (Multi-Turn Dialogue Memory)
 * 
 * Ushbu xizmat suhbatning butun ketma-ketligini xotirada saqlaydi:
 * - Kim nima dedi (Suhbatdosh vs Foydalanuvchi)
 * - Tanishilgan ismlar, kasblar, shaharlar, kayfiyatlar
 * - O'tmishdagi gaplar va savollar
 * - Tarixdan qidirish va eslash (Recall from History)
 */

class DialogueMemoryService {
  constructor() {
    this.history = [];
    this.facts = {
      partnerName: null,
      userName: "(имя)",
      partnerCity: null,
      partnerJob: null,
      partnerMood: null,
      lastUserQuestion: null,
      lastTopic: null,
      appTested: false
    };
  }

  // Yangi replikani qo'shish
  addTurn(speaker, text, meaning = '', language = 'ru') {
    if (!text || !text.trim()) return;
    
    const turn = {
      id: `turn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      speaker, // 'partner' yoki 'user'
      text: text.trim(),
      meaning: meaning.trim(),
      language,
      timestamp: Date.now()
    };

    this.history.push(turn);
    this.extractFacts(turn);
    return turn;
  }

  // Matndan faktlarni avtomatik ajratib olish va eslab qolish
  extractFacts(turn) {
    const text = turn.text;
    const lower = text.toLowerCase();

    if (turn.speaker === 'partner') {
      // Ismni eslab qolish: "Меня зовут Аня", "Я Аня", "My name is Anna", "Ismim Sevinch", "Adım Elif"
      const nameMatchRu = text.match(/(?:меня зовут|я\s*—|зовут)\s+([А-ЯЁA-Z][а-яёa-z]+)/i);
      const nameMatchEn = text.match(/(?:my name is|i am|i'm|call me)\s+([A-Z][a-z]+)/i);
      const nameMatchUz = text.match(/(?:ismim|otim)\s+([A-Z][a-z]+)/i);
      
      if (nameMatchRu && !/привет|салют|здесь|тут|дома/i.test(nameMatchRu[1])) {
        this.facts.partnerName = nameMatchRu[1];
      } else if (nameMatchEn && !/here|fine|good|not/i.test(nameMatchEn[1])) {
        this.facts.partnerName = nameMatchEn[1];
      } else if (nameMatchUz) {
        this.facts.partnerName = nameMatchUz[1];
      }

      // Shaharni eslab qolish: "Я из Москвы", "Живу в Ташкенте", "From London"
      const cityMatchRu = text.match(/(?:я из|живу в|приехал из|родом из)\s+([А-ЯЁA-Z][а-яёa-z]+)/i);
      const cityMatchEn = text.match(/(?:from|live in)\s+([A-Z][a-z]+)/i);
      if (cityMatchRu) this.facts.partnerCity = cityMatchRu[1];
      else if (cityMatchEn) this.facts.partnerCity = cityMatchEn[1];

      // Kasbni eslab qolish: "Работаю дизайнером", "Я программист", "I'm a developer"
      const jobMatchRu = text.match(/(?:работаю|я)\s+([а-яёa-z]+(?:ом|ем|истом|ером|иком))/i);
      if (jobMatchRu && !/утром|вечером|днем|первым/i.test(jobMatchRu[1])) {
        this.facts.partnerJob = jobMatchRu[1];
      }

      // Ilova sinovi haqida gap bo'ldimi
      if (/приложен|тест|провер/i.test(lower)) {
        this.facts.appTested = true;
      }
    } else {
      // Foydalanuvchi aytgan gapdagi savolni eslab qolish
      if (text.includes('?')) {
        this.facts.lastUserQuestion = text;
      }
    }
  }

  // Tarixdan savolga javob qidirish (Recall)
  findAnswerFromHistory(queryText, currentLanguage = 'ru') {
    if (!queryText) return null;
    const lower = queryText.toLowerCase();

    // 1. Suhbatdosh o'z ismini so'rasa: "Как меня зовут?", "Помнишь мое имя?", "Do you remember my name?"
    if (/как меня зовут|помнишь.*?имя|мое имя|ты помнишь кто я|what is my name|remember my name|ismim nima/i.test(lower)) {
      if (this.facts.partnerName) {
        if (currentLanguage === 'en') {
          return {
            text: `Of course, your name is ${this.facts.partnerName}! How could I forget?`,
            meaning: `Albatta, isming ${this.facts.partnerName}! Qanday qilib unutishim mumkin?`,
            note: "Tarixdan ismni eslash"
          };
        } else if (currentLanguage === 'uz') {
          return {
            text: `Albatta, ismingiz ${this.facts.partnerName}! Shunday chiroyli ismni unutib bo'larmidi?`,
            meaning: `Albatta, ismingiz ${this.facts.partnerName}! Unutmadim.`,
            note: "Tarixdan ismni eslash"
          };
        } else {
          return {
            text: `Конечно, тебя зовут ${this.facts.partnerName}! Разве такое имя забудешь?)`,
            meaning: `Albatta, seni isming ${this.facts.partnerName}! Shunday ismni unutib bo'larmidi?)`,
            note: "Tarixdan ismni eslash"
          };
        }
      }
    }

    // 2. Foydalanuvchining ismini qayta so'rasa: "А тебя как зовут?", "Напомни свое имя", "What was your name?"
    if (/как тебя зовут|твое имя|напомни.*?имя|what.*?your name|isming nima/i.test(lower) && this.history.length > 2) {
      if (currentLanguage === 'en') {
        return {
          text: "I am (name). We were talking just now, remember? What were we discussing?",
          meaning: "Men (ism)man. Hozirgina gaplashayotgandik, esingdami? Nima haqida gaplashayotgandik?",
          note: "Ismni eslatish"
        };
      } else {
        return {
          text: "Я (имя), мы как раз только что познакомились) О чем продолжим говорить?",
          meaning: "Men (ism)man, hozirgina tanishgandik) Nima haqida suhbatni davom ettiramiz?",
          note: "Ismni eslatish + savol"
        };
      }
    }

    // 3. "Nima haqida gaplashayotgandik?" / "О чем мы говорили?" / "Что ты сказал?"
    if (/о чем мы говорили|о чем речь|что ты сказал|на чем остановились|what were we talking about|nima haqida gaplashayotgandik/i.test(lower)) {
      const lastFewTurns = this.history.slice(-4);
      if (lastFewTurns.length > 0) {
        const lastTurn = lastFewTurns[lastFewTurns.length - 1];
        if (currentLanguage === 'en') {
          return {
            text: `We were just talking about "${lastTurn.text}". What are your thoughts on that?`,
            meaning: `Hozirgina "${lastTurn.meaning || lastTurn.text}" haqida gaplashayotgandik. Bu borada nima deb o'ylaysan?`,
            note: "Mavzuni eslatish"
          };
        } else {
          return {
            text: `Мы как раз говорили о: "${lastTurn.text}". Что ты дальше думаешь по этому поводу?`,
            meaning: `Hozirgina "${lastTurn.meaning || lastTurn.text}" haqida gaplashayotgandik. Bu borada keyin nima deb o'ylaysan?`,
            note: "Mavzuni eslatish + savol"
          };
        }
      }
    }

    // 4. "Ilova haqida nima deganding?" / "Что за приложение?"
    if (/что за приложение|какое приложение|про приложение|what app/i.test(lower)) {
      if (currentLanguage === 'en') {
        return {
          text: "It's an intelligent conversational teleprompter app for live chats. Do you like tech and new apps?",
          meaning: "Bu jonli suhbatlar uchun aqlli yordamchi ilova. Yangi texnologiyalar va ilovalarni yoqtirasanmi?",
          note: "Ilovani tushuntirish"
        };
      } else {
        return {
          text: "Это умный суфлер для живого общения и знакомств. А ты вообще часто новые приложения тестируешь?",
          meaning: "Bu jonli muloqot va tanishuvlar uchun aqlli yordamchi. O'zing tez-tez yangi ilovalarni sinab turasanmi?",
          note: "Ilovani eslatish + savol"
        };
      }
    }

    // 5. Shahar yoki qayerlik ekanligi haqida takroriy so'rov
    if (/ты откуда|из какого города|где живешь|where are you from/i.test(lower) && this.history.length > 3) {
      if (currentLanguage === 'en') {
        return {
          text: "I live in (city). Have you ever been there?",
          meaning: "Men (shahar)da yashayman. U yerda biror marta bo'lganmisan?",
          note: "Shahar haqida"
        };
      } else {
        return {
          text: "Я из (город). А ты в моем городе бывал(а) когда-нибудь?",
          meaning: "Men (shahar)danman. O'zing mening shahrimda bo'lganmisan?",
          note: "Shahar haqida"
        };
      }
    }

    return null; // Tarixda maxsus fakt topilmadi, umumiy semantik ong davom ettiradi
  }

  // Suhbat bosqichini olish (qadamlar soni)
  getStepCount() {
    return Math.floor(this.history.length / 2) + 1;
  }

  // Tarixni tozalash (Yangi suhbat)
  reset() {
    this.history = [];
    this.facts = {
      partnerName: null,
      userName: "(имя)",
      partnerCity: null,
      partnerJob: null,
      partnerMood: null,
      lastUserQuestion: null,
      lastTopic: null,
      appTested: false
    };
  }

  // Tarixni qisqacha ko'rish (agar kerak bo'lsa)
  getAllTurns() {
    return [...this.history];
  }
}

// Global yagona instance
export const dialogueMemory = new DialogueMemoryService();
