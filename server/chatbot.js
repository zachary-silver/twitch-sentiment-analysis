const tmi    = require('tmi.js');
const config = require('./config.js');

const opts = {
  identity: {
    username: 'bot',
    password: config.IRC_TOKEN
  },
  channels: [
    'summit1g'
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignore own messages

  //client.say(target, `You said: ${msg}`);
  console.log(`${target}: ${msg.trim()}`);
}

function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}
