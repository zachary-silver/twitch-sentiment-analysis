import React, {useState} from 'react'

function Stream(props) {
  async function getStream() {
    fetch('http://localhost:3000/twitch/stream')
      .then(response => response.json())
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }

  return (
    <form className="Stream">
      <input type="button" value="Get Channel Details" onClick={getStream} />
    </form>
  );
}

export default Stream;
