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

function LoginButton(props) {
  function login() {
    window.location = 'http://localhost:3000/twitch/login';
  }

  function logout() {
    fetch('http://localhost:3000/twitch/logout', { credentials: 'include' })
      .then(response => response.json())
      .then(result => props.updateSession(result))
      .catch(err => console.error(err));
  }

  return (
    <Button className="Login"
      onClick={props.session.id ? logout : login}>
      {props.session.id ? 'Logout' : 'Login'}
    </Button>
  );
}

export default LoginButton;
