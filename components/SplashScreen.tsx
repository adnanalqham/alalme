import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#010736] flex flex-col items-center justify-center p-6 text-center select-none"
      dir="rtl"
      style={{ fontFamily: 'Thmanyah Sans, -apple-system, sans-serif' }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22396F]/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Brand Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur p-4">
            <img
              src="/logo.png"
              alt="العالمي لقطع غيار السيارات"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#FCF1D0] tracking-tight mb-2">
          العالمي
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide mb-8">
          المنصة الشاملة لقطع غيار السيارات
        </p>

        {/* Minimal Loading Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#FCF1D0]/20 border-t-[#FCF1D0] rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
