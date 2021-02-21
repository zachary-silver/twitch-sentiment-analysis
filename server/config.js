const TWITCH_API_URL   = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL  = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_CLIENT_ID = 'rxnr4dqzjxxde5n1a913vu7k07hv5b';
const TWITCH_SECRET    = 'vzw7zod8u2ij9kxn8aolbjijs1y0b1';
const SESSION_SECRET   = 'sentiment secret';
const CALLBACK_URL     = 'http://localhost:3000/twitch/auth/callback';
const PORT             = process.env.PORT || 3000;

module.exports = {
  TWITCH_API_URL,
  TWITCH_AUTH_URL,
  TWITCH_TOKEN_URL,
  TWITCH_CLIENT_ID,
  TWITCH_SECRET,
  SESSION_SECRET,
  CALLBACK_URL,
  PORT
};
