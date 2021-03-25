import React, {useState, useEffect} from 'react'
import './SentimentGraph.css'
import StackedLineGraph from '../graphs/StackedLineGraph'
import Legend from '../Legend'
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

  const currentDate = new Date();

  const data = getGraphData(messages, timeFrame, dateTime);

  const positiveMessages = getCountsOfType(data, 'positive');
  const negativeMessages = getCountsOfType(data, 'negative');
  const neutralMessages = getCountsOfType(data, 'neutral');
  const totalMessages = positiveMessages + negativeMessages + neutralMessages;
  const netMessageSentiment = totalMessages > 0
    ? ((positiveMessages - negativeMessages) / totalMessages).toFixed(2)
    : 0;

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function getRandomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  function getRandomMessages(minDate, maxDate) {
    const sentiments = ['positive', 'negative', 'neutral'];
    let messages = [];

    for (let i = 0; i < 100000; i++) {
      const sentiment = getRandomInt(3);
      const date = getRandomDate(minDate, maxDate);
      messages.push({
        'sentiment': sentiments[sentiment],
        'time_stamp': date
      });
    }

    return messages;
  }

  function getTimeBetween(a, b, units) {
    return Math.abs(a.getTime() - b.getTime()) / units;
  }

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

  async function retrieveMessages(dateTime) {
    const minDate = dateTime;
    const maxDate = new Date(minDate.getTime() + 7 * msInDay + msInDay);
    setMessages(getRandomMessages(minDate, maxDate));
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
        console.error(`filterMessages(, ${timeFrame}, ) fell through switch!`);
    }

    return messages.filter(msg => {
      const difference = new Date(msg['time_stamp']) - dateTime;
      return difference < timeRange && difference >= 0;
    });
  }

  function getGraphData(messages, timeFrame, dateTime) {
    if (messages.length == 0) { return []; }

    messages = filterMessages(messages, timeFrame, dateTime);

    let counts = { positive: {}, negative: {}, neutral: {} };
    let graphData = [
      { id: 'neutral', data: [] },
      { id: 'negative', data: [] },
      { id: 'placeholder1', data: [] },
      { id: 'placeholder2', data: [] },
      { id: 'positive', data: [] }
    ];

    /*
     * Populate message sentiment counts at the appropriate times.
     */
    for (const msg of messages) {
      const msgDate = new Date(msg['time_stamp']);
      const time = Math.floor(
        getTimeBetween(dateTime, msgDate, getUnits(timeFrame))
      );
      const sentiment = msg['sentiment'];

      counts[sentiment][time] = (counts[sentiment][time] || 0) + 1;
    }

    /*
     * Make sure there is a count for each sentiment type at each interval.
     */
    const range = getMaximumXValue(timeFrame);
    for (let i = 0; i <= range; i++) {
      for (const sentiment in counts) {
        counts[sentiment][i] = counts[sentiment][i] || 0;
      }
    }

    /*
     * Populate the graph data with the message sentiment counts.
     */
    for (const sentiment in counts) {
      const i = sentiment == 'positive' ? 4 : sentiment == 'negative' ? 1 : 0;

      for (const time in counts[sentiment]) {
        graphData[i]['data'].push({
          'x': time,
          'y': counts[sentiment][time]
        });
      }

      graphData[i]['data'].sort((a, b) => a['x'] - b['x']);
    }

    return graphData;
  }

  return (
    <div className='SentimentGraph'>
      <div className='Options'>
        <div className='DateTime'>
          <DateTimePicker
            onChange={setDateTime}
            value={dateTime}
            minDate={new Date(currentDate.getTime() - 31 * msInDay)}
            maxDate={currentDate}
            disableClock={true}
            className='DateTimePicker'
            clearIcon={null}
          />
        </div>
        <div className='Retrieve'>
          <button onClick={() => retrieveMessages(dateTime)}>
            Retrieve Messages
          </button>
        </div>
        <div className='TimeFrame'>
          <button onClick={() => setTimeFrame('Hour')}>
            View Hour
          </button>
        </div>
        <div className='TimeFrame'>
          <button onClick={() => setTimeFrame('Day')}>
            View Day
          </button>
        </div>
        <div className='TimeFrame'>
          <button onClick={() => setTimeFrame('Week')}>
            View Week
          </button>
        </div>
      </div>
      <div className='Stats'>
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
      <div className='Graph'>
        <Legend />
        <StackedLineGraph
          data={getGraphData(messages, timeFrame, dateTime)}
          maximumXValue={getMaximumXValue(timeFrame)}
        />
      </div>
    </div>
  );
}

export default SentimentGraph;
