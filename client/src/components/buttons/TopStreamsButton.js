import React from 'react'
import styled from 'styled-components'
import twitch from '../../themes'

const Button = styled.button`
  background: ${twitch.lightBackground};
  border-radius: 3px;
  border: 1px solid black;
  color: white;
  font-size: 20px;
  cursor: pointer;
  &:hover {
    color: ${twitch.lightText};
  }
`;

function TopStreamsButton(props) {
  async function fetchTopStreams() {
    fetch('http://localhost:3000/twitch/streams')
      .then(response => response.json())
      .then(result => {
        result.data ? props.updateTopStreams(result.data) : console.log(result);
      })
      .catch(err => console.log(err));
  }

  return (
    <Button className="TopStreamsButton" onClick={fetchTopStreams}>
      Get Top Streams
    </Button>
  );
}

export default TopStreamsButton;
