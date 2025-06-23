import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { SpotifyTrack } from '../types/spotify';
import { playlistAnalyzer } from '../services/playlistAnalyzer';
import { useStore } from '../store/useStore';

interface TrackTableProps {
  tracks: SpotifyTrack[];
}

const TrackTable: React.FC<TrackTableProps> = ({ tracks }) => {
  const { currentTrack, isPlaying, setCurrentTrack, setPlaying } = useStore();

  const handlePlayClick = (track: any) => {
    console.log('TrackTable handlePlayClick called with track:', track);
    console.log('Track preview_url:', track.preview_url);
    
    if (!track.preview_url) {
      console.log('No preview_url available for this track');
      return;
    }
    
    if (currentTrack?.id === track.id) {
      console.log('Same track clicked, toggling play/pause');
      setPlaying(!isPlaying);
    } else {
      console.log('New track selected, setting currentTrack and playing');
      setCurrentTrack(track);
      setPlaying(true);
    }
  };

  const getArtistNames = (artists: any[]) => {
    return artists.map(artist => artist.name).join(', ');
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-green-400';
    if (popularity >= 60) return 'text-yellow-400';
    if (popularity >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-300 font-medium">#</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Title</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Artist</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Album</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Pop</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((item, index) => {
            if (!item.track) return null;
            
            const track = item.track;
            const isCurrentTrack = currentTrack?.id === track.id;
            const canPlay = track.preview_url !== null;
            console.log(`Track "${track.name}" - canPlay: ${canPlay}, preview_url: ${track.preview_url}`);
            
            return (
              <motion.tr
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`border-b border-gray-800 hover:bg-white hover:bg-opacity-5 transition-colors ${
                  isCurrentTrack ? 'bg-spotify-green bg-opacity-10' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center w-8">
                    {canPlay ? (
                      <motion.button
                        onClick={() => handlePlayClick(track)}
                        className="w-8 h-8 rounded-full bg-spotify-green bg-opacity-20 hover:bg-opacity-40 flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Play preview"
                      >
                        {isCurrentTrack && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </motion.button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-xs text-gray-500">—</span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    {track.album.images?.[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.album.name}
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <div>
                      <div className={`font-medium ${isCurrentTrack ? 'text-spotify-green' : 'text-white'}`}>
                        {track.name}
                      </div>
                      {!canPlay && (
                        <div className="text-xs text-gray-500">No preview</div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4 text-gray-300">
                  {getArtistNames(track.artists)}
                </td>
                
                <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                  {track.album.name}
                </td>
                
                <td className="py-3 px-4">
                  <span className={`font-medium ${getPopularityColor(track.popularity)}`}>
                    {track.popularity}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-gray-400">
                  {playlistAnalyzer.formatDuration(track.duration_ms)}
                </td>
                
                <td className="py-3 px-4">
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Open in Spotify"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      
      {tracks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No tracks found in this playlist
        </div>
      )}
    </div>
  );
};

export default TrackTable;
