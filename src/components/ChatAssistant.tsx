import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Bus, Clock, Navigation, Eye } from 'lucide-react';
import { apiService, ChatResponse, RoutePlan } from '../services/api';
import ReactMarkdown from "react-markdown";
import { logAnalytics } from '../supabase/helpers/logAnalytics';
import { log } from 'console';
// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string): string => {
  try {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time24;
  }
};

interface ChatMessageUI {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  routeSuggestion?: RoutePlan;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferredTime, setPreferredTime] = useState(''); // for preferred time input
  const [selectedRouteMsgId, setSelectedRouteMsgId] = useState<string | null>(null); // for route panel selection
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessageUI = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    logAnalytics('user_message_sent', {
      message: inputMessage,
      preferred_time: preferredTime.toString() || '',
      timestamp: new Date().toISOString()
    });
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response: ChatResponse = await apiService.chat({
        message: inputMessage,
        user_id: 'user',
        preferred_time: preferredTime ? `${preferredTime}:00` : undefined,
      });

      const botMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        message: response.response,
        isUser: false,
        timestamp: new Date(),
        routeSuggestion: response.route_suggestion,
      };
      logAnalytics('bot_message_received', {
        response: response.response,
        route_suggestion: response.route_suggestion || null,
        timestamp: new Date().toISOString()
      });
      setMessages((prev) => [...prev, botMessage]);
      // If this bot message has a route suggestion, select it in the panel
      if (response.route_suggestion) {
        setSelectedRouteMsgId(botMessage.id);
      }
    } catch (error) {
      const errorMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to render route suggestion
  const renderRouteSuggestion = (route: RoutePlan) => (
    <div className="mt-4 p-4 bg-green-50 border border-metro-green rounded-lg text-left animate-fade-in">
      <h4 className="font-semibold text-metro-green mb-2">Suggested Route</h4>
      <div className="mb-2 text-gray-800">
        <Navigation className="inline w-4 h-4 mr-1 text-metro-green" />
        {route.origin} → {route.destination}
      </div>
      {route.segments.map((segment, idx) => (
        <div key={idx} className="flex items-center space-x-3 mb-2">
          <Bus className="w-5 h-5 text-metro-green flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-800">
              {segment.route_name} ({segment.direction})
            </div>
            <div className="text-sm text-gray-600">
              {segment.start_stop} → {segment.end_stop}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">
              {formatTime12Hour(segment.departure_time.substring(0, 5))} - {formatTime12Hour(segment.arrival_time.substring(0, 5))}
            </div>
            <div className="text-xs text-gray-600">
              {segment.duration_minutes}m
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <h5 className="font-medium text-gray-800 mb-1">Instructions:</h5>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {route.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Find the selected route suggestion, or fallback to latest
  const selectedRouteSuggestion =
    messages.find((msg) => msg.id === selectedRouteMsgId && msg.routeSuggestion)?.routeSuggestion ||
    [...messages].reverse().find((msg) => !msg.isUser && msg.routeSuggestion)?.routeSuggestion;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* local CSS for the animated line */}
      <style>{`
        @keyframes loader-sweep {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          AI Travel Assistant
        </h1>
        <p className="text-gray-600">
          Chat with our AI conductor for travel guidance and route planning
        </p>
      </div>

      {/* FLEX LAYOUT: Chat (left) + Route Suggestion (right) */}
      <div className="card flex flex-col lg:flex-row gap-6 h-[600px] min-h-[400px] relative" aria-busy={loading}>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP STICKY LOADER LINE (shows only while loading) */}
          {loading && (
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-lg">
              <div
                className="h-full w-1/3 bg-metro-green/80"
                style={{ animation: 'loader-sweep 1.2s ease-in-out infinite' }}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Hello! I'm your AI travel assistant. Ask me about routes, schedules, or travel tips!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isSelected = msg.id === selectedRouteMsgId;
              return (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}` + (isSelected ? ' ring-2 ring-metro-green/60 rounded-lg' : '')}>
                  <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isUser ? 'bg-metro-green text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {msg.isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      msg.isUser 
                        ? 'bg-metro-green text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className='whitespace-pre-wrap text-left'>
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>
                      <p className={`text-xs mt-1 text-left ${
                        msg.isUser ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                      {/* Show in Panel button for assistant messages with route suggestion */}
                      {!msg.isUser && msg.routeSuggestion && (
                        <button
                          className={`mt-2 flex items-center text-xs px-2 py-1 rounded transition-colors ${isSelected ? 'bg-metro-green text-white' : 'bg-white border border-metro-green text-metro-green hover:bg-metro-green hover:text-white'}`}
                          onClick={() => setSelectedRouteMsgId(msg.id)}
                          aria-label="Show this route in panel"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Show in Panel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* existing bubble loader (kept) */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STICKY “typing” STATUS at bottom of scroll area */}
            {loading && (
              <div
                className="sticky bottom-0 left-0 right-0 mt-2 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 rounded-md px-3 py-2 shadow-sm border border-gray-200 flex items-center space-x-2"
                aria-live="polite"
              >
                <Clock className="w-4 h-4 text-metro-green" />
                <span className="text-sm text-gray-700">
                  Assistant is typing<span className="inline-block w-4 text-center">…</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about routes, schedules, or travel tips..."
                className="flex-1 input-field"
                disabled={loading}
                aria-disabled={loading}
              />
              {/* Preferred Time Input */}
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="input-field max-w-xs"
                disabled={loading}
                aria-label="Preferred time for route planning"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            {preferredTime && (
              <div className="text-xs text-gray-500 mt-1 ml-1">Preferred time: {formatTime12Hour(preferredTime)}</div>
            )}
          </div>
        </div>

        {/* Route Suggestion Panel (Right) */}
        {selectedRouteSuggestion && (
          <div className="hidden lg:block w-full max-w-sm flex-shrink-0 border-l border-gray-200 pl-6 overflow-y-auto">
            <div className="sticky top-0">
              {renderRouteSuggestion(selectedRouteSuggestion)}
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Questions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "How do I get from Khanna to NUST?",
            "What are the bus schedules?",
            "Tell me about the Green Metro system",
            "What are the main transfer points?"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
