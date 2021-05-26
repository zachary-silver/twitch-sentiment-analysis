const tmi    = require('tmi.js');
const dotenv = require('dotenv');
const db     = require('./database/index');

dotenv.config();

const msInMinute = 60 * 1000;
const bufferSize = 1000;

let messages = [];
let client;

db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${db.url}`);
  })
  .catch(err => {
    console.error(`Failed to connect to ${db.url}`, err);
    process.exit();
  });

db.populateModels(db, () => {
  client = getIRCClient();
  setTimeout(updateIRCClient, msInMinute * 10);
});

async function updateIRCClient() {
  (await client).disconnect().catch(console.error);

  client = getIRCClient();

  setTimeout(updateIRCClient, msInMinute * 10);
}

async function getIRCOptions() {
  const channels = (await db.models.UserModel.find())
    .map(user => user['display_name'].toLowerCase());

  const options = {
    identity: {
      username: 'tcsa-bot',
      password: process.env.TWITCH_IRC_TOKEN
    },
    channels: channels
  };

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

  if (messages.length > bufferSize) {
    const channel = target.substring(1);
    db.models[`${channel}MessageModel`].insertMany(messages, (err, result) => {
      if (err) { console.error(err) }
    });

    messages = [];
  }
}

function handleConnected(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}
