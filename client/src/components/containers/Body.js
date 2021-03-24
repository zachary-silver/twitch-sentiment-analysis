import React from 'react'
import './Body.css'
import SentimentGraph from '../graphs/SentimentGraph'
import ChatBox from './ChatBox'

function Body(props) {
  return (
    <div className="Body">
      <SentimentGraph />
    </div>
  );
}

export default Body;
