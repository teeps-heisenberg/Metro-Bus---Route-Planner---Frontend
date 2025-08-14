import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetroLineCode, LineInfo, apiService } from '../services/api';
import { logAnalytics } from '../supabase/helpers/logAnalytics';

interface MetroLineContextType {
  selectedLine: MetroLineCode;
  setSelectedLine: (line: MetroLineCode) => void;
  availableLines: LineInfo[];
  currentLineInfo: LineInfo | null;
  isLoading: boolean;
  error: string | null;
}

const MetroLineContext = createContext<MetroLineContextType | undefined>(undefined);

export const useMetroLine = () => {
  const context = useContext(MetroLineContext);
  if (context === undefined) {
    throw new Error('useMetroLine must be used within a MetroLineProvider');
  }
  return context;
};

interface MetroLineProviderProps {
  children: ReactNode;
}

export const MetroLineProvider: React.FC<MetroLineProviderProps> = ({ children }) => {
  const [selectedLine, setSelectedLine] = useState<MetroLineCode>('GREEN');
  const [availableLines, setAvailableLines] = useState<LineInfo[]>([]);
  const [currentLineInfo, setCurrentLineInfo] = useState<LineInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available lines on mount
  useEffect(() => {
    const loadLines = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lines = await apiService.getAvailableLines();
        setAvailableLines(lines);
        
        // Set current line info
        const currentInfo = lines.find(line => line.line_code === selectedLine);
        setCurrentLineInfo(currentInfo || null);
      } catch (err) {
        setError('Failed to load metro lines');
        console.error('Error loading metro lines:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLines();
  }, []);

  // Update current line info when selected line changes
  useEffect(() => {
    const currentInfo = availableLines.find(line => line.line_code === selectedLine);
    setCurrentLineInfo(currentInfo || null);
  }, [selectedLine, availableLines]);

  // Update document theme when line changes
  useEffect(() => {
    if (currentLineInfo) {
      const root = document.documentElement;
      root.style.setProperty('--metro-primary-color', currentLineInfo.color);
      root.style.setProperty('--metro-theme-color', currentLineInfo.theme_color);
      
      // Update Tailwind CSS classes if needed
      root.classList.remove('theme-green', 'theme-blue');
      root.classList.add(`theme-${currentLineInfo.theme_color}`);
    }
  }, [currentLineInfo]);

  const handleSetSelectedLine = (line: MetroLineCode) => {
    logAnalytics('line_selected', { line_code: line }, line.toString());
    setSelectedLine(line);
  };

  const value: MetroLineContextType = {
    selectedLine,
    setSelectedLine: handleSetSelectedLine,
    availableLines,
    currentLineInfo,
    isLoading,
    error,
  };

  return (
    <MetroLineContext.Provider value={value}>
      {children}
    </MetroLineContext.Provider>
  );
};
