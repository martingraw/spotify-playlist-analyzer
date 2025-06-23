import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Link, Sparkles, BarChart3, Users, Music2, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { spotifyApi } from '../services/spotifyApi';
import { playlistAnalyzer } from '../services/playlistAnalyzer';

const Home: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [error, setError] = useState('');
  const { 
    setCurrentAnalysis, 
    setAnalyzing, 
    setAnalysisError, 
    setCurrentView,
    isAuthenticated 
  } = useStore();

  const handleAnalyze = async () => {
    if (!playlistUrl.trim()) {
      setError('Please enter a Spotify playlist URL');
      return;
    }

    const playlistId = spotifyApi.extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Invalid Spotify playlist URL. Please check the format.');
      return;
    }

    setError('');
    setAnalyzing(true);

    try {
      // Get playlist data
      const playlist = await spotifyApi.getPlaylist(playlistId);
      const tracks = await spotifyApi.getPlaylistTracks(playlistId);
      
      // Update playlist with tracks
      playlist.tracks.items = tracks;

      let audioFeatures: any[] = [];
      let artistData: any[] = [];

      // Always try to get audio features (will use mock data if API fails)
      try {
        const trackIds = tracks
          .filter(item => item.track && item.track.id)
          .map(item => item.track.id);
        
        if (trackIds.length > 0) {
          audioFeatures = await spotifyApi.getAudioFeatures(trackIds);
          
          // Get artist data for genres
          const artistIds = Array.from(new Set(
            tracks.flatMap(item => 
              item.track ? item.track.artists.map(artist => artist.id) : []
            )
          ));
          
          if (artistIds.length > 0) {
            artistData = await spotifyApi.getArtists(artistIds);
          }
        }
      } catch (audioError) {
        console.warn('Could not fetch audio features:', audioError);
      }

      // Analyze the playlist
      const analysis = playlistAnalyzer.analyzePlaylist(playlist, audioFeatures, artistData);
      
      setCurrentAnalysis(analysis);
      setCurrentView('analysis');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError(err.message || 'Failed to analyze playlist');
    } finally {
      setAnalyzing(false);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Comprehensive analysis of audio features, genres, and mood patterns'
    },
    {
      icon: Users,
      title: 'Social Insights',
      description: 'Compare playlists and discover similar music communities'
    },
    {
      icon: Music2,
      title: 'Track Previews',
      description: 'Listen to 30-second previews while exploring your analysis'
    },
    {
      icon: Zap,
      title: 'Instant Analysis',
      description: 'Get comprehensive insights and detailed breakdowns in seconds'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 text-brand-green mx-auto mb-4" />
        </motion.div>
        
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 gradient-text">
          Discover Your Music DNA
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Unlock deep insights into any Spotify playlist with our advanced analytics engine. 
          Analyze mood patterns, discover hidden connections, and optimize your musical journey.
        </p>

        {/* Playlist Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl p-8 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Link className="w-6 h-6 text-brand-green" />
              <h3 className="text-xl font-semibold text-white">
                Analyze Any Playlist
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="Paste Spotify playlist URL here..."
                  className="w-full px-4 py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              
              <motion.button
                onClick={handleAnalyze}
                className="w-full btn-primary text-lg py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!playlistUrl.trim()}
              >
                Analyze Playlist
              </motion.button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Works with any public Spotify playlist
              </p>
              <p className="text-gray-500 text-xs">
                {isAuthenticated 
                  ? 'Full analysis with audio features available' 
                  : 'Login for advanced audio feature analysis'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="card text-center hover:scale-105 transition-transform duration-200"
            >
              <div className="w-12 h-12 bg-brand-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
};

export default Home;
