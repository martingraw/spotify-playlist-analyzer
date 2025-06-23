import { SpotifyPlaylist, SpotifyTrack, AudioFeatures, PlaylistAnalysis, PlaylistComparison, RecommendedTrack, PlaylistRecommendations } from '../types/spotify';

class PlaylistAnalyzerService {
  // Main analysis function
  analyzePlaylist(playlist: SpotifyPlaylist, audioFeatures: AudioFeatures[], artistData: any[] = []): PlaylistAnalysis {
    const tracks = playlist.tracks.items.filter(item => item.track && item.track.id);
    
    return {
      playlist,
      audioFeatures,
      analysis: {
        totalTracks: tracks.length,
        totalArtists: this.getTotalArtists(tracks),
        totalFollowers: playlist.followers.total,
        averageDuration: this.calculateAverageDuration(tracks),
        averagePopularity: this.calculateAveragePopularity(tracks),
        averageTempo: this.calculateAverageTempo(audioFeatures),
        mostCommonKey: this.getMostCommonKey(audioFeatures),
        mostCommonGenre: this.getMostCommonGenre(tracks, artistData),
        mostCommonArtist: this.getMostCommonArtist(tracks),
        rating: this.calculatePlaylistRating(tracks, audioFeatures, artistData),
        moods: this.analyzeMoods(audioFeatures),
        genres: this.analyzeGenres(tracks, artistData),
        artists: this.analyzeArtists(tracks),
        decades: this.analyzeDecades(tracks),
        popularityDistribution: this.analyzePopularityDistribution(tracks)
      }
    };
  }

  // Calculate total unique artists
  private getTotalArtists(tracks: SpotifyTrack[]): number {
    const artistIds = new Set<string>();
    tracks.forEach(item => {
      item.track.artists.forEach(artist => {
        artistIds.add(artist.id);
      });
    });
    return artistIds.size;
  }

  // Calculate average duration in milliseconds
  private calculateAverageDuration(tracks: SpotifyTrack[]): number {
    const totalDuration = tracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
    return Math.round(totalDuration / tracks.length);
  }

  // Calculate average popularity
  private calculateAveragePopularity(tracks: SpotifyTrack[]): number {
    const totalPopularity = tracks.reduce((sum, item) => sum + item.track.popularity, 0);
    return Math.round(totalPopularity / tracks.length);
  }

  // Calculate average tempo
  private calculateAverageTempo(audioFeatures: AudioFeatures[]): number {
    if (audioFeatures.length === 0) return 0;
    const totalTempo = audioFeatures.reduce((sum, feature) => sum + feature.tempo, 0);
    return Math.round(totalTempo / audioFeatures.length);
  }

  // Get most common key
  private getMostCommonKey(audioFeatures: AudioFeatures[]): number {
    if (audioFeatures.length === 0) return 0;
    
    const keyCount: { [key: number]: number } = {};
    audioFeatures.forEach(feature => {
      keyCount[feature.key] = (keyCount[feature.key] || 0) + 1;
    });

    return parseInt(Object.keys(keyCount).reduce((a, b) => keyCount[parseInt(a)] > keyCount[parseInt(b)] ? a : b));
  }

  // Get most common genre
  private getMostCommonGenre(tracks: SpotifyTrack[], artistData: any[]): string {
    const genreCount: { [genre: string]: number } = {};
    
    artistData.forEach(artist => {
      if (artist.genres) {
        artist.genres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const sortedGenres = Object.entries(genreCount).sort(([,a], [,b]) => b - a);
    return sortedGenres.length > 0 ? sortedGenres[0][0] : 'Unknown';
  }

  // Get most common artist
  private getMostCommonArtist(tracks: SpotifyTrack[]): string {
    const artistCount: { [artist: string]: number } = {};
    
    tracks.forEach(item => {
      item.track.artists.forEach(artist => {
        artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
      });
    });

    const sortedArtists = Object.entries(artistCount).sort(([,a], [,b]) => b - a);
    return sortedArtists.length > 0 ? sortedArtists[0][0] : 'Unknown';
  }

  // Calculate playlist rating (0-5 scale)
  private calculatePlaylistRating(tracks: SpotifyTrack[], audioFeatures: AudioFeatures[], artistData: any[]): number {
    let score = 0;
    let maxScore = 0;

    // Factor 1: Artist diversity (max 1.5 points)
    const artistRepetition = this.calculateArtistRepetition(tracks);
    score += Math.max(0, 1.5 - (artistRepetition - 1) * 0.3);
    maxScore += 1.5;

    // Factor 2: Genre diversity (max 1 point)
    const genreDiversity = this.calculateGenreDiversity(artistData);
    score += Math.min(1, genreDiversity * 0.2);
    maxScore += 1;

    // Factor 3: Popularity variety (max 1 point)
    const popularityVariety = this.calculatePopularityVariety(tracks);
    score += popularityVariety;
    maxScore += 1;

    // Factor 4: Playlist length (max 1 point)
    const lengthScore = this.calculateLengthScore(tracks.length);
    score += lengthScore;
    maxScore += 1;

    // Factor 5: Audio feature balance (max 0.5 points)
    const balanceScore = this.calculateAudioFeatureBalance(audioFeatures);
    score += balanceScore;
    maxScore += 0.5;

    return Math.min(5, Math.max(0, (score / maxScore) * 5));
  }

  private calculateArtistRepetition(tracks: SpotifyTrack[]): number {
    const artistCount: { [artist: string]: number } = {};
    tracks.forEach(item => {
      item.track.artists.forEach(artist => {
        artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
      });
    });

    const repetitions = Object.values(artistCount);
    return repetitions.reduce((sum, count) => sum + count, 0) / repetitions.length;
  }

  private calculateGenreDiversity(artistData: any[]): number {
    const genres = new Set<string>();
    artistData.forEach(artist => {
      if (artist.genres) {
        artist.genres.forEach((genre: string) => genres.add(genre));
      }
    });
    return genres.size;
  }

  private calculatePopularityVariety(tracks: SpotifyTrack[]): number {
    const popularities = tracks.map(item => item.track.popularity);
    const min = Math.min(...popularities);
    const max = Math.max(...popularities);
    const range = max - min;
    
    // Good variety is a range of at least 40 points
    return Math.min(1, range / 40);
  }

  private calculateLengthScore(trackCount: number): number {
    if (trackCount < 10) return 0.2;
    if (trackCount < 30) return 0.5;
    if (trackCount < 50) return 0.8;
    return 1;
  }

  private calculateAudioFeatureBalance(audioFeatures: AudioFeatures[]): number {
    if (audioFeatures.length === 0) return 0;

    const features = ['danceability', 'energy', 'valence', 'acousticness'] as const;
    let balanceScore = 0;

    features.forEach(feature => {
      const values = audioFeatures.map(f => f[feature]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Good balance means not too extreme in any direction
      balanceScore += Math.max(0, 0.125 - Math.abs(mean - 0.5) * 0.25);
    });

    return balanceScore;
  }

  // Analyze moods based on audio features
  private analyzeMoods(audioFeatures: AudioFeatures[]) {
    if (audioFeatures.length === 0) {
      return {
        happiness: 0,
        danceability: 0,
        energy: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        speechiness: 0
      };
    }

    const averages = {
      happiness: this.calculateAverage(audioFeatures, 'valence'),
      danceability: this.calculateAverage(audioFeatures, 'danceability'),
      energy: this.calculateAverage(audioFeatures, 'energy'),
      acousticness: this.calculateAverage(audioFeatures, 'acousticness'),
      instrumentalness: this.calculateAverage(audioFeatures, 'instrumentalness'),
      liveness: this.calculateAverage(audioFeatures, 'liveness'),
      speechiness: this.calculateAverage(audioFeatures, 'speechiness')
    };

    return averages;
  }

  private calculateAverage(audioFeatures: AudioFeatures[], feature: keyof AudioFeatures): number {
    const sum = audioFeatures.reduce((total, f) => total + (f[feature] as number), 0);
    return Math.round((sum / audioFeatures.length) * 100) / 100;
  }

  // Analyze genres
  private analyzeGenres(tracks: SpotifyTrack[], artistData: any[]) {
    const genreCount: { [genre: string]: number } = {};
    
    artistData.forEach(artist => {
      if (artist.genres) {
        artist.genres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const totalGenreOccurrences = Object.values(genreCount).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(genreCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalGenreOccurrences) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 genres
  }

  // Analyze artists
  private analyzeArtists(tracks: SpotifyTrack[]) {
    const artistCount: { [artist: string]: number } = {};
    
    tracks.forEach(item => {
      item.track.artists.forEach(artist => {
        artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
      });
    });

    const totalTracks = tracks.length;
    
    return Object.entries(artistCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalTracks) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 artists
  }

  // Analyze decades
  private analyzeDecades(tracks: SpotifyTrack[]) {
    const decadeCount: { [decade: string]: number } = {};
    
    tracks.forEach(item => {
      const releaseYear = parseInt(item.track.album.release_date.substring(0, 4));
      const decade = `${Math.floor(releaseYear / 10) * 10}s`;
      decadeCount[decade] = (decadeCount[decade] || 0) + 1;
    });

    const totalTracks = tracks.length;
    
    return Object.entries(decadeCount)
      .map(([decade, count]) => ({
        decade,
        count,
        percentage: Math.round((count / totalTracks) * 100)
      }))
      .sort((a, b) => {
        const yearA = parseInt(a.decade.substring(0, 4));
        const yearB = parseInt(b.decade.substring(0, 4));
        return yearB - yearA;
      });
  }

  // Analyze popularity distribution
  private analyzePopularityDistribution(tracks: SpotifyTrack[]) {
    const distribution = {
      veryPopular: 0, // 80-100
      popular: 0,     // 60-79
      moderate: 0,    // 40-59
      underground: 0  // 0-39
    };

    tracks.forEach(item => {
      const popularity = item.track.popularity;
      if (popularity >= 80) distribution.veryPopular++;
      else if (popularity >= 60) distribution.popular++;
      else if (popularity >= 40) distribution.moderate++;
      else distribution.underground++;
    });

    return distribution;
  }

  // Compare two playlists
  comparePlaylists(analysis1: PlaylistAnalysis, analysis2: PlaylistAnalysis): PlaylistComparison {
    const similarities = {
      genreOverlap: this.calculateGenreOverlap(analysis1.analysis.genres, analysis2.analysis.genres),
      moodSimilarity: this.calculateMoodSimilarity(analysis1.analysis.moods, analysis2.analysis.moods),
      tempoSimilarity: this.calculateTempoSimilarity(analysis1.analysis.averageTempo, analysis2.analysis.averageTempo),
      popularitySimilarity: this.calculatePopularitySimilarity(analysis1.analysis.averagePopularity, analysis2.analysis.averagePopularity),
      overallSimilarity: 0
    };

    similarities.overallSimilarity = (
      similarities.genreOverlap +
      similarities.moodSimilarity +
      similarities.tempoSimilarity +
      similarities.popularitySimilarity
    ) / 4;

    const differences = {
      energyDifference: Math.abs(analysis1.analysis.moods.energy - analysis2.analysis.moods.energy),
      danceabilityDifference: Math.abs(analysis1.analysis.moods.danceability - analysis2.analysis.moods.danceability),
      acousticnessDifference: Math.abs(analysis1.analysis.moods.acousticness - analysis2.analysis.moods.acousticness),
      valenceDifference: Math.abs(analysis1.analysis.moods.happiness - analysis2.analysis.moods.happiness)
    };

    return {
      playlist1: analysis1,
      playlist2: analysis2,
      similarities,
      differences
    };
  }

  private calculateGenreOverlap(genres1: any[], genres2: any[]): number {
    const set1 = new Set(genres1.map(g => g.name));
    const set2 = new Set(genres2.map(g => g.name));
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateMoodSimilarity(moods1: any, moods2: any): number {
    const features = ['happiness', 'danceability', 'energy', 'acousticness'];
    let totalSimilarity = 0;

    features.forEach(feature => {
      const diff = Math.abs(moods1[feature] - moods2[feature]);
      totalSimilarity += 1 - diff; // Convert difference to similarity
    });

    return totalSimilarity / features.length;
  }

  private calculateTempoSimilarity(tempo1: number, tempo2: number): number {
    const diff = Math.abs(tempo1 - tempo2);
    const maxDiff = 100; // Assume max meaningful difference is 100 BPM
    return Math.max(0, 1 - (diff / maxDiff));
  }

  private calculatePopularitySimilarity(pop1: number, pop2: number): number {
    const diff = Math.abs(pop1 - pop2);
    const maxDiff = 100; // Max difference is 100 points
    return Math.max(0, 1 - (diff / maxDiff));
  }

  // Generate recommendations for improving a playlist
  generateRecommendations(analysis: PlaylistAnalysis): PlaylistRecommendations {
    const tracksToRemove: Array<{
      track: SpotifyTrack['track'];
      reason: string;
    }> = [];
    const reorderSuggestions: Array<{
      trackId: string;
      currentPosition: number;
      suggestedPosition: number;
      reason: string;
    }> = [];

    // Find tracks that might not fit well
    const tracks = analysis.playlist.tracks.items;
    const avgPopularity = analysis.analysis.averagePopularity;
    const avgEnergy = analysis.analysis.moods.energy;

    // Suggest removing tracks that are outliers
    tracks.forEach((item, index) => {
      if (item.track) {
        const popularityDiff = Math.abs(item.track.popularity - avgPopularity);
        if (popularityDiff > 40) {
          tracksToRemove.push({
            track: item.track,
            reason: `Popularity (${item.track.popularity}) differs significantly from playlist average (${avgPopularity})`
          });
        }
      }
    });

    // Suggest reordering for better flow
    // This is a simplified example - in practice, you'd use more sophisticated algorithms
    tracks.forEach((item, index) => {
      if (index > 0 && index < tracks.length - 1 && item.track) {
        // Simple energy flow check
        const prevTrack = tracks[index - 1].track;
        const nextTrack = tracks[index + 1].track;
        
        if (prevTrack && nextTrack) {
          // This would require audio features for each track to be meaningful
          // For now, just a placeholder suggestion
          if (Math.random() > 0.9) { // Random suggestion for demo
            reorderSuggestions.push({
              trackId: item.track.id,
              currentPosition: index,
              suggestedPosition: Math.max(0, index - 2),
              reason: 'Better energy flow'
            });
          }
        }
      }
    });

    return {
      tracksToAdd: [], // Would be populated with actual recommendations
      tracksToRemove: tracksToRemove.slice(0, 5), // Limit to 5 suggestions
      reorderSuggestions: reorderSuggestions.slice(0, 3) // Limit to 3 suggestions
    };
  }

  // Utility function to format duration
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Utility function to get key name
  getKeyName(key: number): string {
    const keys = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    return keys[key] || 'Unknown';
  }

  // Utility function to get mood description
  getMoodDescription(value: number): string {
    if (value >= 0.8) return 'Very High';
    if (value >= 0.6) return 'High';
    if (value >= 0.4) return 'Moderate';
    if (value >= 0.2) return 'Low';
    return 'Very Low';
  }
}

export const playlistAnalyzer = new PlaylistAnalyzerService();
