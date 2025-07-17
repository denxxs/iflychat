import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-start space-x-3 mb-6">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
           style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)' }}>
        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-bold text-xs">i</span>
        </div>
      </div>

      {/* Typing Animation */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500 ml-2">Legal Assistant is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;