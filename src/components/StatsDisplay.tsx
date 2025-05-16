import React from 'react';
import { User, Zap } from 'lucide-react';

interface StatsDisplayProps {
  stats: {
    faces: number;
    fps: number;
  };
  isActive: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, isActive }) => {
  return (
    <div className={`grid grid-cols-2 gap-4 mt-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-purple-500/20 p-2 rounded-lg">
          <User className="text-purple-400" size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Faces Detected</p>
          <p className="text-xl font-semibold">{stats.faces}</p>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <Zap className="text-yellow-400" size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Performance</p>
          <p className="text-xl font-semibold">{stats.fps} FPS</p>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;