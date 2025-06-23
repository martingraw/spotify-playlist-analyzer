import { create } from 'zustand';
import { PlaylistAnalysis, UserProfile, SpotifyPlaylist } from '../types/spotify';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: UserProfile | null;
  
  // Current analysis
  currentAnalysis: PlaylistAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Playlist comparison
  comparisonPlaylists: PlaylistAnalysis[];
  
  // User playlists
  userPlaylists: SpotifyPlaylist[];
  
  // UI state
  theme: 'light' | 'dark';
  currentView: 'home' | 'analysis' | 'comparison' | 'profile';
  
  // Audio player
  currentTrack: any | null;
  isPlaying: boolean;
  volume: number;
  
  // Actions
  setAuthenticated: (isAuth: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setCurrentAnalysis: (analysis: PlaylistAnalysis | null) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  addComparisonPlaylist: (analysis: PlaylistAnalysis) => void;
  removeComparisonPlaylist: (playlistId: string) => void;
  clearComparison: () => void;
  setUserPlaylists: (playlists: SpotifyPlaylist[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentView: (view: 'home' | 'analysis' | 'comparison' | 'profile') => void;
  setCurrentTrack: (track: any | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  currentAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
  comparisonPlaylists: [],
  userPlaylists: [],
  theme: 'dark' as const,
  currentView: 'home' as const,
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setAuthenticated: (isAuth: boolean) => set({ isAuthenticated: isAuth }),
  
  setUser: (user: UserProfile | null) => set({ user }),
  
  setCurrentAnalysis: (analysis: PlaylistAnalysis | null) => 
    set({ currentAnalysis: analysis, analysisError: null }),
  
  setAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),
  
  setAnalysisError: (error: string | null) => 
    set({ analysisError: error, isAnalyzing: false }),
  
  addComparisonPlaylist: (analysis: PlaylistAnalysis) => {
    const { comparisonPlaylists } = get();
    // Limit to 3 playlists for comparison
    if (comparisonPlaylists.length >= 3) {
      set({ 
        comparisonPlaylists: [analysis, ...comparisonPlaylists.slice(0, 2)]
      });
    } else {
      set({ 
        comparisonPlaylists: [analysis, ...comparisonPlaylists]
      });
    }
  },
  
  removeComparisonPlaylist: (playlistId: string) => {
    const { comparisonPlaylists } = get();
    set({
      comparisonPlaylists: comparisonPlaylists.filter(
        p => p.playlist.id !== playlistId
      )
    });
  },
  
  clearComparison: () => set({ comparisonPlaylists: [] }),
  
  setUserPlaylists: (playlists: SpotifyPlaylist[]) => set({ userPlaylists: playlists }),
  
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Persist theme preference
    localStorage.setItem('theme', theme);
  },
  
  setCurrentView: (view: 'home' | 'analysis' | 'comparison' | 'profile') => 
    set({ currentView: view }),
  
  setCurrentTrack: (track: any | null) => set({ currentTrack: track }),
  
  setPlaying: (isPlaying: boolean) => set({ isPlaying }),
  
  setVolume: (volume: number) => {
    set({ volume });
    localStorage.setItem('volume', volume.toString());
  },
  
  reset: () => set(initialState),
}));

// Initialize theme from localStorage, defaulting to dark
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
if (savedTheme) {
  useStore.getState().setTheme(savedTheme);
} else {
  // Ensure dark theme is set as default for new users
  useStore.getState().setTheme('dark');
}

// Initialize volume from localStorage
const savedVolume = localStorage.getItem('volume');
if (savedVolume) {
  useStore.getState().setVolume(parseFloat(savedVolume));
}
