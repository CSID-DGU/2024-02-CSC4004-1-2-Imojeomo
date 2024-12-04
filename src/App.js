import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './login/login';
import Profile from './profile/profile';
import Team from './team/team';
import Place from './place/place';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // 로그인 상태 저장
    }
  }, [user]);

  return (

    <Router>
      <Routes>

        <Route path="/" element={<Login setUser={setUser} />} />

        <Route
          path="/profile" element={
            <Profile />
          }
        />

        <Route
          path="/team" element={
            <Team user={user} logout={logout} />
          }
        />

        <Route
          path="/place" element={
            <Place />
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
