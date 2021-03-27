const tmi    = require('tmi.js');
const fs     = require('fs');
const config = require('./config.js');
const db     = require('./database/index');

const msInMinute = 60 * 1000;

let messages = [];

let client = getIRCClient();

db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${db.url}`);
  })
  .catch(err => {
    console.error(`Failed to connect to ${db.url}`, err);
    process.exit();
  });

setTimeout(updateIRC, msInMinute * 10);

async function updateIRC() {
  (await client).disconnect().catch(console.error);

  client = getIRCClient();

  setTimeout(updateIRC, msInMinute * 10);
}

async function getIRCOptions() {
  let channels = await db.models.UserModel.find()

  channels = channels.map(user => user['display_name'].toLowerCase());

  const options = {
    identity: {
      username: 'tcsa-bot',
      password: config.TWITCH_IRC_TOKEN
    },
    channels: channels
  };

  console.log(options.channels);

  return options;
}

async function getIRCClient() {
  const client = new tmi.client(await getIRCOptions());

  client.on('message', handleMessage);
  client.on('connected', handleConnected);

  client.connect().catch(console.error);

  return client;
}

function handleMessage(target, context, msg, self) {
  if (self) { return; } // Ignore own messages

  messages.push({
    time_stamp: Date.now(),
    channel: target,
    content: msg.trim()
  });

  if (messages.length > 1000) {
    console.log('Writing to db...');

    db.models.MessageModel.insertMany(messages, (err, result) => {
      if (err) {
        console.error(err);
      }
    });

    messages = [];
  }
}

function handleConnected(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}
