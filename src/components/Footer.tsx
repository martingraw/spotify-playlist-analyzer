import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass border-t border-white border-opacity-20 mt-16">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Main Content */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Music className="w-4 h-4 text-brand-green" />
            <span className="text-gray-300 text-sm">Crafted with passion for music lovers</span>
          </div>

          {/* Creator Credit */}
          <motion.div
            className="flex items-center justify-center space-x-2 mb-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-400 text-sm">Made with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-gray-400 text-sm">by</span>
            <motion.a
              href="https://www.jscalco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green font-semibold hover:text-green-400 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              J.Scalco
            </motion.a>
          </motion.div>

          {/* Copyright */}
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Spotify Playlist Analyzer. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
