import React, {useState} from 'react'
import './TopStreams.css'
import TopStreamsButton from '../buttons/TopStreamsButton'
import TopStreamsGraph from '../graphs/TopStreamsGraph'

function TopStreams(props) {
  const [streams, setStreams] = useState([]);

  return (
    <div className="TopStreams">
      <div className='TopStreamsButtonDiv'>
        <TopStreamsButton updateTopStreams={setStreams} />
      </div>
      <div className='TopStreamsGraphDiv'>
        <TopStreamsGraph streams={streams} />
      </div>
    </div>
  );
}

export default TopStreams;
