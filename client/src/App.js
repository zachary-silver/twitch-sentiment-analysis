import React, {useState, useEffect} from 'react'
import './App.css';
import Header from './components/containers/Header';
import Body from './components/containers/Body';
import Footer from './components/containers/Footer';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function App() {
  const [session, setSession] = useState({});

  useEffect(fetchSession, []);

  function fetchSession() {
    fetch(`${SERVER_URL}/twitch/user`, { credentials: 'include' })
      .then(response => response.json())
      .then(result => setSession(result))
      .catch(err => console.error(err));
  }

  return (
    <div className="App">
      <Header session={session} updateSession={setSession} />
      <Body session={session} updateSession={setSession} />
      <Footer />
    </div>
  );
}

export default App;
