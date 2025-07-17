import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center space-x-2 p-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#6B5B95' }}>
        <span className="text-white font-bold text-sm">IV</span>
      </div>
      <div className="flex space-x-1">
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#6B5B95',
            animationDelay: '0ms'
          }}
        ></div>
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#6B5B95',
            animationDelay: '150ms'
          }}
        ></div>
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#6B5B95',
            animationDelay: '300ms'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;