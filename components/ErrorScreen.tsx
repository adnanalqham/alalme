import React from 'react';

interface Props {
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<Props> = ({ onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

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

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur p-3 mb-6">
          <img
            src="/logo.png"
            alt="العالمي لقطع غيار السيارات"
            className="w-full h-full object-contain opacity-90"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          تعذر تحميل التطبيق
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          تحقق من اتصال الإنترنت وحاول مرة أخرى.
        </p>

        <button
          onClick={handleRetry}
          className="w-full py-3 px-6 bg-[#FCF1D0] hover:bg-[#ebdcae] active:scale-[0.98] text-[#010736] font-bold text-sm rounded-xl transition shadow-lg shadow-black/20 cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
