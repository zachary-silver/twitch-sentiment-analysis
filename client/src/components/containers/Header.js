import React from 'react'
import './Header.css'
import Login from '../buttons/Login'
import logo from '../../twitch_icon.png';

function Header() {
  return (
    <div className="Header">
      <div className="ImageDiv">
        <a href="https://www.twitch.tv/">
          <img src={logo} alt="twitch_icon"/>
        </a>
      </div>
      <div className="UserDiv">
        <p>Creamyzor</p>
      </div>
      <div className="LoginDiv">
        <Login />
      </div>
    </div>
  );
}

export default Header;
