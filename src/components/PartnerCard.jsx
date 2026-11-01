import React from 'react';
import { Ear, Languages, Clock } from 'lucide-react';

export default function PartnerCard({
  partnerSpeech,
  interimSpeech,
  partnerMeaning,
  detectedLanguage,
  timestamp,
  partnerGender
}) {
  const hasText = (partnerSpeech && partnerSpeech.trim().length > 0) || (interimSpeech && interimSpeech.trim().length > 0);

  return (
    <div className="w-full rounded-3xl bg-dark-850/80 border border-dark-700/70 p-4 shadow-xl backdrop-blur-md transition-all">
      {/* Karta boshi */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
            <Ear className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-300">
            Suhbatdoshingiz {partnerGender === 'female' ? '(Ayol)' : '(Erkak)'}
          </span>
        </div>

        {/* Til belgisi */}
        {detectedLanguage && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-dark-750 text-[11px] font-medium text-gray-300 border border-dark-600/50">
            <span>{detectedLanguage.flag}</span>
            <span>{detectedLanguage.name}</span>
          </div>
        )}
      </div>

      {/* Matn maydoni */}
      <div className="min-h-[64px] flex flex-col justify-center">
        {hasText ? (
          <div>
            {/* Asl nutq */}
            <p className="text-lg font-semibold text-white tracking-normal leading-snug">
              {partnerSpeech}
              {interimSpeech && (
                <span className="text-gray-400 italic font-normal"> {interimSpeech}...</span>
              )}
            </p>

            {/* O'zbekcha ma'nosi (Tagida doim chiqib turadi!) */}
            {partnerMeaning && (
              <div className="mt-2 pt-2 border-t border-dark-700/50 flex items-start gap-1.5 text-xs text-brand-lilac bg-brand-purple/5 p-2 rounded-xl border border-brand-purple/15">
                <span className="font-semibold text-brand-purple shrink-0">🇺🇿 Ma’nosi:</span>
                <span className="text-gray-200">{partnerMeaning}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
              <span>Suhbatdoshingiz gapirishi bilan matn va ma’nosi bu yerda aks etadi</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              (Mikrofon yoqilganda har qanday chet tili avtomatik aniqlanadi)
            </p>
          </div>
        )}
      </div>

      {timestamp && (
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{timestamp}</span>
        </div>
      )}
    </div>
  );
}

