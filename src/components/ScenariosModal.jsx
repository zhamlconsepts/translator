import React from 'react';
import { X, Heart, Briefcase, Coffee, Sparkles, Compass } from 'lucide-react';

export default function ScenariosModal({ isOpen, onClose, onSelectScenario }) {
  if (!isOpen) return null;

  const scenarios = [
    {
      category: "💘 Uchrashuv & Flirt (Situationship)",
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      items: [
        { text: "Ты сегодня потрясающе выглядишь!", desc: "Chiroyli ko'rinishiga maqtov aytish" },
        { text: "Чем ты обычно любишь заниматься в свободное время?", desc: "Qiziqishlari haqida so'rash" },
        { text: "Ты свободна сегодня вечером? Пойдем поужинаем?", desc: "Kechki ovqatga taklif qilish" },
        { text: "Мне очень приятно проводить время с тобой.", desc: "Yoqimli taassurot bildirish" }
      ]
    },
    {
      category: "☕ Kundalik Suhbat & Qahvaxona",
      icon: <Coffee className="w-4 h-4 text-amber-400" />,
      items: [
        { text: "Привет! Как твои дела сегодня?", desc: "Oddiy do'stona hol-ahvol so'rash" },
        { text: "Какой кофе ты больше любишь?", desc: "Kofe didi haqida suhbat" },
        { text: "Как прошел твой рабочий день?", desc: "Kun qanday o'tganini surishtirish" }
      ]
    },
    {
      category: "💼 Ish & Suhbat (Business)",
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      items: [
        { text: "Здравствуйте! Рад познакомиться с вами.", desc: "Rasmiy salomlashish" },
        { text: "Расскажите подробнее о ваших планах и проекте.", desc: "Loyiha tafsilotlarini so'rash" },
        { text: "Давайте согласуем удобное время для следующей встречи.", desc: "Keyingi uchrashuv vaqtini belgilash" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Sarlavha */}
        <div className="sticky top-0 bg-dark-900/90 backdrop-blur-md pb-3 flex items-center justify-between border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Suhbat Ssenariylari</h3>
              <p className="text-[11px] text-gray-400">Kerakli vaziyatni tanlang va bir zumda tayyorlaning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kategoriyalar ro'yxati */}
        <div className="mt-4 space-y-4">
          {scenarios.map((scen, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                {scen.icon}
                <span>{scen.category}</span>
              </div>
              <div className="space-y-1.5">
                {scen.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => {
                      onSelectScenario(item.text);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-dark-800/80 hover:bg-dark-750 border border-dark-700/60 hover:border-brand-purple/40 transition-all group"
                  >
                    <div className="text-sm font-semibold text-white group-hover:text-brand-lime transition-colors">
                      {item.text}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

