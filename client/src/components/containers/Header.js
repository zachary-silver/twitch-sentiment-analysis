import React from 'react'
import './Header.css'
import LoginButton from '../buttons/LoginButton'
import logo from '../../twitch_icon.png';

function Header(props) {
  return (
    <div className="Header">
      <div className="Image">
        <a href="https://www.twitch.tv/">
          <img src={logo} alt="twitch_icon"/>
        </a>
      </div>
      <div className="User">
        <a href={`https://www.twitch.tv/${props.session.display_name}`}>
          {props.session.display_name}
        </a>
      </div>
      <div className="Login">
        <LoginButton
          session={props.session}
          updateSession={props.updateSession}/>
      </div>
    </div>
  );
}

export default Header;
