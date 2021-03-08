const TWITCH_API_URL           = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL          = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL         = 'https://id.twitch.tv/oauth2/token';
const TWITCH_CLIENT_ID         = '';
const TWITCH_SECRET            = '';
const TWITCH_IRC_TOKEN         = '';
const TWITCH_CHATBOT_CLIENT_ID = '';
const TWITCH_CHATBOT_SECRET    = '';
const SESSION_SECRET           = '';
const CALLBACK_URL             = '';
const PORT                     = process.env.PORT || 5000;

module.exports = {
  TWITCH_API_URL,
  TWITCH_AUTH_URL,
  TWITCH_TOKEN_URL,
  TWITCH_CLIENT_ID,
  TWITCH_SECRET,
  TWITCH_IRC_TOKEN,
  TWITCH_CHATBOT_CLIENT_ID,
  TWITCH_CHATBOT_SECRET,
  SESSION_SECRET,
  CALLBACK_URL,
  PORT
};
