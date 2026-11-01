/**
 * Gemini AI Cloud Brain Service (Ixtiyoriy chuqur intellekt)
 * Agar foydalanuvchi API kalit kiritgan bo'lsa, javoblar to'g'ridan-to'g'ri Gemini modelidan olinadi.
 * Kalit kiritilmagan bo'lsa, 0-ms tezkorlikdagi ichki aqlli ong (Local Engine) ishlaydi.
 */

import { toPhonetic } from './conversationEngine';

export async function generateGeminiResponses({ apiKey, partnerSpeech, userGender, partnerGender, tone = 'friendly' }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API kaliti kiritilmagan");
  }

  const userGenderText = userGender === 'female' ? "Ayol kishi (o'zini ayol sifatida ifodalaydi: masalan 'я рада', 'я поняла')" : "Erkak kishi (o'zini erkak sifatida ifodalaydi: masalan 'я рад', 'я понял')";
  const partnerGenderText = partnerGender === 'female' ? "Ayol kishi (unga chiroyli, muloyim murojaat)" : "Erkak kishi";

  const prompt = `
Sen "SuhbatDosh" ilovasisan — jonli suhbat prompteri.
Vazifang: Suhbatdosh aytgan gapga qarab, foydalanuvchiga ovoz chiqarib o'qib berishi uchun eng mukammal, tabiiy, zamonaviy va samimiy javob variantlarini tayyorlash.

Suhbatdosh aytgan gap: "${partnerSpeech}"
Foydalanuvchi jinsi: ${userGenderText}
Suhbatdosh jinsi: ${partnerGenderText}

Qat'iy qoidalar:
1. Suhbatdosh gapirgan tilni aniqla (odatda Rus tili yoki Ingliz tili).
2. O'sha tilda 4 xil ohangda javob tayyorla:
   - friendly: Do'stona, tabiiy, iliq
   - flirty: Qiziqarli, jozibali, suhbatni qizdiruvchi
   - formal: Rasmiy, odobli, hurmat bilan
   - short: Juda qisqa, londa (1-4 ta so'z)
3. HAR BIR JAVOB TAGIGA uning to'liq O'zbekcha tarjimasini (ma'nosini) yoz.
4. Foydalanuvchi jinsiga qat'iy rioya qil (rus tilida fe'l va sifat qo'shimchalari erkak yoki ayolga aniq moslashsin).
5. Javobni faqat toza JSON formatida qaytar:

{
  "detectedLanguage": "ru",
  "partnerMeaningUzbek": "Suhbatdosh gapining o'zbekcha ma'nosi",
  "options": [
    {
      "tone": "friendly",
      "toneName": "Do‘stona",
      "text": "Ruscha yoki chet tilidagi javob",
      "uzMeaning": "O'zbekcha ma'nosi"
    },
    {
      "tone": "flirty",
      "toneName": "Qiziqarli & Jonli",
      "text": "...",
      "uzMeaning": "..."
    },
    {
      "tone": "formal",
      "toneName": "Rasmiy",
      "text": "...",
      "uzMeaning": "..."
    },
    {
      "tone": "short",
      "toneName": "Qisqa & Londa",
      "text": "...",
      "uzMeaning": "..."
    }
  ]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini so'rovida xatolik: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini javob bermadi");

  const parsed = JSON.parse(rawText);

  // Talaffuz qo'shish
  const optionsWithPronunciation = (parsed.options || []).map((opt, i) => ({
    id: `gemini-opt-${i}-${Date.now()}`,
    tone: opt.tone,
    toneName: opt.toneName,
    text: opt.text,
    uzMeaning: opt.uzMeaning,
    pronunciation: `[${toPhonetic(opt.text)}]`
  }));

  return {
    detectedLanguage: {
      code: parsed.detectedLanguage || 'ru',
      name: parsed.detectedLanguage === 'en' ? 'Ingliz tili' : 'Rus tili',
      flag: parsed.detectedLanguage === 'en' ? '🇬🇧' : '🇷🇺'
    },
    partnerMeaning: parsed.partnerMeaningUzbek || "Suhbatdosh gapi",
    options: optionsWithPronunciation
  };
}

