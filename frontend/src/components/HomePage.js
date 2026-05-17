import LanguageSelector from './LanguageSelector';

export default function HomePage({ language, setLanguage, onUpload, onType, usage }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Logo / Brand */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#1D9E75] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Report<span className="text-[#1D9E75]">Samjho</span>
          </h1>
          <p className="mt-2 text-lg text-gray-500 font-medium">
            Apni report samjhein, apni bhasha mein
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Understand your medical report in your language
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-8 w-full max-w-sm">
          <p className="text-sm text-gray-500 mb-3 font-medium">Choose your language / भाषा चुनें</p>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={onUpload}
            className="w-full flex items-center justify-center gap-3 bg-[#1D9E75] text-white rounded-2xl py-4 px-6 text-lg font-semibold shadow-md hover:bg-[#178a64] active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Report Photo / PDF
          </button>

          <button
            onClick={onType}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#1D9E75] border-2 border-[#1D9E75] rounded-2xl py-4 px-6 text-lg font-semibold hover:bg-[#e8f7f3] active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Type Values Manually
          </button>
        </div>

        {/* Usage badge */}
        {usage && (
          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            usage.paid
              ? 'bg-[#e8f7f3] text-[#1D9E75]'
              : usage.remaining === 0
              ? 'bg-red-50 text-red-600'
              : 'bg-amber-50 text-amber-700'
          }`}>
            {usage.paid ? (
              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> Unlimited access</>
            ) : usage.remaining === 0 ? (
              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg> Free limit reached — Unlock for ₹99</>
            ) : (
              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg> {usage.remaining} free {usage.remaining === 1 ? 'analysis' : 'analyses'} left</>
            )}
          </div>
        )}

        {/* Trust signals */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Data not stored
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Educational only
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Powered by Claude AI
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-gray-300">
        Always consult your doctor for medical decisions
      </div>
    </div>
  );
}
