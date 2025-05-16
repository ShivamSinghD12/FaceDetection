import React from 'react';
import { Scan } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="text-blue-500" size={28} />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Face Detector
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
              TensorFlow Powered
            </span>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
              BlazeFace Model
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;