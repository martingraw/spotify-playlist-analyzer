import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Clock, Music, TrendingUp, Play, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { playlistAnalyzer } from '../services/playlistAnalyzer';
import TrackTable from './TrackTable';
import MoodChart from './MoodChart';
import GenreChart from './GenreChart';
import PopularityChart from './PopularityChart';

const Analysis: React.FC = () => {
  const { currentAnalysis, setCurrentTrack, setPlaying } = useStore();

  if (!currentAnalysis) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Analysis Available</h2>
        <p className="text-gray-400">Please analyze a playlist first</p>
      </div>
    );
  }

  const { playlist, analysis } = currentAnalysis;
  const playlistImage = playlist.images?.[0]?.url;

  const handlePlayPreview = (track: any) => {
    if (track.preview_url) {
      setCurrentTrack(track);
      setPlaying(true);
    }
  };

  const StatCard = ({ icon: Icon, label, value, description }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center"
    >
      <div className="w-12 h-12 bg-spotify-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-spotify-green" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      {description && (
        <div className="text-xs text-gray-400">{description}</div>
      )}
    </motion.div>
  );

  const MoodBar = ({ label, value, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-white">{Math.round(value * 100)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2 rounded-full ${color}`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Playlist Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {playlistImage && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={playlistImage}
              alt={playlist.name}
              className="w-32 h-32 rounded-xl shadow-lg mx-auto md:mx-0"
            />
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {playlist.name}
            </h1>
            <p className="text-gray-300 mb-4">
              by {playlist.owner.display_name}
            </p>
            {playlist.description && (
              <p className="text-gray-400 mb-4 max-w-2xl">
                {playlist.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Music className="w-4 h-4" />
                <span>{analysis.totalTracks} tracks</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span>{analysis.totalFollowers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{playlistAnalyzer.formatDuration(analysis.averageDuration * analysis.totalTracks)}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Spotify</span>
              </a>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {analysis.rating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(analysis.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">Playlist Rating</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <StatCard
          icon={Users}
          label="Artists"
          value={analysis.totalArtists}
          description="Unique artists"
        />
        <StatCard
          icon={Music}
          label="Avg Duration"
          value={playlistAnalyzer.formatDuration(analysis.averageDuration)}
          description="Per track"
        />
        <StatCard
          icon={TrendingUp}
          label="Popularity"
          value={analysis.averagePopularity}
          description="Average score"
        />
        <StatCard
          icon={Music}
          label="Tempo"
          value={`${analysis.averageTempo} BPM`}
          description="Average tempo"
        />
        <StatCard
          icon={Music}
          label="Key"
          value={playlistAnalyzer.getKeyName(analysis.mostCommonKey)}
          description="Most common"
        />
        <StatCard
          icon={Music}
          label="Top Genre"
          value={analysis.mostCommonGenre}
          description="Primary style"
        />
      </motion.div>

      {/* Mood Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Mood Profile</h3>
          <div className="space-y-4">
            <MoodBar
              label="Happiness"
              value={analysis.moods.happiness}
              color="bg-yellow-500"
            />
            <MoodBar
              label="Energy"
              value={analysis.moods.energy}
              color="bg-red-500"
            />
            <MoodBar
              label="Danceability"
              value={analysis.moods.danceability}
              color="bg-purple-500"
            />
            <MoodBar
              label="Acousticness"
              value={analysis.moods.acousticness}
              color="bg-green-500"
            />
            <MoodBar
              label="Instrumentalness"
              value={analysis.moods.instrumentalness}
              color="bg-blue-500"
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Audio Features</h3>
          <MoodChart analysis={analysis} />
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Genre Distribution</h3>
          <GenreChart genres={analysis.genres} />
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Popularity Distribution</h3>
          <PopularityChart distribution={analysis.popularityDistribution} />
        </div>
      </motion.div>

      {/* Decades */}
      {analysis.decades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-white mb-6">Era Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {analysis.decades.map((decade) => (
              <div key={decade.decade} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {decade.percentage}%
                </div>
                <div className="text-sm text-gray-300 mb-2">{decade.decade}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 bg-spotify-green rounded-full"
                    style={{ width: `${decade.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Track Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-white mb-6">All Tracks</h3>
        <TrackTable 
          tracks={playlist.tracks.items} 
        />
      </motion.div>
    </div>
  );
};

export default Analysis;
