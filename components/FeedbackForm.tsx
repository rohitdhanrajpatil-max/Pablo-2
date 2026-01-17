
import React from 'react';
import { GuestInfo } from '../types';

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
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-thv-brown">Stay Details</h2>
        <p className="text-gray-500 text-sm">Please tell us about your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-thv-brown mb-1">Hotel Name</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-thv-orange focus:border-transparent outline-none transition-all"
            placeholder="e.g. Grand Resort & Spa"
            value={info.hotelName}
            onChange={(e) => setInfo({ ...info, hotelName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-thv-brown mb-1">Mobile Number</label>
          <input
            required
            type="tel"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-thv-orange focus:border-transparent outline-none transition-all"
            placeholder="+1 (555) 000-0000"
            value={info.mobile}
            onChange={(e) => setInfo({ ...info, mobile: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-thv-brown mb-1">Total Nights Stayed</label>
          <input
            required
            type="number"
            min="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-thv-orange focus:border-transparent outline-none transition-all"
            placeholder="e.g. 3"
            value={info.nightsStay || ''}
            onChange={(e) => setInfo({ ...info, nightsStay: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-thv-brown hover:bg-black text-white py-4 rounded-xl font-semibold shadow-lg transform transition active:scale-[0.98]"
      >
        Continue to Voice Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;
