/**
 * Gemini AI Cloud Brain Service (Cheksiz Intellekt)
 * 
 * Har qanday vaziyatda, bahsda, qora yumorda, kutilmagan gaplarda
 * mukammal, o'tkir va yengilmas javoblar qaytaradi.
 */

import { toPhonetic } from './conversationEngine.js';
import { generateMultilingualResponse } from './multilingualBrain.js';
import { dialogueMemory } from './dialogueMemory.js';

export async function generateGeminiSuperResponse({ apiKey, partnerSpeech, selectedIndex = 0, isJokeRequested = false }) {
  if (!apiKey || !apiKey.trim()) {
    return generateMultilingualResponse(partnerSpeech, selectedIndex, isJokeRequested);
  }

  const clean = partnerSpeech.trim();
  const historyTurns = dialogueMemory.getAllTurns().slice(-6);
  const historySummary = historyTurns.map(t => `${t.speaker === 'partner' ? 'Suhbatdosh' : 'Foydalanuvchi'}: "${t.text}"`).join('\n');

  const systemPrompt = `
Sen "SuhbatDosh" ilovasining eng o'tkir, aqlli, yengilmas AI ongisan.
Foydalanuvchi suhbatdosh bilan real hayotda jonli gaplashmoqda.
Sening vazifang — suhbatdosh nima desa ham, foydalanuvchiga ovoz chiqarib aytishi uchun ENG ZO'R, MANTIQIY VA YENGILMAS javob tayyorlash.

Suhbatdosh gapi: "${clean}"
${historySummary ? `Oxirgi gaplar tarixi:\n${historySummary}` : ''}

QAT'IY QOIDALAR:
1. Til: Suhbatdosh qaysi tilda gapirsa (Rus, Ingliz, Turk, O'zbek va h.k.), javob variantlarini AYNAN O'SHA TILDA yoz!
2. Bahs va Haqorat: Agar suhbatdosh qo'pollik qilsa, kamsitsa yoki bahslashsa — uni aqlli sarkazm, o'tkir mantiq va qora yumor bilan bitta gapda MOT QIL, foydalanuvchi gapda 100% yutib chiqsin!
3. Oddiy savollarga: Faqat aniq, londa va ishonchli javob ber (ortiqcha sun'iy savollar ulamasdan).
4. Komplimentlarga: Chiroyli, jozibador javob qaytar va qiziqarli savol ber.
5. Jimlik / Qisqa so'zlarda: Suhbatni qizdiruvchi ajoyib mavzu savolini taklif qil.
6. Tarjima: HAR BIR javob tagiga uning to'liq O'ZBEKCHA ma'nosini yoz.
7. Shaxsiy joylar: agar shahar, ism, soha bo'lsa (город), (город), (name) kabi qavsda ko'rsat.

Faqat toza JSON formatida javob ber:
{
  "detectedLanguage": { "code": "ru", "name": "Rus tili", "flag": "🇷🇺" },
  "partnerMeaningUzbek": "Suhbatdosh gapining o'zbekcha tarjimasi",
  "variants": [
    {
      "text": "1-asosiy o'tkir javob",
      "meaning": "O'zbekcha to'liq ma'nosi",
      "note": "Aniq javob yoki Baxsda mot qilish"
    },
    {
      "text": "2-muqobil kuchli javob",
      "meaning": "O'zbekcha to'liq ma'nosi",
      "note": "Sovuqqon raddiya yoki Qisqa"
    }
  ],
  "joke": {
    "text": "Vaziyatga mos qora yumor yoki o'tkir hazil",
    "meaning": "Hazilning o'zbekcha ma'nosi",
    "note": "O'tkir hazil"
  }
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API xatoligi (${response.status}), mahalliy ong ishlatiladi.`);
      return generateMultilingualResponse(partnerSpeech, selectedIndex, isJokeRequested);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Gemini javob bermadi");

    const parsed = JSON.parse(rawText);

    const variants = (parsed.variants && parsed.variants.length > 0) ? parsed.variants : [
      { text: clean, meaning: clean, note: "Javob" }
    ];

    let chosenText = variants[0].text;
    let chosenMeaning = variants[0].meaning;
    let chosenNote = variants[0].note;

    if (isJokeRequested && parsed.joke) {
      chosenText = parsed.joke.text;
      chosenMeaning = parsed.joke.meaning;
      chosenNote = parsed.joke.note;
    } else if (selectedIndex < variants.length) {
      chosenText = variants[selectedIndex].text;
      chosenMeaning = variants[selectedIndex].meaning;
      chosenNote = variants[selectedIndex].note;
    }

    const pronunciation = toPhonetic(chosenText);

    return {
      partnerText: clean,
      partnerMeaning: parsed.partnerMeaningUzbek || "Suhbatdosh gapi",
      detectedLanguage: parsed.detectedLanguage || { code: 'ru', name: 'Rus tili', flag: '🇷🇺' },
      userResponse: chosenText,
      userMeaning: chosenMeaning,
      userPronunciation: `[${pronunciation}]`,
      userNote: chosenNote,
      isJoke: isJokeRequested,
      allVariants: variants,
      currentVariantIndex: selectedIndex % variants.length,
      totalVariants: variants.length,
      stepCount: dialogueMemory.getStepCount(),
      isGemini: true
    };
  } catch (err) {
    console.warn("Gemini so'rovi amalga oshmadi, mahalliy aqlli ong ishlatiladi:", err);
    return generateMultilingualResponse(partnerSpeech, selectedIndex, isJokeRequested);
  }
}
