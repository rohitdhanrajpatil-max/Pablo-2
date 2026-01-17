
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, RefreshCcw } from 'lucide-react';

interface VoiceCaptureProps {
  onCapture: (transcript: string) => void;
  onBack: () => void;
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onCapture, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

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
        setIsListening(false);
      };
    } else {
      alert("Voice recognition is not supported in this browser. Please type your feedback.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleFinish = () => {
    if (transcript.trim().length > 5) {
      onCapture(transcript);
    } else {
      alert("Please provide a more detailed feedback.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-thv-brown">Share Your Thoughts</h2>
        <p className="text-gray-500 text-sm">Tell us what you liked or how we can improve</p>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <div className={`p-8 rounded-full border-4 ${isListening ? 'border-thv-orange animate-pulse' : 'border-gray-100'} transition-all`}>
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-thv-orange hover:bg-orange-600'
            }`}
          >
            {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
          </button>
        </div>
        {isListening && (
           <div className="mt-4 flex items-center text-red-500 font-medium animate-bounce">
             <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
             Recording...
           </div>
        )}
      </div>

      <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[120px] max-h-[200px] overflow-y-auto">
        <p className={`text-lg leading-relaxed ${transcript ? 'text-gray-800' : 'text-gray-400 italic'}`}>
          {transcript || "Speak now... your words will appear here."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          disabled={!transcript || isListening}
          onClick={handleFinish}
          className={`px-6 py-4 rounded-xl font-semibold shadow-lg transition-all ${
            !transcript || isListening 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-thv-brown text-white hover:bg-black'
          }`}
        >
          Generate Review
        </button>
      </div>
    </div>
  );
};

export default VoiceCapture;
