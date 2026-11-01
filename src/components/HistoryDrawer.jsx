import React from 'react';
import { X, Trash2, Clock, MessageSquare } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history = [], onClearHistory, onSelectHistoryItem }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm h-full bg-dark-900 border-l border-dark-800 p-5 flex flex-col shadow-2xl animate-slide-left">
        {/* Sarlavha */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-lime" />
            <h3 className="text-sm font-bold text-white">Suhbatlar Tarixi</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-gray-300">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Tarixni tozalash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tarix ro'yxati */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Hozircha suhbatlar tarixi mavjud emas.</p>
              <p className="text-[11px] mt-1 text-gray-600">Suhbatdosh gapirishi bilan bu yerda saqlanadi.</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-dark-750 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-lime">
                    {item.langFlag} {item.langName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white group-hover:text-brand-lime transition-colors">
                  "{item.partnerSpeech}"
                </div>

                {item.partnerMeaning && (
                  <div className="text-[11px] text-brand-lilac bg-dark-900/60 p-2 rounded-xl border border-dark-800">
                    🇺🇿 {item.partnerMeaning}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

