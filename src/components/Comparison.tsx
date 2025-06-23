import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Plus } from 'lucide-react';

const Comparison: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <GitCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Playlist Comparison</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Compare multiple playlists side by side to discover similarities, differences, and unique characteristics.
        </p>
        
        <div className="glass rounded-2xl p-8 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-spotify-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-spotify-green" />
            </div>
            <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
            <p className="text-gray-300">
              Advanced playlist comparison features are currently in development. 
              Analyze individual playlists for now and check back soon!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Comparison;
