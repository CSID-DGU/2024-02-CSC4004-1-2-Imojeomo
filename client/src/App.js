import React from 'react';
import './App.css';
import Login from './login';
import Main from './main';
import AddTeam from './add-team'; // AddTeam 컴포넌트 추가
import Profile from './profile';
import Team from './team';
import Schedule from './schedule';
import Place from './place';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/add-team" element={<AddTeam />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/team" element={<Team />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/place" element={<Place />} />
      </Routes>
    </Router>
  );
}

export default App;
