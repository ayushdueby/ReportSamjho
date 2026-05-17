import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import LanguageSelector from './LanguageSelector';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function UploadScreen({ mode, language, setLanguage, onResults, onBack, usage, onPaywall }) {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(mode); // 'file' | 'text'

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') setError('File 10MB se badi hai. Chota file upload karein.');
      else setError('Sirf JPG, PNG, ya PDF files allowed hain.');
      return;
    }
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyse = async () => {
    if (usage && usage.isLimitHit) { onPaywall(); return; }
    setError('');
    setLoading(true);

    try {
      let response;
      if (activeTab === 'file') {
        if (!file) { setError('Pehle ek file choose karein.'); setLoading(false); return; }
        const formData = new FormData();
        formData.append('report', file);
        formData.append('language', language);
        response = await axios.post(`${API_BASE}/api/analyse-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        });
      } else {
        if (!textInput.trim()) { setError('Kuch values type karein, phir analyse karein.'); setLoading(false); return; }
        response = await axios.post(`${API_BASE}/api/analyse`, {
          reportText: textInput,
          language,
        }, { timeout: 60000 });
      }

      if (response.data.success) {
        onResults(response.data.data);
      } else {
        setError('Analysis fail ho gayi. Dobara try karein.');
      }
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'PARSE_ERROR') {
        setError('Hum is report ko samajh nahi paaye — kya aap values manually type kar sakte hain?');
      } else if (code === 'PDF_TOO_LONG') {
        setError(err.response?.data?.message || 'PDF 3 pages se zyada hai. Chhota PDF upload karein.');
      } else if (code === 'UNSUPPORTED_FILE_TYPE') {
        setError('Sirf JPG, PNG, ya PDF upload karein.');
      } else if (code === 'FILE_TOO_LARGE') {
        setError('File bahut badi hai. 10MB se choti file upload karein.');
      } else if (code === 'AUTH_ERROR') {
        setError('API configuration error. Please contact support.');
      } else if (code === 'RATE_LIMIT') {
        setError('Bahut saare requests hain. Thodi der baad try karein.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout ho gayi. Dobara try karein.');
      } else {
        setError('Kuch gadbad ho gayi. Dobara try karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Report<span className="text-[#1D9E75]">Samjho</span></h2>
          <p className="text-xs text-gray-400">Upload or type your report</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        {/* Language */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Explanation language / भाषा</p>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'file' ? 'bg-white text-[#1D9E75] shadow-sm' : 'text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'text' ? 'bg-white text-[#1D9E75] shadow-sm' : 'text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Type Values
          </button>
        </div>

        {/* File Upload */}
        {activeTab === 'file' && (
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-[#1D9E75] bg-[#e8f7f3]'
                  : file
                  ? 'border-[#1D9E75] bg-[#e8f7f3]'
                  : 'border-gray-200 bg-white hover:border-[#1D9E75] hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  <p className="text-xs text-[#1D9E75] font-medium">Tap to change file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      {isDragActive ? 'Drop karo yahan...' : 'Photo ya PDF upload karein'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Tap to browse • JPG, PNG, PDF • Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Input */}
        {activeTab === 'text' && (
          <div>
            <textarea
              className="w-full border border-gray-200 rounded-2xl p-4 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 resize-none bg-white"
              rows={8}
              placeholder={`Values yahan type karein...\n\nExample:\nHemoglobin: 11.2 g/dL\nTSH: 6.2 mIU/L\nBlood Sugar (Fasting): 108 mg/dL\nTotal Cholesterol: 210 mg/dL`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2 px-1">
              Aap apni report se values copy-paste bhi kar sakte hain
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className={`w-full mt-6 py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#1D9E75] hover:bg-[#178a64] active:scale-95 shadow-md'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Samajh rahe hain...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analyse Report
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-sm text-gray-400 mt-3">
            AI aapki report padh raha hai... thoda wait karein
          </p>
        )}

        {usage && !usage.paid && (
          <p className="text-center text-xs text-gray-400 mt-3">
            {usage.remaining > 0
              ? `${usage.remaining} free ${usage.remaining === 1 ? 'analysis' : 'analyses'} remaining`
              : 'Free limit reached — unlock for ₹99'}
          </p>
        )}
      </div>
    </div>
  );
}
