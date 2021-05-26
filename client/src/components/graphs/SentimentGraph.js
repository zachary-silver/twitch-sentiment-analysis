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
import {
  getGraphData,
  getMaximumXValue,
  getExportData,
  getMarginOfError,
  Hour, Day, Week,
  Positive, Negative, Neutral
} from '../Util'

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

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

  useEffect(fetchMinDate, []);
  useEffect(fetchModelReport, []);
  useEffect(() => {
    let temp = getGraphData(messages, timeFrame, fromDateTime, toDateTime);

    if (temp.length > 0) {
      temp[0]['margin_of_error'] = negativeStats['margin_of_error'];
      temp[1]['margin_of_error'] = positiveStats['margin_of_error'];
      temp[2]['margin_of_error'] = neutralStats['margin_of_error'];
    }

    setGraphData(temp);
  }, [timeFrame, fromDateTime, toDateTime, messages]);

  async function fetchMessages(fromDateTime, toDateTime, page = 0, cache = []) {
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
            fetchMessages(fromDateTime, toDateTime, page + 1, cache);
          } else {
            setLoading(false);
          }
        });
    }
  }

  async function fetchMinDate() {
    fetch(`${SERVER_URL}/twitch/messages/oldest`, { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        const msg = result.message;
        msg ? setMinDate(new Date(msg['time_stamp'])) : setMinDate(new Date());
      });
  }

  async function fetchModelReport() {
    fetch(`${SERVER_URL}/twitch/report`, { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        if (!result.error) {
          result[Positive]['margin_of_error'] = getMarginOfError(
            result[Positive]['precision'],
            result[Positive]['support']
          );
          result[Negative]['margin_of_error'] = getMarginOfError(
            result[Negative]['precision'],
            result[Negative]['support']
          );
          result[Neutral]['margin_of_error'] = getMarginOfError(
            result[Neutral]['precision'],
            result[Neutral]['support']
          );
          result['macro avg']['margin_of_error'] = getMarginOfError(
            result['macro avg']['precision'],
            result['macro avg']['support']
          );

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
        fetchMessages={fetchMessages}
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
          data={getExportData(graphData, fromDateTime, timeFrame)}
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
