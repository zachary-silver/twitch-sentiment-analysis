import React, {useState} from 'react'

function Login(props) {
  async function login() {
    fetch('http://localhost:3000/twitch/users')
      .then(response => response.json())
      .then(data => props.handleLogin(data));
  }

  return (
    <form className="Login">
      <input type="button" value="Login" onClick={login} />
    </form>
  );
}

export default Login;
