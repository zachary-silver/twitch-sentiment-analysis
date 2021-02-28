import React, {useState, useEffect} from 'react'
import styled from "styled-components";
import './Login.css';
import twitch from '../../themes';

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

function Login() {
  const [session, setSession] = useState({});

  useEffect(fetchSession, []);

  function fetchSession() {
    fetch('http://localhost:3000/twitch/user')
      .then(response => response.json())
      .then(result => setSession(result))
      .catch(err => console.log(err));
  }

  function login() {
    window.location = 'http://localhost:3000/twitch/login';
  }

  function logout() {
    fetch('http://localhost:3000/twitch/logout')
      .then(response => response.json())
      .then(result => setSession(result))
      .catch(err => console.log(err));
  }

  return (
    <Button className="Login"
      onClick={session.active ? logout : login}>
      {session.active ? 'Logout' : 'Login'}
    </Button>
  );
}

export default Login;
