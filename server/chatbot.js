const tmi    = require('tmi.js');
const fs     = require('fs');
const config = require('./config.js');

const opts = {
  identity: {
    username: 'tcsa-bot',
    password: config.TWITCH_IRC_TOKEN
  },
  channels: [
    'summit1g',
    'hirona',
    'moonmoon'
  ]
};

let messages = [];

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignore own messages

  const message = {
    channel: target,
    user_id: context['user-id'],
    display_name: context['display-name'],
    time_stamp: Date.now(),
    content: msg.trim()
  };

  messages.push(message);

  if (messages.length > 1000) {
    fs.appendFile('chatlog.txt',
      JSON.stringify(messages, null, 2) + ',\n',
      (err) => { if (err) console.log(err); });

    messages = [];
  }
}

function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}
