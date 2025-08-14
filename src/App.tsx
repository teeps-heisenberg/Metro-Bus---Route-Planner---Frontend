import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RoutePlanner from './components/RoutePlanner';
import ChatAssistant from './components/ChatAssistant';
import About from './components/About';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { MetroLineProvider } from './contexts/MetroLineContext';
import './App.css';

function App() {
  return (
    <MetroLineProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<RoutePlanner />} />
              <Route path="/chat" element={<ChatAssistant />} />
              <Route path="/about" element={<About />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </MetroLineProvider>
  );
}

export default App; 