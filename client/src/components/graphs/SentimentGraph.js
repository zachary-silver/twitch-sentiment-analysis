import React, {useState, useEffect} from 'react'
import './SentimentGraph.css'
import SentimentGraphOptions from './SentimentGraphOptions'
import SentimentGraphStats from './SentimentGraphStats'
import StackedLineGraph from '../graphs/StackedLineGraph'
import Legend from './Legend'
import Info from '../Info'
import DateTimePicker from 'react-datetime-picker'
import './DateTimePicker.css'
import { CSVLink, CSVDownload } from "react-csv"
import PropagateLoader from "react-spinners/PropagateLoader";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const msInSecond = 1000;
const msInMinute = msInSecond * 60;
const msInHour = msInMinute * 60;
const msInDay = msInHour * 24;
const msInWeek = msInDay * 7;
const Hour = 'Hour';
const Day = 'Day';
const Week = 'Week';
const Positive = 1;
const Negative = -1;
const Neutral = 0;

function SentimentGraph(props) {
  const [messages, setMessages] = useState([]);
  const [fromDateTime, setFromDateTime] = useState(null);
  const [toDateTime, setToDateTime] = useState(null);
  const [timeFrame, setTimeFrame] = useState(Hour);
  const [minDate, setMinDate] = useState(null);
  const [infoSelected, setInfoSelected] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [positiveStats, setPositiveStats] = useState({});
  const [negativeStats, setNegativeStats] = useState({});
  const [neutralStats, setNeutralStats] = useState({});
  const [averages, setAverages] = useState({});
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(getMinDate, []);
  useEffect(getModelReport, []);
  useEffect(() => getGraphData(messages, timeFrame, fromDateTime, toDateTime),
    [timeFrame, fromDateTime, toDateTime, messages]);

  async function getMessages(fromDateTime, toDateTime, page = 0, cache = []) {
    if (fromDateTime) {
      setLoading(true);

      const minDate = fromDateTime.getTime();
      const maxDate = toDateTime.getTime();
      const url = `${SERVER_URL}/twitch/messages/${minDate}-${maxDate}/${page}`;

      fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then(result => {
          cache.push(...result.messages);

          setMessages([...cache]);

          if (result.nextPage > page) {
            getMessages(fromDateTime, toDateTime, page + 1, cache);
          } else {
            setLoading(false);
          }
        });
    }
  }

  async function getMinDate() {
    const url = `${SERVER_URL}/twitch/messages/oldest`;

    fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        const ts = result.message['time_stamp'];
        ts ? setMinDate(new Date(ts)) : setMinDate(new Date());
      });
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

  function getSentimentColor(sentiment) {
    switch (sentiment) {
      case Positive:
        return '#71bdb4';
      case Negative:
        return '#a35a52';
      case Neutral:
        return '#bab7a2';
      default:
        console.error(`getSentimentColor(${sentiment}) fell through switch!`);
    }
  }

  function filterMessages(messages, timeFrame, fromDateTime) {
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
      const difference = new Date(msg['time_stamp']) - fromDateTime;
      return difference < timeRange && difference >= 0;
    });
  }

  function getSentimentName(sentiment) {
    switch (sentiment) {
      case Positive:
        return 'positive';
      case Negative:
        return 'negative';
      case Neutral:
        return 'neutral';
      default:
        console.error(`getSentimentName(${sentiment}) fell through switch!`);
    }
  }

  function getCountsData(counts) {
    return Object.entries(counts).map(([time, count]) => {
      return { 'x': time, 'y': count };
    })
  }

  async function getGraphData(messages, timeFrame, fromDateTime) {
    if (messages.length == 0) {
      setGraphData([]);
      return;
    }

    messages = filterMessages(messages, timeFrame, fromDateTime);
    let sentimentCounts = [{}, {}, {}];

    // Populate message sentiment counts at the appropriate times.
    for (const msg of messages) {
      const msgSentiment = msg['sentiment'];
      const msgDate = new Date(msg['time_stamp']);
      const units = getUnits(timeFrame);
      const time = Math.floor(getTimeBetween(fromDateTime, msgDate, units));
      let counts = sentimentCounts[msgSentiment + 1];

      counts[time] = (counts[time] || 0) + 1;
    }

    // Make sure there is a count at each interval.
    for (let time = 0; time <= getMaximumXValue(timeFrame); time++) {
      sentimentCounts.forEach(counts => {
        counts[time] = counts[time] || 0;
      });
    }

    const data = sentimentCounts.map((counts, index) => {
      const sentiment = index - 1;
      return {
        id: sentiment,
        color: getSentimentColor(sentiment),
        data: getCountsData(counts)
      };
    });

    setGraphData([data[0], data[2], data[1]]);
  }

  function getExportData(graphData) {
    if (graphData.length == 0) {
      return [];
    }

    let exportData = [['']];

    graphData[0].data.forEach(dataPoint => {
      const date = new Date(
        fromDateTime.getTime() + dataPoint['x'] * getUnits(timeFrame)
      );
      const str = `${date.getDate()}/${date.getMonth() + 1}`
        + `/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

      exportData[0].push(str);
    });

    graphData.forEach(data => {
      exportData.push([
        getSentimentName(data.id),
        ...data.data.map(dataPoint => dataPoint['y'])
      ]);
    });

    return exportData;
  }

  async function getModelReport() {
    const url = `${SERVER_URL}/twitch/report`;

    fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        if (!result.error) {
          setPositiveStats(result['1']);
          setNegativeStats(result['-1']);
          setNeutralStats(result['0']);
          setAverages(result['macro avg']);
          setAccuracy(result['accuracy']);
        }
      });
  }

  return (
    <div className='SentimentGraph'>
      <SentimentGraphOptions
        Hour={Hour}
        Day={Day}
        Week={Week}
        setFromDateTime={setFromDateTime}
        setToDateTime={setToDateTime}
        setTimeFrame={setTimeFrame}
        getMessages={getMessages}
        setInfoSelected={setInfoSelected}
        minDate={minDate}
      />
      <SentimentGraphStats
        data={graphData}
      />
      {infoSelected ? (
        <div className='SentimentGraphBody'>
          <Info
            positiveStats={positiveStats}
            negativeStats={negativeStats}
            neutralStats={neutralStats}
            averages={averages}
            accuracy={accuracy}
          />
        </div>
      ) : (
        <div className='SentimentGraphBody'>
          <Legend />
          <div className='Loader'>
            <PropagateLoader
              color={'#ffffff'}
              loading={loading}
            />
          </div>
          <StackedLineGraph
            data={graphData}
            maximumXValue={getMaximumXValue(timeFrame)}
          />
        </div>
      )}
      <div className='SentimentGraphFooter'>
        <CSVLink
          data={getExportData(graphData)}
          filename={'sentiment-data.csv'}
          id='csvDataExport'
          hidden
        />
        <button
          type='submit'
          onClick={() => document.getElementById('csvDataExport').click()}>
          Export Data
        </button>
      </div>
    </div>
  );
}

export default SentimentGraph;
