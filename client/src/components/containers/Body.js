import React from 'react'
import './Body.css'
import TopStreams from './TopStreams'
import ChatBox from './ChatBox'

function Body(props) {
  return (
    <div className="Body">
      <TopStreams />
      <ChatBox channel={props.session?.login} />
    </div>
  );
}

export default Body;
