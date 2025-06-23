const axios = require('axios');

// Environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let appToken = null;
let tokenExpires = 0;

// Helper: Get app access token (Client Credentials Flow)
async function getAppToken() {
  if (appToken && Date.now() < tokenExpires) {
    return appToken;
  }
  
  try {
    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
        }
      }
    );
    appToken = resp.data.access_token;
    tokenExpires = Date.now() + (resp.data.expires_in - 60) * 1000;
    return appToken;
  } catch (error) {
    console.error('Token error:', error.response?.data || error.message);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/playlist', '');
    const pathParts = path.split('/').filter(p => p);
    
    if (pathParts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Playlist ID required' })
      };
    }

    const playlistId = pathParts[0];
    const isTracksRequest = pathParts[1] === 'tracks';
    
    const token = await getAppToken();

    if (isTracksRequest) {
      // Get playlist tracks
      let tracks = [];
      let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&market=US`;
      
      while (url) {
        const resp = await axios.get(url, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        tracks = tracks.concat(resp.data.items);
        url = resp.data.next;
      }
      
      // Process tracks with Deezer fallback for previews
      const tracksWithPreviews = await Promise.all(tracks.map(async (item) => {
        if (!item.track || !item.track.id) return item;
        
        let previewUrl = item.track.preview_url;
        let previewSource = 'spotify';
        
        // If no Spotify preview, try Deezer fallback
        if (!previewUrl && item.track.artists && item.track.artists.length > 0) {
          try {
            const artist = item.track.artists[0].name;
            const title = item.track.name;
            
            const deezerResponse = await axios.get('https://api.deezer.com/search', {
              params: {
                q: `artist:"${artist}" track:"${title}"`,
                limit: 1
              },
              timeout: 3000
            });
            
            if (deezerResponse.data.data && deezerResponse.data.data.length > 0) {
              const track = deezerResponse.data.data[0];
              previewUrl = track.preview;
              previewSource = 'deezer';
            }
          } catch (deezerError) {
            // Silently fail Deezer fallback
          }
        }
        
        return {
          ...item,
          track: {
            ...item.track,
            preview_url: previewUrl,
            preview_source: previewSource
          }
        };
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ items: tracksWithPreviews })
      };
    } else {
      // Get playlist info
      const playlistResp = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            market: 'US',
            fields: 'id,name,description,owner,followers,images,tracks.total,external_urls'
          }
        }
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(playlistResp.data)
      };
    }
  } catch (error) {
    console.error('Function error:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.message, 
        details: error.response?.data 
      })
    };
  }
};
