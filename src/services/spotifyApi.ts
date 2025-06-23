import axios from 'axios';
import { SpotifyPlaylist, SpotifyTrack, AudioFeatures, UserProfile, SpotifyError } from '../types/spotify';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || '6c7b6d3b6b664a6da765220627457202';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000';

class SpotifyApiService {
  private accessToken: string | null = null;

  constructor() {
    // Check for access token in localStorage or URL hash
    this.accessToken = localStorage.getItem('spotify_access_token');
    if (!this.accessToken) {
      this.handleAuthCallback();
    }
  }

  // Authentication methods
  getAuthUrl(): string {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'token',
      redirect_uri: REDIRECT_URI,
      scope: scopes,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  handleAuthCallback(): void {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken) {
      this.accessToken = accessToken;
      localStorage.setItem('spotify_access_token', accessToken);
      
      if (expiresIn) {
        const expirationTime = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem('spotify_token_expiration', expirationTime.toString());
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  isAuthenticated(): boolean {
    if (!this.accessToken) return false;

    const expiration = localStorage.getItem('spotify_token_expiration');
    if (expiration && Date.now() > parseInt(expiration)) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiration');
  }

  // Get client credentials token for public API access
  private async getClientCredentialsToken(): Promise<string | null> {
    if (!CLIENT_ID) {
      return null;
    }

    try {
      // Note: Client credentials flow requires client secret, which can't be stored in frontend
      // For now, we'll return null and require user authentication
      // In production, this should be handled by a backend service
      return null;
    } catch (error) {
      console.warn('Failed to get client credentials token:', error);
      return null;
    }
  }

  // API request helper
  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${SPOTIFY_BASE_URL}${endpoint}`, {
        headers: this.accessToken ? {
          'Authorization': `Bearer ${this.accessToken}`
        } : {},
        params
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        throw new Error('Authentication required');
      }
      throw error;
    }
  }

  // Extract playlist ID from Spotify URL
  extractPlaylistId(url: string): string | null {
    const patterns = [
      /spotify:playlist:([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)(?:\?.*)?/,
      /^([a-zA-Z0-9]+)$/ // Direct ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  // Get playlist data (requires real data - no mock fallbacks)
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    // Try with user authentication first if available
    if (this.accessToken) {
      try {
        const response = await axios.get(`${SPOTIFY_BASE_URL}/playlists/${playlistId}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
        return response.data;
      } catch (authError: any) {
        console.warn('User auth failed, trying Netlify Functions:', authError.message);
      }
    }
    
    // Try Netlify Functions for public playlists
    try {
      const response = await axios.get(`/.netlify/functions/playlist/${playlistId}`);
      return response.data;
    } catch (functionError: any) {
      console.error('Netlify Function failed:', functionError.message);
      throw new Error(`Unable to access playlist. This may be due to Spotify API restrictions. Please try logging in with Spotify or use a different playlist.`);
    }
  }

  // Mock playlist data for demo purposes
  private getMockPlaylistData(playlistId: string): SpotifyPlaylist {
    return {
      id: playlistId,
      name: "Today's Top Hits",
      description: "The biggest songs right now. Cover: Sabrina Carpenter",
      owner: {
        id: "spotify",
        display_name: "Spotify"
      },
      followers: {
        total: 32500000
      },
      images: [
        {
          url: "https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc",
          height: 640,
          width: 640
        }
      ],
      tracks: {
        total: 50,
        items: []
      },
      external_urls: {
        spotify: `https://open.spotify.com/playlist/${playlistId}`
      }
    };
  }

  // Get all tracks from a playlist (uses proxy server for public access or user auth for private)
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    try {
      // Try with user authentication first (for private playlists)
      if (this.accessToken) {
        const tracks: SpotifyTrack[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
          const response = await axios.get(`${SPOTIFY_BASE_URL}/playlists/${playlistId}/tracks`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            },
            params: { offset, limit }
          });

          tracks.push(...response.data.items);

          if (response.data.items.length < limit) break;
          offset += limit;
        }

      // Use direct Spotify preview URLs for all tracks (no proxy for previews)
      return tracks.map((item: any) => {
        console.log('Original track preview_url from Spotify API:', item.track.preview_url);
        return {
          ...item,
          track: {
            ...item.track,
            preview_url: item.track.preview_url
              ? `${item.track.preview_url}?cid=6c7b6d3b6b664a6da765220627457202`
              : null
          }
        };
      });
      }

      // Use Netlify Functions for public playlist access (no login required)
      const response = await axios.get(`/.netlify/functions/playlist/${playlistId}/tracks`);
      const tracks = response.data.items.filter((item: any) => item.track && item.track.id);
      
      // Use Spotify preview URLs with Deezer fallback
      const tracksWithPreviews = await Promise.all(tracks.map(async (item: any) => {
        console.log('Original track preview_url from proxy server:', item.track.preview_url);
        
        let previewUrl = item.track.preview_url;
        let previewSource = 'spotify';
        
        // If no Spotify preview, try Deezer fallback
        if (!previewUrl && item.track.artists && item.track.artists.length > 0) {
          try {
            const artist = item.track.artists[0].name;
            const title = item.track.name;
            
            console.log(`No Spotify preview for "${title}" by ${artist}, searching Deezer...`);
            
            const deezerResponse = await axios.get('http://localhost:5001/api/deezer/search', {
              params: { artist, title }
            });
            
            if (deezerResponse.data.preview_url) {
              previewUrl = deezerResponse.data.preview_url;
              previewSource = 'deezer';
              console.log(`Found Deezer preview for "${title}"`);
            }
          } catch (error: any) {
            console.warn(`Deezer fallback failed for "${item.track.name}":`, error.message);
          }
        }
        
        return {
          ...item,
          track: {
            ...item.track,
            preview_url: previewUrl,
            preview_source: previewSource // Add source indicator
          }
        };
      }));
      
      return tracksWithPreviews;
    } catch (error: any) {
      console.error('Failed to fetch playlist tracks:', error.message);
      throw new Error(`Unable to access playlist tracks. This may be due to Spotify API restrictions. Please try logging in with Spotify or use a different playlist.`);
    }
  }

  // Mock tracks data for demo purposes
  private getMockTracks(): SpotifyTrack[] {
    return [
      {
        track: {
          id: "4iV5W9uYEdYUVa79Axb7Rh",
          name: "Flowers",
          artists: [{ id: "5YGY8feqx7naU7z4HrwZM6", name: "Miley Cyrus" }],
          album: {
            id: "1H0jmOKOAFNVKlMZrpUXgH",
            name: "Endless Summer Vacation",
            images: [
              { url: "https://i.scdn.co/image/ab67616d0000b273f4d5c528b6c8b0f5b4e8c123", height: 640, width: 640 }
            ],
            release_date: "2023-03-10"
          },
          duration_ms: 200000,
          popularity: 95,
          preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          external_urls: { spotify: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" }
        }
      },
      {
        track: {
          id: "1BxfuPKGuaTgP7aM0Bbdwr",
          name: "Cruel Summer",
          artists: [{ id: "06HL4z0CvFAxyc27GXpf02", name: "Taylor Swift" }],
          album: {
            id: "1NAmidJlEaVgA3MpcPFYGq",
            name: "Lover",
            images: [
              { url: "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647", height: 640, width: 640 }
            ],
            release_date: "2019-08-23"
          },
          duration_ms: 178426,
          popularity: 92,
          preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          external_urls: { spotify: "https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr" }
        }
      },
      {
        track: {
          id: "7qiZfU4dY1lWllzX7mPBI3",
          name: "Shape of You",
          artists: [{ id: "6eUKZXaKkcviH0Ku9w2n3V", name: "Ed Sheeran" }],
          album: {
            id: "3T4tUhGYeRNVUGevb0wThu",
            name: "÷ (Deluxe)",
            images: [
              { url: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96", height: 640, width: 640 }
            ],
            release_date: "2017-03-03"
          },
          duration_ms: 233713,
          popularity: 88,
          preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          external_urls: { spotify: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3" }
        }
      },
      {
        track: {
          id: "4LRPiXqCikLlN15c3yImP7",
          name: "As It Was",
          artists: [{ id: "6KImCVD70vtIoJWnq6nGn3", name: "Harry Styles" }],
          album: {
            id: "5r36AJ6VOJtp00oxSkBZ5h",
            name: "Harry's House",
            images: [
              { url: "https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0", height: 640, width: 640 }
            ],
            release_date: "2022-05-20"
          },
          duration_ms: 167303,
          popularity: 90,
          preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          external_urls: { spotify: "https://open.spotify.com/track/4LRPiXqCikLlN15c3yImP7" }
        }
      },
      {
        track: {
          id: "1r9xUipOqoNwggBpENDsvJ",
          name: "Anti-Hero",
          artists: [{ id: "06HL4z0CvFAxyc27GXpf02", name: "Taylor Swift" }],
          album: {
            id: "151w1FgRZfnKZA9FEw3JkN",
            name: "Midnights",
            images: [
              { url: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5", height: 640, width: 640 }
            ],
            release_date: "2022-10-21"
          },
          duration_ms: 200690,
          popularity: 94,
          preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          external_urls: { spotify: "https://open.spotify.com/track/1r9xUipOqoNwggBpENDsvJ" }
        }
      }
    ];
  }

  // Get audio features for tracks (uses proxy server for public access or user auth for private)
  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    const features: AudioFeatures[] = [];
    const batchSize = 100; // Spotify API limit

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      
      try {
        if (this.isAuthenticated()) {
          // Use user authentication
          const response = await this.makeRequest<{ audio_features: AudioFeatures[] }>(
            '/audio-features',
            { ids: batch.join(',') }
          );
          features.push(...response.audio_features.filter(f => f !== null));
        } else {
          // Skip proxy server for audio features - always use mock data for non-authenticated users
          console.warn('Audio features require authentication, using mock data for batch:', batch);
          features.push(...this.getMockAudioFeatures(batch));
          continue;
        }
      } catch (error) {
        console.warn('Failed to fetch audio features for batch:', error);
        // Return mock data as fallback
        features.push(...this.getMockAudioFeatures(batch));
      }
    }

    return features;
  }

  // Mock audio features for demo
  private getMockAudioFeatures(trackIds: string[]): AudioFeatures[] {
    return trackIds.map((id, index) => ({
      id,
      danceability: Math.max(0.1, Math.min(0.9, 0.65 + (Math.sin(index) * 0.25))),
      energy: Math.max(0.1, Math.min(0.9, 0.75 + (Math.cos(index) * 0.2))),
      key: index % 12,
      loudness: -8 + (index % 5),
      mode: index % 2,
      speechiness: Math.max(0.05, Math.min(0.4, 0.15 + (index % 3) * 0.08)),
      acousticness: Math.max(0.1, Math.min(0.8, 0.35 + (Math.sin(index * 2) * 0.3))),
      instrumentalness: Math.max(0.0, Math.min(0.6, 0.2 + (index % 4) * 0.15)),
      liveness: Math.max(0.05, Math.min(0.5, 0.25 + (Math.cos(index * 3) * 0.2))),
      valence: Math.max(0.2, Math.min(0.9, 0.6 + (Math.sin(index * 1.5) * 0.3))),
      tempo: 110 + (index % 80) + Math.random() * 20,
      duration_ms: 180000 + (index % 60000),
      time_signature: 4
    }));
  }

  // Get artist information (including genres) - uses proxy server for public access or user auth for private
  async getArtists(artistIds: string[]): Promise<any[]> {
    const artists: any[] = [];
    const batchSize = 50; // Spotify API limit

    for (let i = 0; i < artistIds.length; i += batchSize) {
      const batch = artistIds.slice(i, i + batchSize);
      
      try {
        if (this.isAuthenticated()) {
          // Use user authentication
          const response = await axios.get(`${SPOTIFY_BASE_URL}/artists`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            },
            params: { ids: batch.join(',') }
          });
          artists.push(...response.data.artists);
        } else {
          // Use proxy server for public access
          const response = await axios.get(`http://localhost:5001/api/artists`, {
            params: { ids: batch.join(',') }
          });
          artists.push(...response.data.artists);
        }
      } catch (error: any) {
        console.warn('Failed to fetch artist data for batch:', error);
        // Return mock data as fallback
        artists.push(...this.getMockArtists(batch));
      }
    }

    return artists;
  }

  // Mock artist data for demo
  private getMockArtists(artistIds: string[]): any[] {
    const mockArtistData = [
      { id: "5YGY8feqx7naU7z4HrwZM6", name: "Miley Cyrus", genres: ["pop", "dance pop", "electropop"] },
      { id: "06HL4z0CvFAxyc27GXpf02", name: "Taylor Swift", genres: ["pop", "country pop", "indie folk"] },
      { id: "6eUKZXaKkcviH0Ku9w2n3V", name: "Ed Sheeran", genres: ["pop", "singer-songwriter", "acoustic pop"] },
      { id: "6KImCVD70vtIoJWnq6nGn3", name: "Harry Styles", genres: ["pop rock", "indie pop", "soft rock"] },
      { id: "1uNFoZAHBGtllmzznpCI3s", name: "Justin Bieber", genres: ["pop", "teen pop", "dance pop"] }
    ];
    
    return artistIds.map((id, index) => {
      if (index < mockArtistData.length) {
        return mockArtistData[index];
      }
      // Fallback for additional artists
      const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'indie', 'country', 'r&b', 'alternative'];
      return {
        id,
        name: `Artist ${index + 1}`,
        genres: [genres[index % genres.length], genres[(index + 1) % genres.length]]
      };
    });
  }

  // Get user's playlists (requires authentication)
  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const playlists: SpotifyPlaylist[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.makeRequest<{ items: SpotifyPlaylist[] }>(
        '/me/playlists',
        { offset, limit }
      );

      playlists.push(...response.items);

      if (response.items.length < limit) break;
      offset += limit;
    }

    return playlists;
  }

  // Get user profile (requires authentication)
  async getUserProfile(): Promise<UserProfile> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<UserProfile>('/me');
  }

  // Search for playlists
  async searchPlaylists(query: string, limit: number = 20): Promise<SpotifyPlaylist[]> {
    try {
      const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
        headers: this.accessToken ? {
          'Authorization': `Bearer ${this.accessToken}`
        } : {},
        params: {
          q: query,
          type: 'playlist',
          limit
        }
      });
      return response.data.playlists.items;
    } catch (error) {
      console.warn('Search failed:', error);
      return [];
    }
  }

  // Get track recommendations
  async getRecommendations(params: {
    seed_artists?: string[];
    seed_genres?: string[];
    seed_tracks?: string[];
    target_danceability?: number;
    target_energy?: number;
    target_valence?: number;
    target_tempo?: number;
    limit?: number;
  }): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required for recommendations');
    }

    return this.makeRequest('/recommendations', params);
  }

  // Create a new playlist (requires authentication)
  async createPlaylist(userId: string, name: string, description?: string, isPublic: boolean = true): Promise<SpotifyPlaylist> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${SPOTIFY_BASE_URL}/users/${userId}/playlists`,
      {
        name,
        description,
        public: isPublic
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  // Add tracks to playlist (requires authentication)
  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const batchSize = 100;
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      await axios.post(
        `${SPOTIFY_BASE_URL}/playlists/${playlistId}/tracks`,
        { uris: batch },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
}

export const spotifyApi = new SpotifyApiService();
