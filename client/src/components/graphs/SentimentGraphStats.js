import React, {useState} from 'react'
import './SentimentGraphStats.css'

function SentimentGraphStats(props) {
  const positiveMessages = getCountsOfType(props.data, 'positive');
  const negativeMessages = getCountsOfType(props.data, 'negative');
  const neutralMessages = getCountsOfType(props.data, 'neutral');
  const totalMessages = positiveMessages + negativeMessages + neutralMessages;
  const netMessageSentiment = totalMessages > 0
    ? ((positiveMessages - negativeMessages) / totalMessages).toFixed(2)
    : 0;

  function getCountsOfType(data, type) {
    return data
      .filter(element => element.id.match(type))
      .reduce((total, curr) => {
        return total + curr.data
          .reduce((total, curr) => {
            return total + curr['y'];
          }, 0)
      }, 0);
  }

  return (
    <div className='SentimentGraphStats'>
      <div className='TotalMessages'>
        <span>Total Messages</span>
        <span>{totalMessages}</span>
      </div>
      <div className='PositiveMessages'>
        <span>Positive Messages</span>
        <span>{positiveMessages}</span>
      </div>
      <div className='NegativeMessages'>
        <span>Negative Messages</span>
        <span>{negativeMessages}</span>
      </div>
      <div className='NeutralMessages'>
        <span>Neutral Messages</span>
        <span>{neutralMessages}</span>
      </div>
      <div className='NetMessageSentiment'>
        <span>Net Message Sentiment</span>
        <span>{netMessageSentiment}</span>
      </div>
    </div>
  );
}

export default SentimentGraphStats;
