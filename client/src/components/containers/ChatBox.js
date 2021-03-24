import React, {useState, useEffect, useRef} from 'react'
import './ChatBox.css'
import ChatBoxChannel from '../ChatBoxChannel'
import 'tmi.js'

function ChatBox(props) {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(props.channel);
  const [messages, setMessages] = useState([]);
  const bottomOfChat = useRef(null);

  useEffect(setupClient, [channel]);

  useEffect(scrollToBottom, [messages]);

  function setupClient() {
    client?.disconnect().catch(console.err);

    const newClient = new tmi.Client({
      identity: {
        username: 'tcsa2-bot',
        password: 'oauth:gx08qtd3oglu4m52stpne0vpyw54ds'
      },
      channels: [channel]
    });

    newClient.on('message', handleMessage);
    newClient.connect().catch(console.error);

    setClient(newClient);
  }

  function scrollToBottom() {
    bottomOfChat.current?.scrollIntoView({ behavior: "smooth" })
  }

  function handleMessage(target, context, msg, self) {
    if (self) { return; }

    messages.push(`[${target}] ${msg}`);
    setMessages([...messages]);

    if (messages.length > 1000) {
      setMessages(messages.slice(-100));
    }
  }

  function getChatStatistics() {
    let longest = 0;
    let shortest = 1000;
    let totalLength = 0;

    messages.forEach((msg) => {
      if (msg.length > longest) {
        longest = msg.length;
      }

      if (msg.length < shortest) {
        shortest = msg.length;
      }

      totalLength += msg.length;
    });

    if (messages.length > 0) {
      return (
        <div className='ChatStatsDiv'>
          <div className='LongestMsgDiv'>
            <span>Longest Message: {longest}</span>
          </div>
          <div className='ShortestMsgDiv'>
            <span>Shortest Message: {shortest}</span>
          </div>
          <div className='AverageMsgDiv'>
            <span>Average Message Length: {Math.round(totalLength / messages.length)}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className='ChatStatsDiv' />
      );
    }
  }

  return (
    <div className='ChatBox'>
      <div className='ChatBoxChannelDiv'>
        <ChatBoxChannel updateChannel={setChannel} />
      </div>
      <div className='ChatDiv'>
        {messages.map((msg) => <span>{msg}</span>)}
        <div ref={bottomOfChat} />
      </div>
      {getChatStatistics()}
    </div>
  );
}

export default ChatBox;
