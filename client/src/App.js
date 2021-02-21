import React, {useState} from 'react'
import logo from './logo.svg';
import './App.css';
import Login from './components/buttons/Login';

function App() {
  const [result, setResult] = useState({});

  function showResult(result) {
    setResult(result);
  };

  return (
    <div className="App">
      <Login handleLogin={showResult} />
      <div>{JSON.stringify(result)}</div>
    </div>
  );
}

export default App;
