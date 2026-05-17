import { useState } from 'react';
import HomePage from './components/HomePage';
import UploadScreen from './components/UploadScreen';
import ResultsScreen from './components/ResultsScreen';
import Disclaimer from './components/Disclaimer';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | upload | results
  const [language, setLanguage] = useState('english');
  const [uploadMode, setUploadMode] = useState('file'); // file | text
  const [results, setResults] = useState(null);

  const goToUpload = (mode) => {
    setUploadMode(mode);
    setScreen('upload');
  };

  const goToResults = (data) => {
    setResults(data);
    setScreen('results');
  };

  const reset = () => {
    setResults(null);
    setScreen('home');
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
        />
      )}
      {screen === 'upload' && (
        <UploadScreen
          mode={uploadMode}
          language={language}
          setLanguage={setLanguage}
          onResults={goToResults}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'results' && results && (
        <ResultsScreen
          data={results}
          language={language}
          onReset={reset}
        />
      )}
    </div>
  );
}
