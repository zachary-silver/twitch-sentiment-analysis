import React, {useState} from 'react'
import './SentimentGraph.css'
import SentimentGraphOptions from './SentimentGraphOptions'
import SentimentGraphStats from './SentimentGraphStats'
import StackedLineGraph from '../graphs/StackedLineGraph'
import Legend from './Legend'
import DateTimePicker from 'react-datetime-picker'
import './DateTimePicker.css'

const msInMinute = 60 * 1000;
const msInHour = msInMinute * 60;
const msInDay = msInHour * 24;
const msInWeek = msInDay * 7;
const Hour = 'Hour';
const Day = 'Day';
const Week = 'Week';

function SentimentGraph(props) {
  const [messages, setMessages] = useState([]);
  const [dateTime, setDateTime] = useState(null);
  const [timeFrame, setTimeFrame] = useState(Hour);
  const [loading, setLoading] = useState(false);

  const graphData = getGraphData(messages, timeFrame, dateTime);

  async function getMessages(dateTime) {
    if (dateTime) {
      setLoading(true);
      const minDate = dateTime.getTime();
      const maxDate = new Date(minDate + 7 * msInDay + msInDay).getTime();
      const url = `http://localhost:3000/twitch/messages/${minDate}-${maxDate}`;

      fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then(result => setMessages(result.messages) || setLoading(false));
    }
  }

  function getTimeBetween(a, b, units) {
    return Math.abs(a.getTime() - b.getTime()) / units;
  }

  function getUnits(timeFrame) {
    switch (timeFrame) {
      case Hour:
        return msInMinute;
      case Day:
        return msInHour;
      case Week:
        return msInDay;
      default:
        console.error(`getUnits(${timeFrame}) fell through switch!`);
    }
  }

  function getMaximumXValue(timeFrame) {
    switch (timeFrame) {
      case Hour:
        return 60;
      case Day:
        return 24;
      case Week:
        return 7;
      default:
        console.error(`getMaximumXValue(${timeFrame}) fell through switch!`);
    }
  }

  function getCountsData(counts) {
    return Object.entries(counts).map(([time, count]) => {
      return { 'x': time, 'y': count };
    })
  }

  function getSentimentColor(sentiment) {
    switch (sentiment) {
      case 'positive':
        return '#71bdb4';
      case 'negative':
        return '#a35a52';
      case 'neutral':
        return '#bab7a2';
      default:
        console.error(`getSentimentColor(${sentiment}) fell through switch!`);
    }
  }

  function filterMessages(messages, timeFrame, dateTime) {
    let timeRange;

    switch(timeFrame) {
      case Hour:
        timeRange = msInHour + msInMinute;
        break;
      case Day:
        timeRange = msInDay + msInHour;
        break;
      case Week:
        timeRange = msInWeek + msInDay;
        break;
      default:
        console.error(`filterMessages(${timeFrame}) fell through switch!`);
    }

    return messages.filter(msg => {
      const difference = new Date(msg['time_stamp']) - dateTime;
      return difference < timeRange && difference >= 0;
    });
  }

  function getGraphData(messages, timeFrame, dateTime) {
    if (messages.length == 0) { return []; }

    messages = filterMessages(messages, timeFrame, dateTime);
    let sentimentCounts = { positive: {}, negative: {}, neutral: {} };

    // Populate message sentiment counts at the appropriate times.
    for (const msg of messages) {
      const msgSentiment = msg['sentiment'];
      const msgDate = new Date(msg['time_stamp']);
      const units = getUnits(timeFrame);
      const time = Math.floor(getTimeBetween(dateTime, msgDate, units));
      let counts = sentimentCounts[msgSentiment];

      counts[time] = (counts[time] || 0) + 1;
    }

    // Make sure there is a count at each interval.
    for (let time = 0; time <= getMaximumXValue(timeFrame); time++) {
      for (const counts of Object.values(sentimentCounts)) {
        counts[time] = counts[time] || 0;
      }
    }

    return Object.entries(sentimentCounts).map(([sentiment, counts]) => {
      return {
        id: sentiment,
        color: getSentimentColor(sentiment),
        data: getCountsData(counts).sort((a, b) => a['x'] - b['x'])
      }
    });
  }

  return (
    <div className='SentimentGraph'>
      <SentimentGraphOptions
        Hour={Hour}
        Day={Day}
        Week={Week}
        setDateTime={setDateTime}
        setTimeFrame={setTimeFrame}
        getMessages={getMessages}
        loading={loading}
      />
      <SentimentGraphStats
        data={graphData}
      />
      <div className='SentimentGraphBody'>
        <Legend />
        <StackedLineGraph
          data={graphData}
          maximumXValue={getMaximumXValue(timeFrame)}
        />
      </div>
    </div>
  );
}

export default SentimentGraph;
