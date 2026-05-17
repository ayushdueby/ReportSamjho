import { useState } from 'react';

const STATUS_CONFIG = {
  normal: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
    border: 'border-l-green-400',
    label: 'Normal',
    icon: '✓',
    iconBg: 'bg-green-50 text-green-600',
  },
  slightly_high: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
    border: 'border-l-amber-400',
    label: 'Slightly High',
    icon: '↑',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  high: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    border: 'border-l-red-400',
    label: 'High',
    icon: '↑↑',
    iconBg: 'bg-red-50 text-red-600',
  },
  slightly_low: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
    border: 'border-l-amber-400',
    label: 'Slightly Low',
    icon: '↓',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  low: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    border: 'border-l-red-400',
    label: 'Low',
    icon: '↓↓',
    iconBg: 'bg-red-50 text-red-600',
  },
};

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(finding.status !== 'normal');
  const cfg = STATUS_CONFIG[finding.status] || STATUS_CONFIG.normal;
  const isAbnormal = finding.status !== 'normal';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${cfg.border} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        className="w-full text-left px-5 py-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {finding.parameter_name_en}
              </h3>
              {finding.parameter_name_local &&
                finding.parameter_name_local !== finding.parameter_name_en && (
                <span className="text-sm text-gray-400 font-medium">
                  {finding.parameter_name_local}
                </span>
              )}
            </div>
            {/* Value row */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-xl font-bold text-gray-900">
                {finding.value}
                {finding.unit && <span className="text-sm font-medium text-gray-400 ml-1">{finding.unit}</span>}
              </span>
              {finding.reference_range && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  Ref: {finding.reference_range}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
              {cfg.label}
            </span>
            {/* Expand chevron */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
          {/* Explanation */}
          {finding.explanation && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Iska matlab kya hai
              </p>
              <p className="text-gray-700 text-base leading-relaxed">{finding.explanation}</p>
            </div>
          )}

          {/* Lifestyle tips — only for abnormal */}
          {isAbnormal && finding.lifestyle_tips && finding.lifestyle_tips.length > 0 && (
            <div className="bg-[#e8f7f3] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Aap kya kar sakte hain
              </p>
              <ul className="space-y-2">
                {finding.lifestyle_tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-relaxed">
                    <span className="w-5 h-5 bg-[#1D9E75] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor question — only for abnormal */}
          {isAbnormal && finding.doctor_question && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-1">Doctor se poochein</p>
                <p className="text-sm text-blue-800 leading-relaxed">{finding.doctor_question}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
