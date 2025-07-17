import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-start space-x-3 mb-6">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
           style={{ backgroundColor: '#1b2f5a' }}>
        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
          <div className="relative">
            {/* "i" letter */}
            <div className="w-1.5 h-1.5 rounded-full mb-0.5" style={{ backgroundColor: '#1b2f5a' }}></div>
            <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: '#1b2f5a' }}></div>
            {/* Orange accent bars */}
            <div className="absolute -right-1 top-0 w-2 h-1 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
            <div className="absolute -right-1 top-1 w-2 h-1 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
          </div>
        </div>
      </div>

      {/* Typing Animation */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1b2f5a', animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1b2f5a', animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1b2f5a', animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500 ml-2">Legal Assistant is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;