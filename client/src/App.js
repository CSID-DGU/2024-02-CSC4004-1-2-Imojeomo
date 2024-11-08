import React from 'react';
import './App.css';
import Login from './login';
import Main from './main';
import Team from './team';
import Schedule from './schedule';
import Place from './place';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/team" element={<Team />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/place" element={<Place />} />
      </Routes>


    </Router>
  );
}

export default App;
