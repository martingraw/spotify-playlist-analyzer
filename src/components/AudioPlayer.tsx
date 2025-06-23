import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '../store/useStore';

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    setPlaying, 
    setVolume, 
    setCurrentTrack 
  } = useStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Log the preview URL for debugging
    console.log('AudioPlayer preview_url:', currentTrack.preview_url);

    // Defensive: If preview_url is null, do not set src
    if (!currentTrack.preview_url) {
      audio.src = "";
      setPlaying(false);
      return;
    }

    audio.src = currentTrack.preview_url;
    audio.volume = volume;
    
    // Add error handling for audio loading
    const handleError = () => {
      console.warn('Audio failed to load:', currentTrack.preview_url);
      setPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play:', currentTrack.preview_url);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Audio play failed:', error);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack, isPlaying, volume, setPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="glass border-t border-white border-opacity-20 p-4">
          <div className="container mx-auto">
            <div className="flex items-center space-x-4">
              {/* Track Info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {currentTrack.album?.images?.[2] && (
                  <img
                    src={currentTrack.album.images[2].url}
                    alt={currentTrack.album.name}
                    className="w-12 h-12 rounded-lg shadow-lg"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate">
                    {currentTrack.name}
                  </div>
                  <div className="text-gray-300 text-sm truncate">
                    {currentTrack.artists?.map((artist: any) => artist.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <motion.button
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>
                
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="hidden md:flex items-center space-x-3 flex-1 max-w-md">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div
                  className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div className="relative h-full">
                    <div
                      className="h-full bg-spotify-green rounded-full transition-all duration-100"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume Control */}
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div
                  className="w-20 h-1 bg-gray-600 rounded-full cursor-pointer group"
                  onClick={handleVolumeChange}
                >
                  <div className="relative h-full">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setCurrentTrack(null);
                  setPlaying(false);
                }}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                ×
              </button>
            </div>

            {/* Mobile Progress Bar */}
            <div className="md:hidden mt-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">
                  {formatTime(currentTime)}
                </span>
                <div
                  className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-spotify-green rounded-full"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Audio Visualizer */}
        {isPlaying && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
            <div className="flex items-end space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-spotify-green rounded-full audio-bar"
                  style={{ height: '4px' }}
                  animate={{
                    height: ['4px', '20px', '4px'],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
