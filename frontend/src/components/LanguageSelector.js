const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'hindi',   label: 'हिंदी' },
  { code: 'tamil',   label: 'தமிழ்' },
  { code: 'telugu',  label: 'తెలుగు' },
  { code: 'bengali', label: 'বাংলা' },
];

export default function LanguageSelector({ value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            value === lang.code
              ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#1D9E75] hover:text-[#1D9E75]'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
