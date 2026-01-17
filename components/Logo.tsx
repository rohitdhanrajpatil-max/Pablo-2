
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dimensions = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl'
  };

  return (
    <div className={`${dimensions[size]} flex shadow-lg`}>
      <div className="flex-1 bg-thv-brown flex items-center justify-center font-bold text-white">
        T
      </div>
      <div className="flex-1 bg-thv-orange flex items-center justify-center font-bold text-white">
        H
      </div>
      <div className="flex-1 bg-thv-brown flex items-center justify-center font-bold text-white">
        V
      </div>
    </div>
  );
};

export default Logo;
