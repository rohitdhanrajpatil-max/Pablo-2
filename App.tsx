
import React, { useState } from 'react';
import Logo from './components/Logo';
import FeedbackForm from './components/FeedbackForm';
import VoiceCapture from './components/VoiceCapture';
import ResultDisplay from './components/ResultDisplay';
import { AppState, GuestInfo } from './types';
import { generateHumanizedFeedback } from './services/geminiService';
// Added MessageSquare and Home to the lucide-react import list to fix compilation errors
import { Loader2, AlertCircle, RefreshCcw, WifiOff, ShieldAlert, Zap, SearchX, ArrowRight, HelpCircle, MessageSquare, Home } from 'lucide-react';

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

  const getErrorDiagnostics = (msg: string) => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("internet") || lowerMsg.includes("network") || lowerMsg.includes("offline")) {
      return {
        icon: <WifiOff className="text-orange-500" />,
        title: "Connection Issue",
        suggestions: [
          "Check if your Wi-Fi or mobile data is active.",
          "Disable any VPNs that might interfere with the connection.",
          "Try switching from Wi-Fi to mobile data (or vice versa)."
        ]
      };
    }
    if (lowerMsg.includes("403") || lowerMsg.includes("access denied") || lowerMsg.includes("permission")) {
      return {
        icon: <ShieldAlert className="text-red-500" />,
        title: "Access Restricted",
        suggestions: [
          "The API key may have reached its usage limit or is restricted.",
          "Ensure you are in a supported region for Gemini AI.",
          "Refresh the application to re-authenticate the session."
        ]
      };
    }
    if (lowerMsg.includes("429") || lowerMsg.includes("rate limit") || lowerMsg.includes("busy")) {
      return {
        icon: <Zap className="text-blue-500" />,
        title: "System Congestion",
        suggestions: [
          "The AI servers are currently busy. Wait 30 seconds and try again.",
          "Too many attempts in a short time. Please take a brief pause.",
          "Try reducing the length of the verbal input slightly."
        ]
      };
    }
    if (lowerMsg.includes("empty response") || lowerMsg.includes("safety") || lowerMsg.includes("filter")) {
      return {
        icon: <SearchX className="text-purple-500" />,
        title: "Content Review Needed",
        suggestions: [
          "The AI couldn't generate a response. Try rephrasing your feedback.",
          "Avoid sensitive or restricted topics in your verbal notes.",
          "Speak a few more sentences to provide better context for the AI."
        ]
      };
    }
    return {
      icon: <HelpCircle className="text-gray-500" />,
      title: "Unexpected Error",
      suggestions: [
        "Click the retry button below to try generating again.",
        "Go back to the recording step and try speaking again.",
        "Restart the process if the issue persists."
      ]
    };
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
            <Logo size="sm" aria-hidden="true" />
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
            <div className="flex flex-col items-center space-y-8 text-center py-12" role="status" aria-live="polite">
              <span className="sr-only">Processing your review...</span>
              <div className="relative">
                <div className="w-32 h-32 rounded-full border border-thv-gold/20 animate-pulse absolute -inset-4"></div>
                <div className="w-24 h-24 rounded-full border-b-2 border-thv-orange animate-spin flex items-center justify-center">
                  <Logo size="sm" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-thv-brown">Humanizing Your Review</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Our intelligence is capturing the nuance of your voice to craft a natural, authentic review.
                </p>
              </div>
            </div>
          )}

          {state === AppState.PROCESSING && error && (
            <div className="w-full max-w-xl flex flex-col items-center space-y-8 py-4 animate-slideUp">
              {/* Header Icon */}
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm relative">
                <AlertCircle size={40} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-red-100">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                </div>
              </div>

              <div className="text-center space-y-4 w-full">
                <h3 className="text-3xl font-bold text-red-700 tracking-tight">Generation Interrupted</h3>
                
                {/* Main Error Box */}
                <div className="bg-red-50/30 p-8 rounded-[32px] border border-red-100 text-left space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0">
                      {getErrorDiagnostics(error).icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 mb-1">{getErrorDiagnostics(error).title}</h4>
                      <p className="text-sm text-red-700/80 font-medium leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>

                  {/* Troubleshooting Guide */}
                  <div className="space-y-4 pt-4 border-t border-red-100/50">
                    <p className="text-[10px] font-bold text-thv-gold uppercase tracking-widest px-1">Potential Solutions:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {getErrorDiagnostics(error).suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-red-50 hover:bg-white transition-colors">
                          <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] flex items-center justify-center font-bold shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-xs text-gray-700 font-medium">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-3 bg-thv-brown hover:bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-thv-brown/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCcw size={20} />
                  Retry Generation
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setState(AppState.RECORDING);
                  }}
                  className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-100 text-thv-gold hover:text-thv-brown py-5 rounded-2xl font-bold shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
                >
                  <MessageSquare size={20} />
                  Re-record Audio
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-thv-brown font-bold text-xs tracking-widest uppercase py-2 transition flex items-center gap-2"
              >
                <Home size={14} />
                Return to Home
              </button>
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
           <Logo size="sm" aria-hidden="true" />
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
