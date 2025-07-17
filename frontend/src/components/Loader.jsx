import React from 'react';
import IndiflyLogo from './IndiflyLogo';

const Loader = () => {
  return (
    <div className="flex items-start space-x-3 mb-6">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
           style={{ backgroundColor: '#02295c' }}>
        <IndiflyLogo size="sm" />
      </div>

      {/* Typing Animation */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#02295c', animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#02295c', animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#02295c', animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500 ml-2">Indifly AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;