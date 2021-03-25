import React from 'react'
import './Body.css'
import SentimentGraph from '../graphs/SentimentGraph'

function Body(props) {
  return (
    <div className="Body">
      <SentimentGraph />
    </div>
  );
}

export default Body;
