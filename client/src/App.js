import React from 'react';
import './App.css';
import Login from './login/login';
import Main from './main/main';
import AddTeam from './add-team/add-team'; // AddTeam 컴포넌트 추가
import Profile from './profile/profile';
import Team from './team/team';
import Place from './place/place';
import Signup from './signup/signup';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/add-team" element={<AddTeam />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/team" element={<Team />} />
        <Route path="/place" element={<Place />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
