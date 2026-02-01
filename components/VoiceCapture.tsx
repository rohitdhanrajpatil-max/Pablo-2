
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Settings, RefreshCw, Lock, ShieldAlert, XCircle } from 'lucide-react';

interface VoiceCaptureProps {
  onCapture: (transcript: string) => void;
  onBack: () => void;
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onCapture, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [isSilent, setIsSilent] = useState(true);
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

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError({
            title: "Microphone Access Blocked",
            message: "It looks like microphone access is blocked for this site. To continue, please click the lock icon in the address bar and set Microphone to 'Allow'.",
            type: 'denied'
          });
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors, they just mean the user was quiet
        } else {
          setPermissionError({
            title: "Recognition Error",
            message: `Something went wrong: ${event.error}. Please try again.`,
            type: 'other'
          });
        }
        stopAll();
      };

      recognition.onend = () => {
        // Only set isListening to false if it was true (prevents flash on stop)
        setIsListening(prev => prev ? false : prev);
      };

      recognitionRef.current = recognition;
    } else {
      setPermissionError({
        title: "Browser Not Supported",
        message: "Your current browser does not support voice input. Please use a modern browser like Chrome, Edge, or Safari.",
        type: 'unsupported'
      });
    }

    return () => {
      stopAll();
    };
  }, []);

  const startAudioAnalysis = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported");
      }

      // First, try to get the stream to ensure permission is granted
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
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        
        const average = values / bufferLength;
        const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
        
        setVolume(normalizedVolume);
        setIsSilent(average < 10);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (err: any) {
      console.error("Microphone Access Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) {
        setPermissionError({
          title: "Permission Denied",
          message: "The microphone was blocked. To fix this, click the lock icon (🔒) in your address bar and reset the Microphone permission to 'Allow'.",
          type: 'denied'
        });
      } else {
        setPermissionError({
          title: "Microphone Not Found",
          message: "We couldn't detect a working microphone. Please check your system settings or hardware connection.",
          type: 'other'
        });
      }
      return false;
    }
  };

  const stopAll = () => {
    // 1. Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    // 2. Stop Visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 3. Close Audio Context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    
    // 4. Release Media Stream Tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    setIsListening(false);
    setVolume(0);
    setIsSilent(true);
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
          console.error("Recognition start error", e);
          // If already started, just toggle the state
          if (String(e).includes('already started')) {
            setIsListening(true);
          } else {
            setPermissionError({
              title: "Internal Studio Error",
              message: "The studio failed to start recording. Please try refreshing your browser.",
              type: 'other'
            });
          }
        }
      }
    }
  };

  const handleFinish = () => {
    if (transcript.trim().length > 5) {
      stopAll();
      onCapture(transcript);
    } else {
      alert("Please speak a little more so we can capture enough detail for your review.");
    }
  };

  const buttonScale = isListening ? 1 + (volume / 600) : 1;
  const ringScale1 = isListening ? 1 + (volume / 180) : 1;
  const ringScale2 = isListening ? 1 + (volume / 90) : 1;

  if (permissionError) {
    return (
      <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-slideUp py-8">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
           {permissionError.type === 'denied' ? <Lock size={40} /> : <XCircle size={40} />}
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-thv-brown">{permissionError.title}</h2>
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-5 text-left">
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {permissionError.message}
            </p>
            {permissionError.type === 'denied' && (
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                <p className="text-[10px] font-bold text-thv-orange uppercase tracking-widest">Resolution Guide:</p>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-thv-orange text-white text-[10px] flex items-center justify-center shrink-0 font-bold">1</div>
                  <p className="text-xs text-gray-500">Find the <b>Lock</b> or <b>Settings</b> icon next to the website address.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-thv-orange text-white text-[10px] flex items-center justify-center shrink-0 font-bold">2</div>
                  <p className="text-xs text-gray-500">Switch the <b>Microphone</b> toggle to <b>On</b> or <b>Allow</b>.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-thv-orange text-white text-[10px] flex items-center justify-center shrink-0 font-bold">3</div>
                  <p className="text-xs text-gray-500">Click the <b>Try Again</b> button below.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {permissionError.type !== 'unsupported' && (
            <button
              onClick={toggleListening}
              className="w-full flex items-center justify-center gap-3 bg-thv-brown hover:bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-thv-brown/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full text-thv-gold hover:text-thv-brown font-bold text-sm tracking-widest uppercase py-2 transition flex items-center justify-center gap-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-10 w-full max-w-md animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-thv-brown tracking-tight">Voice Studio</h2>
        <p className="text-gray-400 text-sm font-medium">Recording is live. Speak your mind.</p>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`absolute rounded-full bg-thv-orange/20 transition-all duration-75 ${isListening ? 'opacity-100' : 'opacity-0 scale-50'}`}
            style={{ 
              width: '120px', 
              height: '120px',
              transform: `scale(${ringScale1 * 1.2})`
            }}
          />
          <div 
            className={`absolute rounded-full bg-thv-orange/10 transition-all duration-100 ${isListening ? 'opacity-100' : 'opacity-0 scale-50'}`}
            style={{ 
              width: '160px', 
              height: '160px',
              transform: `scale(${ringScale2 * 1.4})`
            }}
          />
        </div>

        <div className={`p-10 rounded-full border-4 z-10 transition-all duration-500 ${isListening ? 'border-thv-orange bg-white shadow-2xl shadow-thv-orange/20' : 'border-gray-50 bg-white shadow-lg shadow-gray-100/50'}`}>
          <button
            onClick={toggleListening}
            aria-label={isListening ? "Stop Recording" : "Start Recording"}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-75 ease-out transform active:scale-90 ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-thv-orange hover:bg-orange-600'
            }`}
            style={{
              transform: isListening ? `scale(${buttonScale})` : 'scale(1)'
            }}
          >
            {isListening ? <MicOff size={44} className="text-white" /> : <Mic size={44} className="text-white" />}
          </button>
        </div>

        <div className="mt-10 h-8 flex flex-col items-center justify-center gap-2">
          {isListening ? (
            isSilent ? (
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                <AlertCircle size={14} /> 
                Waiting for audio...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-1.5 h-6">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1.5 bg-thv-orange rounded-full transition-all duration-150"
                      style={{ 
                        height: `${30 + Math.random() * volume}%`,
                        opacity: 0.4 + (volume / 180)
                      }}
                    />
                  ))}
                </div>
                <span className="text-thv-orange text-xs font-bold uppercase tracking-widest">Recording</span>
              </div>
            )
          ) : (
            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Ready to record</span>
          )}
        </div>
      </div>

      <div className="w-full bg-white/80 p-8 rounded-[32px] border border-gray-100 shadow-inner min-h-[160px] max-h-[260px] overflow-y-auto transition-all relative group">
        <div className="absolute top-4 right-6 text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em] group-hover:text-thv-gold transition-colors">Digital Transcription</div>
        <p className={`text-xl leading-relaxed font-serif ${transcript ? 'text-gray-800' : 'text-gray-200 italic'}`}>
          {transcript || "Speak clearly. Your stay details, staff mentions, and thoughts will appear here..."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full pt-4">
        <button
          onClick={() => {
            stopAll();
            onBack();
          }}
          className="px-8 py-5 rounded-2xl border border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-thv-brown transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          disabled={!transcript || isListening}
          onClick={handleFinish}
          className={`px-8 py-5 rounded-2xl font-bold shadow-xl transition-all ${
            !transcript || isListening 
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-thv-brown text-white hover:bg-black active:scale-[0.98] shadow-thv-brown/10'
          }`}
        >
          Generate Review
        </button>
      </div>
    </div>
  );
};

export default VoiceCapture;
