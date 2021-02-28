import React, {useState} from 'react'
import Games from '../graphs/Streamers'
import './TopStreamers.css'
import Streamers from '../graphs/Streamers'

function TopStreamers(props) {
  const [streamers, setStreamers] = useState([]);

  async function getTopStreamers() {
    fetch('http://localhost:3000/twitch/streams')
      .then(response => response.json())
      .then(results => results.data ? setStreamers(results.data) : console.log(results))
      .catch(err => console.log(err));
  }

  return (
    <form className="TopGames">
      <input type="button" value="Get Top Streamers" onClick={getTopStreamers} />
      <div><Streamers results={streamers} /></div>
    </form>
  );
}

export default TopStreamers;
