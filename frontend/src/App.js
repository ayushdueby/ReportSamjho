import { useState } from 'react';
import HomePage from './components/HomePage';
import UploadScreen from './components/UploadScreen';
import ResultsScreen from './components/ResultsScreen';
import Disclaimer from './components/Disclaimer';
import PaywallModal from './components/PaywallModal';
import useUsageTracker from './hooks/useUsageTracker';

export default function App() {
  const [screen, setScreen]       = useState('home');
  const [language, setLanguage]   = useState('english');
  const [uploadMode, setUploadMode] = useState('file');
  const [results, setResults]     = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const usage = useUsageTracker();

  const goToUpload = (mode) => {
    setUploadMode(mode);
    setScreen('upload');
  };

  const goToResults = (data) => {
    usage.recordUsage();
    setResults(data);
    setScreen('results');
  };

  const reset = () => {
    setResults(null);
    setScreen('home');
  };

  const handlePaywallSuccess = () => {
    usage.markPaid();
    setShowPaywall(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclaimer />

      {screen === 'home' && (
        <HomePage
          language={language}
          setLanguage={setLanguage}
          onUpload={() => goToUpload('file')}
          onType={() => goToUpload('text')}
          usage={usage}
        />
      )}
      {screen === 'upload' && (
        <UploadScreen
          mode={uploadMode}
          language={language}
          setLanguage={setLanguage}
          onResults={goToResults}
          onBack={() => setScreen('home')}
          usage={usage}
          onPaywall={() => setShowPaywall(true)}
        />
      )}
      {screen === 'results' && results && (
        <ResultsScreen
          data={results}
          language={language}
          onReset={reset}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onSuccess={handlePaywallSuccess}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
