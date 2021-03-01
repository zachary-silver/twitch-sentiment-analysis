import React from 'react'
import './Header.css'
import LoginButton from '../buttons/LoginButton'
import logo from '../../twitch_icon.png';

function Header(props) {
  return (
    <div className="Header">
      <div className="ImageDiv">
        <a href="https://www.twitch.tv/">
          <img src={logo} alt="twitch_icon"/>
        </a>
      </div>
      <div className="UserDiv">
        <p>{props.session.active?.display_name}</p>
      </div>
      <div className="LoginDiv">
        <LoginButton
          session={props.session}
          updateSession={props.updateSession}/>
      </div>
    </div>
  );
}

export default Header;
