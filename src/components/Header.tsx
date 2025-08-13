import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, MessageCircle, Info, Train } from 'lucide-react';
import { useMetroLine } from '../contexts/MetroLineContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { selectedLine, setSelectedLine, availableLines, currentLineInfo } = useMetroLine();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLineToggle = () => {
    const newLine = selectedLine === 'GREEN' ? 'BLUE' : 'GREEN';
    setSelectedLine(newLine);
  };

  const getLineColor = () => {
    return currentLineInfo?.color || '#22c55e';
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-metro-green hover:text-metro-dark transition-colors">
            <Bus size={32} style={{ color: getLineColor() }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: getLineColor() }}>
                {currentLineInfo?.name || 'Metro'}
              </h1>
              <p className="text-xs text-gray-600">Route Planner</p>
            </div>
          </Link>

          {/* Metro Line Toggler */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Line:</span>
              <button
                onClick={handleLineToggle}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: getLineColor(),
                  backgroundColor: `${getLineColor()}10`,
                  color: getLineColor()
                }}
              >
                <Train size={16} />
                <span className="font-medium">{selectedLine}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLineColor() }}></div>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/') ? { backgroundColor: getLineColor() } : {}}
              >
                <Bus size={20} />
                <span>Route Planner</span>
              </Link>
              
              <Link
                to="/chat"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/chat') 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/chat') ? { backgroundColor: getLineColor() } : {}}
              >
                <MessageCircle size={20} />
                <span>AI Assistant</span>
              </Link>
              
              <Link
                to="/about"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/about') 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/about') ? { backgroundColor: getLineColor() } : {}}
              >
                <Info size={20} />
                <span>About</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 