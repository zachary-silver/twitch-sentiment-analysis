import React, {useState, useEffect} from 'react'
import './App.css';
import Header from './components/containers/Header';
import Body from './components/containers/Body';
import Footer from './components/containers/Footer';

function App() {
  const [session, setSession] = useState({});

  useEffect(fetchSession, []);

  function fetchSession() {
    fetch('http://localhost:3000/twitch/user')
      .then(response => response.json())
      .then(result => setSession(result))
      .catch(err => console.log(err));
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
