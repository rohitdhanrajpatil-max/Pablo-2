
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, RefreshCw, Lock, XCircle, Globe, ChevronDown } from 'lucide-react';

interface VoiceCaptureProps {
  onCapture: (transcript: string) => void;
  onBack: () => void;
}

const LANGUAGES = [
  { name: 'English', code: 'en-US' },
  { name: 'Spanish', code: 'es-ES' },
  { name: 'French', code: 'fr-FR' },
  { name: 'German', code: 'de-DE' },
  { name: 'Italian', code: 'it-IT' },
  { name: 'Portuguese', code: 'pt-BR' },
  { name: 'Hindi', code: 'hi-IN' },
  { name: 'Chinese', code: 'zh-CN' },
  { name: 'Japanese', code: 'ja-JP' },
  { name: 'Arabic', code: 'ar-SA' },
];

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onCapture, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [isSilent, setIsSilent] = useState(true);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [permissionError, setPermissionError] = useState<{
    title: string;
    message: string;
    type: 'denied' | 'unsupported' | 'other';
  } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Speech Recognition when language changes
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang.code;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setPermissionError({
            title: "Microphone Access Blocked",
            message: "It looks like microphone access is blocked. Please click the lock icon in the address bar to allow it.",
            type: 'denied'
          });
        }
        stopAll();
      };

      recognition.onend = () => {
        setIsListening(prev => prev ? false : prev);
      };

      recognitionRef.current = recognition;
    } else {
      setPermissionError({
        title: "Browser Not Supported",
        message: "Your browser does not support voice input. Please try Chrome or Safari.",
        type: 'unsupported'
      });
    }

    return () => {
      stopAll();
    };
  }, [selectedLang]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < bufferLength; i++) values += dataArray[i];
        const average = values / bufferLength;
        setVolume(Math.min(100, Math.round((average / 128) * 100)));
        setIsSilent(average < 10);
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (err: any) {
      setPermissionError({
        title: "Microphone Error",
        message: "Could not access your microphone. Please check your settings.",
        type: 'denied'
      });
      return false;
    }
  };

  const stopAll = () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {}
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) try { audioContextRef.current.close(); } catch (e) {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsListening(false);
    setVolume(0);
  };

  const toggleListening = async () => {
    if (isListening) {
      stopAll();
    } else {
      setTranscript('');
      setPermissionError(null);
      const hasPermission = await startAudioAnalysis();
      if (hasPermission) {
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleFinish = () => {
    if (transcript.trim().length > 5) {
      stopAll();
      onCapture(transcript);
    } else {
      alert("Please speak a bit more so we can capture your thoughts.");
    }
  };

  const buttonScale = isListening ? 1 + (volume / 600) : 1;

  if (permissionError) {
    return (
      <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-slideUp py-8">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
           {permissionError.type === 'denied' ? <Lock size={40} /> : <XCircle size={40} />}
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-thv-brown">{permissionError.title}</h2>
          <p className="text-gray-600 text-sm bg-white p-6 rounded-3xl border border-gray-100">{permissionError.message}</p>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <button onClick={onBack} className="w-full text-thv-gold font-bold text-sm tracking-widest uppercase py-2">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-thv-brown tracking-tight">Voice Studio</h2>
        <p className="text-gray-400 text-sm font-medium">Record in your language. We'll handle the rest.</p>
      </div>

      {/* Language Selector */}
      <div className="relative w-full max-w-[200px]">
        <button 
          disabled={isListening}
          onClick={() => setShowLangMenu(!showLangMenu)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${
            isListening ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-white border-gray-100 text-thv-brown hover:border-thv-gold shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Globe size={16} className={isListening ? 'text-gray-300' : 'text-thv-gold'} />
            <span className="text-xs font-bold uppercase tracking-wider truncate">{selectedLang.name}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
        </button>

        {showLangMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 max-h-[300px] overflow-y-auto animate-slideUp">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setSelectedLang(l);
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-thv-cream ${
                  selectedLang.code === l.code ? 'text-thv-orange bg-thv-orange/5' : 'text-gray-600'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <div className={`p-10 rounded-full border-4 z-10 transition-all duration-500 ${isListening ? 'border-thv-orange bg-white shadow-2xl shadow-thv-orange/20' : 'border-gray-50 bg-white shadow-lg'}`}>
          <button
            onClick={toggleListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-75 transform active:scale-90 ${
              isListening ? 'bg-red-500' : 'bg-thv-orange hover:bg-orange-600'
            }`}
            style={{ transform: isListening ? `scale(${buttonScale})` : 'scale(1)' }}
          >
            {isListening ? <MicOff size={44} className="text-white" /> : <Mic size={44} className="text-white" />}
          </button>
        </div>

        <div className="mt-8 h-8 flex flex-col items-center justify-center">
          {isListening ? (
            <div className="flex items-center gap-3">
              <span className="text-thv-orange text-xs font-bold uppercase tracking-widest animate-pulse">Recording Live</span>
            </div>
          ) : (
            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Tap to speak in {selectedLang.name}</span>
          )}
        </div>
      </div>

      <div className="w-full bg-white/80 p-8 rounded-[32px] border border-gray-100 shadow-inner min-h-[160px] max-h-[260px] overflow-y-auto transition-all relative">
        <div className="absolute top-4 right-6 text-[10px] font-bold text-gray-200 uppercase tracking-widest">Original Input</div>
        <p className={`text-lg leading-relaxed font-serif ${transcript ? 'text-gray-800' : 'text-gray-200 italic'}`}>
          {transcript || "Your native speech will appear here..."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full pt-4">
        <button
          onClick={() => { stopAll(); onBack(); }}
          className="px-8 py-5 rounded-2xl border border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          disabled={!transcript || isListening}
          onClick={handleFinish}
          className={`px-8 py-5 rounded-2xl font-bold shadow-xl transition-all ${
            !transcript || isListening 
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-thv-brown text-white hover:bg-black active:scale-[0.98]'
          }`}
        >
          {selectedLang.code === 'en-US' ? 'Generate Review' : 'Translate & Generate'}
        </button>
      </div>
    </div>
  );
};

export default VoiceCapture;
