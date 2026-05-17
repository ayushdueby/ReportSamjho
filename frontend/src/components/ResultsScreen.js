import FindingCard from './FindingCard';

export default function ResultsScreen({ data, language, onReset }) {
  const abnormalFindings = (data.findings || []).filter(
    (f) => f.status !== 'normal'
  );

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*ReportSamjho — Doctor ke liye Questions*\n\n` +
      (data.doctor_questions_summary || abnormalFindings
        .filter((f) => f.doctor_question)
        .map((f, i) => `${i + 1}. ${f.doctor_question}`)
        .join('\n'))
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Report<span className="text-[#1D9E75]">Samjho</span></h2>
            <p className="text-xs text-gray-400">Your report explained</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-[#1D9E75] rounded-full inline-block"></span>
          {(data.findings || []).length} parameters
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Overall Summary */}
        {data.overall_summary && (
          <div className="bg-[#1D9E75] text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Report Summary</p>
                <p className="text-base leading-relaxed">{data.overall_summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Legend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Status Guide</p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { label: 'Normal', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
              { label: 'Sl. Low', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
              { label: 'Low', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
              { label: 'Sl. High', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
              { label: 'High', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-lg py-1.5 px-1`}>
                <div className={`w-2 h-2 ${s.dot} rounded-full mx-auto mb-1`}></div>
                <p className="text-xs font-medium leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Finding Cards */}
        {(data.findings || []).map((finding, i) => (
          <FindingCard key={i} finding={finding} />
        ))}

        {/* Doctor Questions Block */}
        {abnormalFindings.some((f) => f.doctor_question) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Doctor se poochein</h3>
                <p className="text-xs text-gray-400">Questions to ask your doctor</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {abnormalFindings
                .filter((f) => f.doctor_question)
                .map((f, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{f.doctor_question}</p>
                  </div>
                ))}
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp pe share karein
            </button>
          </div>
        )}

        {/* Disclaimer Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Zaroori baat</p>
              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                Yeh explanation sirf educational purpose ke liye hai. Koi bhi health decision lene se pehle apne doctor se milein. Yeh medical advice nahi hai.
              </p>
            </div>
          </div>
        </div>

        {/* Analyse Another */}
        <button
          onClick={onReset}
          className="w-full bg-white border-2 border-[#1D9E75] text-[#1D9E75] rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#e8f7f3] active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Doosri report analyse karein
        </button>

        <div className="pb-4" />
      </div>
    </div>
  );
}
