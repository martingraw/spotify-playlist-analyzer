import React from 'react';
import { motion } from 'framer-motion';
import { User, Music, Heart, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Profile</h2>
          <p className="text-gray-400 mb-8">
            Please log in with Spotify to view your profile and access advanced features.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {user.images && user.images.length > 0 ? (
            <img
              src={user.images[0].url}
              alt={user.display_name}
              className="w-32 h-32 rounded-full border-4 border-spotify-green shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center border-4 border-spotify-green">
              <User className="w-16 h-16 text-white" />
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {user.display_name}
            </h1>
            <p className="text-gray-300 mb-4">
              Spotify User • {user.country}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-4 h-4" />
                <span>{user.followers.total.toLocaleString()} followers</span>
              </div>
              {user.email && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="card text-center">
          <div className="w-12 h-12 bg-spotify-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Music className="w-6 h-6 text-spotify-green" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Your Playlists
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Analyze your personal playlists with full audio feature access
          </p>
          <button className="btn-secondary w-full" disabled>
            Coming Soon
          </button>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-spotify-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-spotify-green" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Liked Songs
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Deep dive into your liked songs and discover patterns
          </p>
          <button className="btn-secondary w-full" disabled>
            Coming Soon
          </button>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-spotify-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-spotify-green" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Preferences
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Customize your analysis preferences and settings
          </p>
          <button className="btn-secondary w-full" disabled>
            Coming Soon
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">
            Your recent playlist analyses will appear here
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-white mb-6">Your Music DNA</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-spotify-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-spotify-green" />
          </div>
          <p className="text-gray-400 mb-4">
            Analyze more playlists to unlock your personalized music insights
          </p>
          <p className="text-sm text-gray-500">
            Features include: favorite genres, mood preferences, discovery patterns, and more
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
