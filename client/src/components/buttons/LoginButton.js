import React from 'react'
import styled from 'styled-components'
import './LoginButton.css'
import twitch from '../../themes'

const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid ${twitch.lightText};
  color: white;
  font-size: 20px;
  cursor: pointer;
  &:hover {
    color: ${twitch.lightText};
  }
`;

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

function LoginButton(props) {
  function login() {
    window.location = `${SERVER_URL}/twitch/login`;
  }

  function logout() {
    fetch(`${SERVER_URL}/twitch/logout`, { credentials: 'include' })
      .then(response => response.json())
      .then(result => { window.location = CLIENT_URL; })
      .catch(err => console.error(err));
  }

  return (
    <Button className='LoginButton'
      onClick={props.session.id ? logout : login}>
      {props.session.id ? 'Logout' : 'Login'}
    </Button>
  );
}

export default LoginButton;
