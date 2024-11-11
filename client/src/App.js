import React from 'react';
import './App.css';
import Login from './login';
import Main from './main';
import AddTeam from './add-team'; // AddTeam 컴포넌트 추가
import Team from './team';
import Schedule from './schedule';
import Place from './place';
import Signup from './signup';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/add-team" element={<AddTeam />} /> {/* 팀 생성 페이지 라우트 */}
        <Route path="/team" element={<Team />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/place" element={<Place />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
