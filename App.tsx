
import React, { useState } from 'react';
import Logo from './components/Logo';
import FeedbackForm from './components/FeedbackForm';
import VoiceCapture from './components/VoiceCapture';
import ResultDisplay from './components/ResultDisplay';
import { AppState, GuestInfo } from './types';
import { generateHumanizedFeedback } from './services/geminiService';
import { Loader2, AlertCircle, RefreshCcw, Home, MessageSquare, CheckCircle } from 'lucide-react';

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
      setState(AppState.PROCESSING); 
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

  const currentStep = () => {
    if (state === AppState.IDLE) return 1;
    if (state === AppState.RECORDING) return 2;
    if (state === AppState.PROCESSING || state === AppState.RESULT) return 3;
    return 1;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-thv-orange selection:text-white">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-thv-brown via-thv-gold to-thv-orange z-50"></div>
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-thv-gold/5 rounded-full blur-3xl"></div>
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-thv-orange/5 rounded-full blur-3xl"></div>

      <header className="w-full py-8 px-6 flex flex-col items-center border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-thv-brown uppercase">Guest Studio</h1>
              <p className="text-[10px] text-thv-gold uppercase font-semibold tracking-widest">THV Hospitality Tools</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <nav className="flex items-center gap-2">
            <div className={`flex items-center gap-2 transition-all ${currentStep() >= 1 ? 'text-thv-orange' : 'text-gray-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${currentStep() >= 1 ? 'border-thv-orange bg-thv-orange text-white' : 'border-gray-200'}`}>1</div>
              <span className="text-[11px] font-bold uppercase tracking-wider hidden xs:block">Details</span>
            </div>
            <div className={`w-8 h-[2px] rounded-full ${currentStep() >= 2 ? 'bg-thv-orange' : 'bg-gray-100'}`}></div>
            <div className={`flex items-center gap-2 transition-all ${currentStep() >= 2 ? 'text-thv-orange' : 'text-gray-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${currentStep() >= 2 ? 'border-thv-orange bg-thv-orange text-white' : 'border-gray-200'}`}>2</div>
              <span className="text-[11px] font-bold uppercase tracking-wider hidden xs:block">Voice</span>
            </div>
            <div className={`w-8 h-[2px] rounded-full ${currentStep() >= 3 ? 'bg-thv-orange' : 'bg-gray-100'}`}></div>
            <div className={`flex items-center gap-2 transition-all ${currentStep() >= 3 ? 'text-thv-orange' : 'text-gray-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${currentStep() >= 3 ? 'border-thv-orange bg-thv-orange text-white' : 'border-gray-200'}`}>3</div>
              <span className="text-[11px] font-bold uppercase tracking-wider hidden xs:block">Review</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl glass-card rounded-[40px] shadow-2xl shadow-thv-brown/5 p-8 sm:p-12 flex flex-col items-center animate-slideUp">
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
            <div
              className="flex flex-col items-center space-y-8 text-center py-12"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full border border-thv-gold/20 animate-pulse absolute -inset-4"></div>
                <div className="w-24 h-24 rounded-full border-b-2 border-thv-orange animate-spin flex items-center justify-center">
                  <Logo size="sm" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-thv-brown">Humanizing Your Review</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Our intelligence is capturing the nuance of your voice to craft a natural, authentic review.
                </p>
                <span className="sr-only">Processing your feedback...</span>
              </div>
            </div>
          )}

          {state === AppState.PROCESSING && error && (
            <div className="flex flex-col items-center space-y-8 text-center max-w-md py-12">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-red-700">Generation Interrupted</h3>
                <div className="text-sm text-gray-600 bg-red-50/50 p-6 rounded-3xl border border-red-100 leading-relaxed font-medium">
                  {error}
                </div>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center gap-3 bg-thv-brown hover:bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-thv-brown/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCcw size={20} />
                  Retry Generation
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setState(AppState.RECORDING);
                  }}
                  className="w-full text-thv-gold hover:text-thv-brown font-bold text-sm tracking-widest uppercase py-2 transition"
                >
                  Back to Mic
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
        </div>
      </main>

      <footer className="py-12 flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Subtle decorative icons or brand elements */}
           <div className="w-8 h-[1px] bg-thv-gold"></div>
           <Logo size="sm" />
           <div className="w-8 h-[1px] bg-thv-gold"></div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-thv-gold uppercase font-bold tracking-[0.2em]">
            &copy; {new Date().getFullYear()} THV Hospitality Group
          </p>
          <p className="text-[9px] text-gray-400 font-medium">
            AI Crafting Authenticity in Guest Experience
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
