import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { logAnalytics } from './supabase/helpers/logAnalytics';
logAnalytics('website_opened', { timestamp: new Date().toISOString() });
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 