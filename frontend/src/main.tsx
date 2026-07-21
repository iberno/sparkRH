import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const stored = localStorage.getItem('spark-theme');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {}
}

import('preline').then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
