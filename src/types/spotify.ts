export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
  };
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
    items: SpotifyTrack[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    artists: Array<{
      id: string;
      name: string;
      genres?: string[];
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
      release_date: string;
    };
    duration_ms: number;
    popularity: number;
    preview_url: string | null;
    external_urls: {
      spotify: string;
    };
  };
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
}

export interface PlaylistAnalysis {
  playlist: SpotifyPlaylist;
  audioFeatures: AudioFeatures[];
  analysis: {
    totalTracks: number;
    totalArtists: number;
    totalFollowers: number;
    averageDuration: number;
    averagePopularity: number;
    averageTempo: number;
    mostCommonKey: number;
    mostCommonGenre: string;
    mostCommonArtist: string;
    rating: number;
    moods: {
      happiness: number;
      danceability: number;
      energy: number;
      acousticness: number;
      instrumentalness: number;
      liveness: number;
      speechiness: number;
    };
    genres: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    artists: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    decades: Array<{
      decade: string;
      count: number;
      percentage: number;
    }>;
    popularityDistribution: {
      veryPopular: number; // 80-100
      popular: number; // 60-79
      moderate: number; // 40-59
      underground: number; // 0-39
    };
  };
}

export interface PlaylistComparison {
  playlist1: PlaylistAnalysis;
  playlist2: PlaylistAnalysis;
  similarities: {
    genreOverlap: number;
    moodSimilarity: number;
    tempoSimilarity: number;
    popularitySimilarity: number;
    overallSimilarity: number;
  };
  differences: {
    energyDifference: number;
    danceabilityDifference: number;
    acousticnessDifference: number;
    valenceDifference: number;
  };
}

export interface RecommendedTrack {
  track: SpotifyTrack['track'];
  reason: string;
  similarity: number;
}

export interface PlaylistRecommendations {
  tracksToAdd: RecommendedTrack[];
  tracksToRemove: Array<{
    track: SpotifyTrack['track'];
    reason: string;
  }>;
  reorderSuggestions: Array<{
    trackId: string;
    currentPosition: number;
    suggestedPosition: number;
    reason: string;
  }>;
}

export interface SimilarPlaylist {
  playlist: {
    id: string;
    name: string;
    owner: string;
    image: string;
    trackCount: number;
    followers: number;
  };
  similarity: number;
  commonGenres: string[];
  commonArtists: string[];
}

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
  }>;
  followers: {
    total: number;
  };
  country: string;
}

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

// Utility types for UI components
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface FilterOptions {
  genres: string[];
  artists: string[];
  decades: string[];
  minPopularity: number;
  maxPopularity: number;
  minTempo: number;
  maxTempo: number;
  minEnergy: number;
  maxEnergy: number;
  minDanceability: number;
  maxDanceability: number;
}

export interface PlaylistFilter {
  searchTerm: string;
  selectedGenres: string[];
  selectedArtists: string[];
  selectedDecades: string[];
  popularityRange: [number, number];
  tempoRange: [number, number];
  energyRange: [number, number];
  danceabilityRange: [number, number];
}
