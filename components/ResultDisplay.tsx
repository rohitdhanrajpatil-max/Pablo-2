
import React, { useState } from 'react';
import { Send, Mail, Copy, Check, MessageCircle, ArrowLeft } from 'lucide-react';
import { GuestInfo } from '../types';

interface ResultDisplayProps {
  review: string;
  info: GuestInfo;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ review, info, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    // Sanitize phone number: remove all non-numeric characters except the plus sign
    const sanitizedMobile = info.mobile.replace(/[^\d+]/g, '');
    const text = encodeURIComponent(`Feedback for ${info.hotelName}:\n\n${review}`);
    
    // Using the sanitized mobile number ensures the correct contact is opened
    // Format: https://wa.me/number?text=message
    window.open(`https://wa.me/${sanitizedMobile}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Guest Feedback - ${info.hotelName}`);
    const body = encodeURIComponent(review);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-thv-brown">Your Refined Feedback</h2>
        <p className="text-gray-500 text-sm">We've humanized your stay experience</p>
      </div>

      <div className="w-full bg-white p-8 rounded-3xl border-2 border-thv-orange shadow-lg relative">
        <div className="absolute top-0 right-0 p-4">
           <div className="bg-thv-orange/10 text-thv-orange px-3 py-1 rounded-full text-xs font-bold uppercase">
             AI Enhanced
           </div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium">STAY AT {info.hotelName.toUpperCase()} • {info.nightsStay} NIGHTS</p>
        </div>
        <p className="text-xl text-gray-800 leading-relaxed font-serif italic">
          "{review}"
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center space-y-1 bg-[#25D366] hover:bg-[#20ba57] text-white py-4 rounded-xl font-semibold transition shadow-md"
          title={`Send to ${info.mobile}`}
        >
          <MessageCircle size={24} />
          <span className="text-xs">WhatsApp</span>
        </button>

        <button
          onClick={handleEmail}
          className="flex flex-col items-center justify-center space-y-1 bg-thv-brown hover:bg-black text-white py-4 rounded-xl font-semibold transition shadow-md"
        >
          <Mail size={24} />
          <span className="text-xs">Email</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex flex-col items-center justify-center space-y-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition shadow-md"
        >
          {copied ? <Check size={24} className="text-green-600" /> : <Copy size={24} />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>

      <button
        onClick={onReset}
        className="flex items-center text-gray-500 hover:text-thv-brown font-medium transition group"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        New Feedback
      </button>
    </div>
  );
};

export default ResultDisplay;
