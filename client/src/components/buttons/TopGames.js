import React, {useState} from 'react'
import Games from '../graphs/Games'
import './TopGames.css'

function TopGames(props) {
  const [games, setGames] = useState([]);

  async function populateTopGames() {
    fetch('http://localhost:3000/twitch/games/top')
      .then(response => response.json())
      .then(results => setGames(results.data));
  }

  return (
    <form className="TopGames">
      <input type="button" value="Get Top Games" onClick={populateTopGames} />
      <div><Games results={games} /></div>
    </form>
  );
}

export default TopGames;
