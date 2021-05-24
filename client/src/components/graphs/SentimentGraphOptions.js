import React, {useState, useEffect} from 'react'
import './SentimentGraphOptions.css'
import DateTimePicker from 'react-datetime-picker'
import './DateTimePicker.css'

const msInSecond = 1000;
const msInDay = 24 * 60 * 60 * 1000;

function SentimentGraphOptions(props) {
  const [fromDateTime, setFromDateTime] = useState(null);
  const [toDateTime, setToDateTime] = useState(null);
  const currentDate = new Date();

  useEffect(() => props.setFromDateTime(fromDateTime), [fromDateTime]);
  useEffect(() => props.setToDateTime(toDateTime), [toDateTime]);

  async function handleRetrieve(fromDateTime, toDateTime) {
    props.fetchMessages(fromDateTime, toDateTime);
    props.setInfoSelected(false);
  }

  async function handleTimeFrame(timeFrame) {
    props.setTimeFrame(timeFrame);
    props.setInfoSelected(false);
  }

  return (
    <div className='SentimentGraphOptions'>
      <div className='UpperOptions'>
        <div className='DateTime'>
          <span className='Label'>From:</span>
          <DateTimePicker className='DateTimePicker'
            onChange={setFromDateTime}
            value={fromDateTime}
            minDate={props.minDate}
            maxDate={currentDate}
            disableClock={true}
            clearIcon={null}
            format='MM/dd/y hh:mm a'
          />
        </div>
        <div className='DateTime'>
          <span className='Label'>To:</span>
          <DateTimePicker className='DateTimePicker'
            onChange={setToDateTime}
            value={toDateTime}
            minDate={fromDateTime}
            maxDate={currentDate}
            disableClock={true}
            clearIcon={null}
            format='MM/dd/y hh:mm a'
          />
        </div>
        <div className='Retrieve'>
          <button onClick={() => handleRetrieve(fromDateTime, toDateTime)}>
            Retrieve Messages
          </button>
        </div>
      </div>
      <div className='LowerOptions'>
        <div className='TimeFrame'>
          <button onClick={() => handleTimeFrame(props.Hour)}>
            View Hour
          </button>
        </div>
        <div className='TimeFrame'>
          <button onClick={() => handleTimeFrame(props.Day)}>
            View Day
          </button>
        </div>
        <div className='TimeFrame'>
          <button onClick={() => handleTimeFrame(props.Week)}>
            View Week
          </button>
        </div>
        <div className='InfoButton'>
          <button onClick={() => props.setInfoSelected(true)}>
            View More Info
          </button>
        </div>
      </div>
    </div>
  );
}

export default SentimentGraphOptions;
