
import React from 'react';
import { GuestInfo } from '../types';
import { Building2, Smartphone, CalendarDays, ArrowRight } from 'lucide-react';

interface FeedbackFormProps {
  info: GuestInfo;
  setInfo: (info: GuestInfo) => void;
  onNext: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ info, setInfo, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (info.hotelName && info.mobile && info.nightsStay > 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-thv-brown">Stay Context</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">Provide basic details so we can tailor your feedback perfectly.</p>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label htmlFor="hotelName" className="block text-[11px] font-bold text-thv-gold uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-thv-orange">Hotel Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-thv-orange transition-colors">
              <Building2 size={18} aria-hidden="true" />
            </div>
            <input
              id="hotelName"
              required
              type="text"
              autoComplete="organization"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-thv-orange/5 focus:border-thv-orange outline-none transition-all font-medium text-thv-brown placeholder:text-gray-300"
              placeholder="e.g. The Grand Heritage"
              value={info.hotelName}
              onChange={(e) => setInfo({ ...info, hotelName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="mobile" className="block text-[11px] font-bold text-thv-gold uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-thv-orange">Your Mobile</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-thv-orange transition-colors">
                <Smartphone size={18} aria-hidden="true" />
              </div>
              <input
                id="mobile"
                required
                type="tel"
                autoComplete="tel"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-thv-orange/5 focus:border-thv-orange outline-none transition-all font-medium text-thv-brown placeholder:text-gray-300"
                placeholder="+1..."
                value={info.mobile}
                onChange={(e) => setInfo({ ...info, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="nightsStay" className="block text-[11px] font-bold text-thv-gold uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-thv-orange">Nights</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-thv-orange transition-colors">
                <CalendarDays size={18} aria-hidden="true" />
              </div>
              <input
                id="nightsStay"
                required
                type="number"
                min="1"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-4 focus:ring-thv-orange/5 focus:border-thv-orange outline-none transition-all font-medium text-thv-brown placeholder:text-gray-300"
                placeholder="0"
                value={info.nightsStay || ''}
                onChange={(e) => setInfo({ ...info, nightsStay: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full group flex items-center justify-center gap-3 bg-thv-brown hover:bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-thv-brown/10 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Open Voice Studio
        <ArrowRight size={20} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default FeedbackForm;
