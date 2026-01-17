
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const containerSize = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };

  const fontSize = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`${containerSize[size]} grid grid-cols-3 overflow-hidden shadow-md shrink-0`}>
      {/* Left Column: Dark Brown with T */}
      <div className="bg-thv-brown flex items-center justify-center">
        <span className={`${fontSize[size]} font-black text-white leading-none`}>T</span>
      </div>
      
      {/* Middle Column: Burnt Orange with H */}
      <div className="bg-thv-orange flex items-center justify-center">
        <span className={`${fontSize[size]} font-black text-white leading-none`}>H</span>
      </div>
      
      {/* Right Column: Dark Brown with V */}
      <div className="bg-thv-brown flex items-center justify-center">
        <span className={`${fontSize[size]} font-black text-white leading-none`}>V</span>
      </div>
    </div>
  );
};

export default Logo;
