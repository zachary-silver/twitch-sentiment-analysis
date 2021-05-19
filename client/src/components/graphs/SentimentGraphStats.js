import React, {useState, useEffect} from 'react'
import './SentimentGraphStats.css'

function SentimentGraphStats(props) {
  const [positiveMessages, setPositiveMessages] = useState(0);
  const [negativeMessages, setNegativeMessages] = useState(0);
  const [neutralMessages, setNeutralMessages] = useState(0);
  const totalMessages = positiveMessages + negativeMessages + neutralMessages;
  const netMessageSentiment = totalMessages > 0
    ? ((positiveMessages - negativeMessages) / totalMessages).toFixed(2)
    : 0;

  useEffect(() => getCounts(props.data), [props.data]);

  async function getCounts(data) {
    getCountsOfType(data, 1);
    getCountsOfType(data, -1);
    getCountsOfType(data, 0);
  }

  async function getCountsOfType(data, type) {
    const count = data
      .filter(element => element.id === type)
      .reduce((total, curr) => {
        return total + curr.data
          .reduce((total, curr) => {
            return total + curr['y'];
          }, 0)
      }, 0);

    switch(type) {
      case -1:
        setNegativeMessages(count);
        break;
      case 0:
        setNeutralMessages(count);
        break;
      case 1:
        setPositiveMessages(count);
        break;
    }
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
