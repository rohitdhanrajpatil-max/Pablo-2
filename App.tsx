
import React, { useState } from 'react';
import Logo from './components/Logo';
import FeedbackForm from './components/FeedbackForm';
import VoiceCapture from './components/VoiceCapture';
import ResultDisplay from './components/ResultDisplay';
import { AppState, GuestInfo } from './types';
import { generateHumanizedFeedback } from './services/geminiService';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    hotelName: '',
    mobile: '',
    nightsStay: 0
  });
  const [lastTranscript, setLastTranscript] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartVoice = () => {
    setError(null);
    setState(AppState.RECORDING);
  };
  
  const processFeedback = async (transcript: string) => {
    setState(AppState.PROCESSING);
    setError(null);
    setLastTranscript(transcript);
    try {
      const review = await generateHumanizedFeedback(transcript, guestInfo);
      setGeneratedReview(review);
      setState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setState(AppState.PROCESSING); // Remain in processing state to show error and retry within same context
    }
  };

  const handleRetry = () => {
    if (lastTranscript) {
      processFeedback(lastTranscript);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setGeneratedReview('');
    setLastTranscript('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-16">
      {/* Brand Header */}
      <div className="mb-12 flex flex-col items-center animate-fadeIn">
        <Logo size="md" />
        <h1 className="mt-6 text-3xl font-bold text-thv-brown tracking-tight">THV GUEST TOOLS</h1>
        <p className="text-thv-orange font-medium">Feedback Reimagined</p>
      </div>

      {/* Content Area */}
      <main className="w-full flex flex-col items-center">
        {state === AppState.IDLE && (
          <FeedbackForm 
            info={guestInfo} 
            setInfo={setGuestInfo} 
            onNext={handleStartVoice} 
          />
        )}

        {state === AppState.RECORDING && (
          <VoiceCapture 
            onCapture={processFeedback} 
            onBack={() => setState(AppState.IDLE)} 
          />
        )}

        {state === AppState.PROCESSING && !error && (
          <div className="flex flex-col items-center space-y-6 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full border-4 border-thv-orange border-t-transparent animate-spin flex items-center justify-center">
              <Loader2 className="text-thv-orange" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-thv-brown">Humanizing Your Review...</h3>
              <p className="text-gray-500 max-w-xs mt-2">
                Our AI is crafting a natural and professional version of your feedback.
              </p>
            </div>
          </div>
        )}

        {state === AppState.PROCESSING && error && (
          <div className="flex flex-col items-center space-y-6 text-center animate-fadeIn max-w-md w-full">
            <div className="p-4 bg-red-50 rounded-full">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-700">Generation Failed</h3>
              <p className="text-gray-600 text-sm bg-white p-4 rounded-xl border border-red-100 shadow-sm leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-thv-brown hover:bg-black text-white py-4 rounded-xl font-semibold shadow-lg transition active:scale-[0.98]"
              >
                <RefreshCcw size={18} />
                Try to Regenerate
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setState(AppState.RECORDING);
                }}
                className="w-full text-gray-500 hover:text-thv-brown font-medium transition py-2"
              >
                Back to Voice Recorder
              </button>
            </div>
          </div>
        )}

        {state === AppState.RESULT && (
          <ResultDisplay 
            review={generatedReview} 
            info={guestInfo} 
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} THV Group. Powered by Gemini AI.
      </footer>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
