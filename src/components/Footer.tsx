import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 py-3 border-t border-gray-700">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>
          Built with React + TensorFlow.js &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;