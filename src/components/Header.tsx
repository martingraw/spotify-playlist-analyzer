import React from 'react';
import { motion } from 'framer-motion';
import { Music, User, BarChart3, Sun, Moon, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { spotifyApi } from '../services/spotifyApi';

const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    isAuthenticated, 
    user, 
    theme, 
    setTheme,
    setAuthenticated,
    setUser,
    reset
  } = useStore();

  const handleLogin = () => {
    window.location.href = spotifyApi.getAuthUrl();
  };

  const handleLogout = () => {
    spotifyApi.logout();
    setAuthenticated(false);
    setUser(null);
    reset();
  };

  const navItems = [
    { id: 'home', label: 'Reset', icon: Music },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    ...(isAuthenticated ? [{ id: 'profile', label: 'Profile', icon: User }] : [])
  ];

  return (
    <header className="glass border-b border-white border-opacity-20 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              setCurrentView('home');
              reset();
            }}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src="./spotify-playlist-analyzer.png"
              alt="Spotify Playlist Analyzer Logo" 
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">
                Spotify Playlist Analyzer
              </h1>
              <p className="text-xs text-gray-300">
                Advanced Spotify Analytics
              </p>
            </div>
          </motion.button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home') {
                      setCurrentView('home');
                      reset();
                    } else {
                      setCurrentView(item.id as any);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* User section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.images && user.images.length > 0 ? (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full border-2 border-white border-opacity-20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-white font-medium hidden sm:block">
                    {user.display_name}
                  </span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={handleLogin}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login with Spotify
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center justify-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') {
                    setCurrentView('home');
                    reset();
                  } else {
                    setCurrentView(item.id as any);
                  }
                }}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
