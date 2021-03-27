import React, {useState, useEffect} from 'react'
import './SentimentGraphOptions.css'
import DateTimePicker from 'react-datetime-picker'
import './DateTimePicker.css'

const msInDay = 24 * 60 * 60 * 1000;

function SentimentGraphOptions(props) {
  const [dateTime, setDateTime] = useState(null);
  const currentDate = new Date();

  useEffect(() => props.setDateTime(dateTime), [dateTime]);

  function handleDateTime(dateTime) {
    setDateTime(dateTime);
  }

  function handleRetrieve(dateTime) {
    props.getMessages(dateTime);
  }

  function handleTimeFrame(timeFrame) {
    props.setTimeFrame(timeFrame);
  }

  return (
    <div className='SentimentGraphOptions'>
      <div className='DateTime'>
        <DateTimePicker
          onChange={handleDateTime}
          value={dateTime}
          minDate={new Date(currentDate.getTime() - 31 * msInDay)}
          maxDate={currentDate}
          disableClock={true}
          clearIcon={null}
          className='DateTimePicker'
          format='MM/dd/y hh:mm a'
        />
      </div>
      <div className='Retrieve'>
        <button onClick={() => handleRetrieve(dateTime)}>
          {props.loading ? 'Retrieving...' : 'Retrieve Messages'}
        </button>
      </div>
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
    </div>
  );
}

export default SentimentGraphOptions;
