import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Team from './team';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Team />
  </React.StrictMode>
);

