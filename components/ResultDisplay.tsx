
import React, { useState } from 'react';
import { Mail, Copy, Check, MessageCircle, ArrowLeft, Share2, Sparkles } from 'lucide-react';
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
    const sanitizedMobile = info.mobile.replace(/[^\d+]/g, '');
    const text = encodeURIComponent(`Feedback for ${info.hotelName}:\n\n${review}`);
    window.open(`https://wa.me/${sanitizedMobile}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Guest Feedback - ${info.hotelName}`);
    const body = encodeURIComponent(review);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-thv-orange/10 border border-thv-orange/20 text-thv-orange text-[10px] font-bold uppercase tracking-widest mb-2">
          <Sparkles size={12} />
          Humanized by AI
        </div>
        <h2 className="text-3xl font-bold text-thv-brown tracking-tight">Your Feedback is Ready</h2>
        <p className="text-gray-400 text-sm font-medium">Review and share your authentic stay experience.</p>
      </div>

      <div className="w-full relative group">
        {/* Shadow layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-thv-gold/20 to-thv-orange/20 rounded-[40px] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Main Card */}
        <div className="relative bg-white p-10 sm:p-14 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-thv-gold/5 -mr-16 -mt-16 rounded-full"></div>
          
          <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-8">
            <div className="space-y-1">
              <p className="text-[10px] text-thv-gold font-bold uppercase tracking-widest">Property</p>
              <h4 className="text-lg font-bold text-thv-brown">{info.hotelName}</h4>
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] text-thv-gold font-bold uppercase tracking-widest">Duration</p>
              <h4 className="text-lg font-bold text-thv-brown">{info.nightsStay} Nights</h4>
            </div>
          </header>

          <div className="relative">
            <span className="absolute -top-6 -left-4 text-6xl text-gray-50 font-serif leading-none select-none">"</span>
            <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-serif italic relative z-10 px-2">
              {review}
            </p>
            <span className="absolute -bottom-10 -right-2 text-6xl text-gray-50 font-serif leading-none select-none transform rotate-180">"</span>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1fb355] text-white py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-xl shadow-[#25D366]/10"
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>

          <button
            onClick={handleEmail}
            className="flex items-center justify-center gap-3 bg-thv-brown hover:bg-black text-white py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-xl shadow-thv-brown/10"
          >
            <Mail size={20} />
            Email
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] border border-gray-100 ${
              copied ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-lg shadow-gray-200/50'
            }`}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-thv-gold hover:text-thv-brown font-bold text-xs tracking-widest uppercase transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Create New Feedback
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
