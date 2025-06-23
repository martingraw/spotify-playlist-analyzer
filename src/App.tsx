import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { spotifyApi } from './services/spotifyApi';
import Header from './components/Header';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Comparison from './components/Comparison';
import Profile from './components/Profile';
import AudioPlayer from './components/AudioPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import './App.css';

function App() {
  const { 
    currentView, 
    isAuthenticated, 
    setAuthenticated, 
    setUser,
    theme 
  } = useStore();

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      if (spotifyApi.isAuthenticated()) {
        setAuthenticated(true);
        try {
          const userProfile = await spotifyApi.getUserProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, [setAuthenticated, setUser]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'analysis':
        return <Analysis />;
      case 'comparison':
        return <Comparison />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-brand-teal via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-teal-50 to-gray-50'
    }`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: theme === 'dark'
            ? `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 25% 25%, rgba(0,0,0,0.05) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(0,0,0,0.05) 0%, transparent 50%)`
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />

        {/* Audio Player - Fixed at bottom */}
        <AudioPlayer />
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {useStore(state => state.isAnalyzing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          >
            <div className="glass rounded-2xl p-8 text-center mx-4 max-w-md">
              <LoadingSpinner size="large" />
              <p className="text-white mt-4 text-lg">Analyzing your playlist...</p>
              <p className="text-gray-300 mt-2">This may take a few moments</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {useStore(state => state.analysisError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          >
            <div className="glass rounded-2xl p-8 text-center mx-4 max-w-md">
              <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-white mt-4 text-lg font-semibold">Analysis Failed</p>
              <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                {useStore(state => state.analysisError)}
              </p>
              <button
                onClick={() => useStore.getState().setAnalysisError(null)}
                className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
