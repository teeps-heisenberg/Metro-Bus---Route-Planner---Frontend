import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Bus, Clock, Navigation, Eye } from 'lucide-react';
import { apiService, ChatResponse, RoutePlan } from '../services/api';
import ReactMarkdown from "react-markdown";
import { logAnalytics } from '../supabase/helpers/logAnalytics';
import { useMetroLine } from '../contexts/MetroLineContext';

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
  const [preferredTime, setPreferredTime] = useState('');
  const [selectedRouteMsgId, setSelectedRouteMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedLine } = useMetroLine();

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
    },selectedLine.toString());
    setMessages(prev => [...prev, userMessage]);
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
      },selectedLine.toString());
      setMessages(prev => [...prev, botMessage]);
      if (response.route_suggestion) {
        setSelectedRouteMsgId(botMessage.id);
      }
    } catch {
      const errorMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const renderRouteSuggestion = (route: RoutePlan) => (
    <div className="mt-4 p-5 bg-green-50 border border-green-300 rounded-xl shadow-sm text-left animate-fade-in">
      <h4 className="font-semibold text-green-600 mb-3 text-lg">Suggested Route</h4>
      <div className="mb-2 text-gray-800 flex items-center gap-1">
        <Navigation className="w-4 h-4 text-green-600" />
        <span className="font-medium">{route.origin} → {route.destination}</span>
      </div>
      {route.segments.map((segment, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm mb-2 hover:bg-green-50 transition-colors">
          <Bus className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-800">{segment.route_name} ({segment.direction})</div>
            <div className="text-sm text-gray-500">{segment.start_stop} → {segment.end_stop}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">
              {formatTime12Hour(segment.departure_time.substring(0, 5))} - {formatTime12Hour(segment.arrival_time.substring(0, 5))}
            </div>
            <div className="text-xs text-gray-500">{segment.duration_minutes}m</div>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <h5 className="font-medium text-gray-800 mb-1">Instructions:</h5>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {route.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
        </ul>
      </div>
    </div>
  );

  const selectedRouteSuggestion =
    messages.find(msg => msg.id === selectedRouteMsgId && msg.routeSuggestion)?.routeSuggestion ||
    [...messages].reverse().find(msg => !msg.isUser && msg.routeSuggestion)?.routeSuggestion;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600 mb-2">AI Travel Assistant</h1>
        <p className="text-gray-600 text-sm sm:text-base">Chat with our AI conductor for travel guidance and route planning</p>
      </div>

      <div className="card flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[400px] relative border rounded-xl shadow-md overflow-hidden" aria-busy={loading}>
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {loading && (
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-lg">
              <div className="h-full w-1/3 bg-green-400/80 animate-[loader-sweep_1.2s_ease-in-out_infinite]" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-12">
                <Bot className="w-12 h-12 mx-auto mb-4" />
                <p>Hello! I'm your AI travel assistant. Ask me about routes, schedules, or travel tips!</p>
              </div>
            )}

            {messages.map(msg => {
              const isSelected = msg.id === selectedRouteMsgId;
              return (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} ${isSelected ? 'ring-2 ring-green-300 rounded-lg' : ''}`}>
                  <div className={`flex items-start gap-2 max-w-xs lg:max-w-md ${msg.isUser ? 'flex-row-reverse gap-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isUser ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {msg.isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-xl px-4 py-2 shadow ${msg.isUser ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                      <div className="whitespace-pre-wrap text-left">
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>
                      <p className={`text-xs mt-1 ${msg.isUser ? 'text-green-100' : 'text-gray-500'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                      {!msg.isUser && msg.routeSuggestion && (
                        <button
                          className={`mt-2 flex items-center text-xs px-2 py-1 rounded transition-colors ${isSelected ? 'bg-green-600 text-white' : 'bg-white border border-green-400 text-green-600 hover:bg-green-600 hover:text-white'}`}
                          onClick={() => setSelectedRouteMsgId(msg.id)}
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

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="sticky bottom-0 left-0 right-0 mt-2 bg-white/80 backdrop-blur rounded-md px-3 py-2 shadow border border-gray-200 flex items-center gap-2" aria-live="polite">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Assistant is typing<span className="ml-1">…</span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex flex-col md:flex-row md:items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about routes, schedules, or travel tips..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={loading}
            />
            <input
              type="time"
              value={preferredTime}
              onChange={e => setPreferredTime(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 max-w-xs"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="flex items-center justify-center px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          {preferredTime && (
            <div className="text-xs text-gray-500 mt-1 ml-1">Preferred time: {formatTime12Hour(preferredTime)}</div>
          )}
        </div>

        {selectedRouteSuggestion && (
          <div className="hidden lg:block w-full max-w-sm flex-shrink-0 border-l border-gray-200 pl-4 sm:pl-6 overflow-y-auto">
            <div className="sticky top-0">
              {renderRouteSuggestion(selectedRouteSuggestion)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Quick Questions:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "How do I get from Khanna to NUST?",
            "What are the bus schedules?",
            "Tell me about the Green Metro system",
            "What are the main transfer points?"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
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
