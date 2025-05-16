import React from 'react';
import { Camera, Upload } from 'lucide-react';
import WebcamDetection from './components/WebcamDetection';
import ImageUploadDetection from './components/ImageUploadDetection';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = React.useState<'webcam' | 'upload'>('webcam');

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('webcam')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-md transition-all ${
                activeTab === 'webcam' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Camera size={18} />
              <span>Webcam</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-md transition-all ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Upload size={18} />
              <span>Upload Image</span>
            </button>
          </div>
          
          {/* Active Content */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            {activeTab === 'webcam' ? (
              <WebcamDetection />
            ) : (
              <ImageUploadDetection />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;