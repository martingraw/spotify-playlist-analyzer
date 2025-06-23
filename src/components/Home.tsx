import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Link, Sparkles, BarChart3, Users, Music2, Zap, TrendingUp, Target, Shield, Headphones, Brain, Palette } from 'lucide-react';
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
      const errorMessage = err.message || 'Failed to analyze playlist';
      
      // Show user-friendly error message
      if (errorMessage.includes('Unable to access playlist')) {
        setAnalysisError('Unable to access this playlist. This may be a private playlist or have restricted access. Please try a different public playlist or login with Spotify for full access.');
      } else {
        setAnalysisError(errorMessage);
      }
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
          Free Spotify Playlist Analyzer
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Unlock deep insights into any Spotify playlist with our advanced analytics engine. 
          Analyze mood patterns, discover hidden connections, and optimize your musical journey with comprehensive playlist analysis.
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

      {/* SEO Content Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="mt-16 space-y-12"
      >
        {/* Advanced Features Section */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Advanced Spotify Playlist Analyzer Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Audio Feature Analysis</h3>
              <p className="text-gray-300 text-sm">
                Our Spotify playlist analyzer examines tempo, energy, danceability, valence, and acousticness to reveal the musical DNA of your playlists.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Genre Distribution</h3>
              <p className="text-gray-300 text-sm">
                Visualize genre diversity with comprehensive charts showing how different music styles blend in your Spotify playlists.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Popularity Insights</h3>
              <p className="text-gray-300 text-sm">
                Track popularity scores and discover hidden gems alongside mainstream hits in your playlist analysis.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            How Our Spotify Playlist Analysis Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Playlist Data Extraction</h3>
                <p className="text-gray-300">
                  Our Spotify playlist analyzer connects to the Spotify Web API to extract comprehensive track information, including metadata, audio features, and artist details from any public playlist.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Audio Analysis</h3>
                <p className="text-gray-300">
                  We analyze 11 key audio features including tempo, key, loudness, speechiness, instrumentalness, liveness, and more to create a complete musical profile of your playlist.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Intelligent Visualization</h3>
                <p className="text-gray-300">
                  Transform raw data into beautiful, interactive charts and graphs that make it easy to understand your playlist's musical characteristics and patterns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Why Choose Our Spotify Playlist Analyzer Tool
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-brand-green" />
                <h3 className="text-xl font-semibold text-white">Free & Secure</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Our Spotify playlist analyzer is completely free to use with no registration required for public playlists. We prioritize your privacy and never store your personal data.
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <Headphones className="w-6 h-6 text-brand-green" />
                <h3 className="text-xl font-semibold text-white">Audio Previews</h3>
              </div>
              <p className="text-gray-300">
                Listen to 30-second track previews directly within the analysis interface, making it easy to discover new music while exploring your playlist data.
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-brand-green" />
                <h3 className="text-xl font-semibold text-white">Comprehensive Insights</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Get detailed breakdowns of mood patterns, energy levels, genre distribution, and popularity metrics that other Spotify playlist analyzers don't provide.
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-brand-green" />
                <h3 className="text-xl font-semibold text-white">Lightning Fast</h3>
              </div>
              <p className="text-gray-300">
                Analyze playlists with hundreds of tracks in seconds, not minutes. Our optimized algorithms ensure quick results without compromising accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Use Cases */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Spotify Playlist Analytics for Music Professionals
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">For Artists & Musicians</h3>
              <p className="text-gray-300 mb-4">
                Use our Spotify playlist analyzer to understand the musical characteristics of playlists you want to target for submissions. Analyze successful playlists in your genre to identify trends and optimize your music production and promotion strategies.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">For Playlist Curators</h3>
              <p className="text-gray-300 mb-4">
                Maintain consistent mood and energy levels across your playlists by analyzing audio features. Ensure your curated playlists have the right balance of popular tracks and hidden gems to keep listeners engaged.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">For Music Researchers</h3>
              <p className="text-gray-300">
                Conduct academic research on music trends, genre evolution, and listener preferences using comprehensive playlist data. Export analysis results for further statistical analysis and research publications.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Unlock the Power of Spotify Playlist Analysis
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Discover Music Patterns</h4>
              <p className="text-gray-300 text-sm">
                Identify recurring themes and patterns in your favorite playlists to discover new music that matches your taste.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Optimize Playlists</h4>
              <p className="text-gray-300 text-sm">
                Use data-driven insights to create better playlists with improved flow, energy progression, and listener engagement.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Track Popularity</h4>
              <p className="text-gray-300 text-sm">
                Monitor track popularity scores and identify trending songs before they become mainstream hits.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Genre Exploration</h4>
              <p className="text-gray-300 text-sm">
                Explore genre diversity and discover how different musical styles blend together in successful playlists.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
