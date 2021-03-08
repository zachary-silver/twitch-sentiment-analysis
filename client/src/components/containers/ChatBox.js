import React, {useState, useEffect} from 'react'
import 'tmi.js'

const client = new tmi.Client({
  identity: {
    username: 'tcsa2-bot',
    password: 'oauth:gx08qtd3oglu4m52stpne0vpyw54ds'
  },
  channels: [ 'theprimeagen', 'jakenbakelive' ]
});

function ChatBox(props) {
  const [messages, setMessages] = useState([]);
  // const chatEmbedUrl = 'https://www.twitch.tv/embed/' +
  //                      `summit1g/chat?parent=localhost`;

  useEffect(setupChat, []);

  function setupChat() {
    client.on('message', handleMessage);
    client.connect().catch(console.error);
  }

  function handleMessage(target, context, msg, self) {
    if(self) return;

    setMessages([...messages, msg]);

    if (messages.length > 100) {
      setMessages(messages.slice(-10));
    }
  }

  function getMessages() {
    return messages.map((msg) => <div>{msg}</div>);
  }

  return (
    <div className='ChatBox'>
      {getMessages()}
    </div>
  );
}

export default ChatBox;
