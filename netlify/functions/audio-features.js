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
    const { ids } = event.queryStringParameters || {};
    
    if (!ids) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Track IDs required' })
      };
    }
    
    const token = await getAppToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        params: { ids }
      }
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Audio features error:', error.response?.data || error.message);
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
