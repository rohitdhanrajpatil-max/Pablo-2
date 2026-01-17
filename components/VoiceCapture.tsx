
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceCaptureProps {
  onCapture: (transcript: string) => void;
  onBack: () => void;
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onCapture, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [isSilent, setIsSilent] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        stopAll();
      };

      recognitionRef.current.onend = () => {
        // If we didn't manually stop it, we should reflect the state
        if (isListening) setIsListening(false);
      };
    }

    return () => {
      stopAll();
    };
  }, []);

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
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        
        const average = values / bufferLength;
        const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
        
        setVolume(normalizedVolume);
        setIsSilent(average < 10); // Threshold for silence

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.error("Error accessing microphone for visualization:", err);
    }
  };

  const stopAll = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    setVolume(0);
    setIsSilent(true);
  };

  const toggleListening = () => {
    if (isListening) {
      stopAll();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      startAudioAnalysis();
      setIsListening(true);
    }
  };

  const handleFinish = () => {
    if (transcript.trim().length > 5) {
      stopAll();
      onCapture(transcript);
    } else {
      alert("Please provide a bit more feedback for a better AI response.");
    }
  };

  // Calculate dynamic scale factor based on volume (1.0 to 1.15)
  const buttonScale = isListening ? 1 + (volume / 666) : 1;
  const ringScale1 = isListening ? 1 + (volume / 200) : 1;
  const ringScale2 = isListening ? 1 + (volume / 100) : 1;

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-thv-brown">Share Your Thoughts</h2>
        <p className="text-gray-500 text-sm">We're listening to every word...</p>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Volume Rings */}
        {isListening && (
          <>
            <div 
              className="absolute rounded-full bg-thv-orange/20 transition-transform duration-75 ease-out"
              style={{ 
                width: '120px', 
                height: '120px',
                transform: `scale(${ringScale1 * 1.2})`
              }}
            />
            <div 
              className="absolute rounded-full bg-thv-orange/10 transition-transform duration-100 ease-out"
              style={{ 
                width: '140px', 
                height: '140px',
                transform: `scale(${ringScale2 * 1.3})`
              }}
            />
          </>
        )}

        <div className={`p-8 rounded-full border-4 z-10 transition-colors ${isListening ? 'border-thv-orange bg-white' : 'border-gray-100 bg-white'}`}>
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-75 ease-out transform active:scale-95 ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-thv-orange hover:bg-orange-600'
            }`}
            style={{
              transform: isListening ? `scale(${buttonScale})` : 'scale(1)'
            }}
          >
            {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
          </button>
        </div>

        {/* Silence/Activity Indicator */}
        <div className="mt-8 h-6 flex items-center justify-center">
          {isListening ? (
            isSilent ? (
              <span className="text-gray-400 text-sm flex items-center animate-pulse">
                <AlertCircle size={14} className="mr-1" /> Waiting for your voice...
              </span>
            ) : (
              <div className="flex items-end space-x-1 h-4">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-thv-orange rounded-full transition-all duration-75"
                    style={{ 
                      height: `${20 + Math.random() * volume}%`,
                      opacity: 0.5 + (volume / 200)
                    }}
                  />
                ))}
                <span className="ml-2 text-thv-orange text-sm font-medium">Listening...</span>
              </div>
            )
          ) : (
            <span className="text-gray-400 text-sm">Tap the microphone to start</span>
          )}
        </div>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-inner min-h-[120px] max-h-[200px] overflow-y-auto transition-all">
        <p className={`text-lg leading-relaxed ${transcript ? 'text-gray-800' : 'text-gray-400 italic'}`}>
          {transcript || "Speak clearly... your words will appear here in real-time."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => {
            stopAll();
            onBack();
          }}
          className="px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          disabled={!transcript || isListening}
          onClick={handleFinish}
          className={`px-6 py-4 rounded-xl font-semibold shadow-lg transition-all ${
            !transcript || isListening 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-thv-brown text-white hover:bg-black active:scale-[0.98]'
          }`}
        >
          Generate Review
        </button>
      </div>
    </div>
  );
};

export default VoiceCapture;
