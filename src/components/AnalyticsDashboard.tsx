import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useMetroLine } from '../contexts/MetroLineContext';
import { TrendingUp, Users, Route, Activity, BarChart3, Clock, MapPin } from 'lucide-react';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_details: any;
  created_at: string;
  line_code: string;
}

interface EventCounts {
  [key: string]: number;
}

interface LineCodeCounts {
  [key: string]: number;
}

interface TrafficInsights {
  todayQueries: number;
  todayResponses: number;
  weekQueries: number;
  weekResponses: number;
  monthQueries: number;
  monthResponses: number;
  hourlyTraffic: { hour: number; queries: number; responses: number }[];
  dailyTraffic: { date: string; queries: number; responses: number }[];
}

// Metro line color mapping - ensuring consistent colors
const getMetroLineColor = (lineCode: string) => {
  switch (lineCode) {
    case 'GREEN':
      return '#10b981'; // emerald green - matches Header component
    case 'BLUE':
      return '#5194f6'; // blue - matches Header component
    default:
      return '#6b7280'; // gray for unknown lines
  }
};

export default function AnalyticsDashboard() {
  const { selectedLine } = useMetroLine();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [lineSpecificEvents, setLineSpecificEvents] = useState<AnalyticsEvent[]>([]);
  const [eventTypeCounts, setEventTypeCounts] = useState<EventCounts>({});
  const [lineCodeCounts, setLineCodeCounts] = useState<LineCodeCounts>({});
  const [trafficInsights, setTrafficInsights] = useState<TrafficInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeCount, setRealTimeCount] = useState<number>(0);

  useEffect(() => {
    fetchAnalyticsData();

    const subscription = supabase
      .channel('analytics_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics_events'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          setRealTimeCount(prev => prev + 1);
          setTimeout(() => fetchAnalyticsData(), 1000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const filtered = events.filter(event => event.line_code === selectedLine);
      setLineSpecificEvents(filtered);
    }
  }, [selectedLine, events]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setEvents(data);
        processAnalyticsData(data);
        processTrafficInsights(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (data: AnalyticsEvent[]) => {
    const eventCounts: EventCounts = {};
    const lineCounts: LineCodeCounts = {};

    data.forEach(event => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
      
      if (event.line_code) {
        lineCounts[event.line_code] = (lineCounts[event.line_code] || 0) + 1;
      }
    });

    setEventTypeCounts(eventCounts);
    setLineCodeCounts(lineCounts);
  };

  const processTrafficInsights = (data: AnalyticsEvent[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todayQueries = 0, todayResponses = 0;
    let weekQueries = 0, weekResponses = 0;
    let monthQueries = 0, monthResponses = 0;
    
    const hourlyTraffic: { [key: number]: { queries: number; responses: number } } = {};
    const dailyTraffic: { [key: string]: { queries: number; responses: number } } = {};

    data.forEach(event => {
      const eventDate = new Date(event.created_at);
      const isToday = eventDate >= today;
      const isWeek = eventDate >= weekAgo;
      const isMonth = eventDate >= monthAgo;

      // Exclude website_opened and line_changed from both queries and responses
      if (event.event_type === 'website_opened' || event.event_type === 'line_changed') {
        return;
      }

      // Classify as response if event_type contains 'response'
      const isResponse = event.event_type.toLowerCase().includes('response');
      // Classify as query if event_type contains 'request'
      const isQuery = event.event_type.toLowerCase().includes('request');

      if (isResponse) {
        if (isToday) todayResponses++;
        if (isWeek) weekResponses++;
        if (isMonth) monthResponses++;
      } else if (isQuery) {
        if (isToday) todayQueries++;
        if (isWeek) weekQueries++;
        if (isMonth) monthQueries++;
      }

      const hour = eventDate.getHours();
      if (!hourlyTraffic[hour]) {
        hourlyTraffic[hour] = { queries: 0, responses: 0 };
      }
      if (isResponse) {
        hourlyTraffic[hour].responses++;
      } else if (isQuery) {
        hourlyTraffic[hour].queries++;
      }

      const dateKey = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyTraffic[dateKey]) {
        dailyTraffic[dateKey] = { queries: 0, responses: 0 };
      }
      if (isResponse) {
        dailyTraffic[dateKey].responses++;
      } else if (isQuery) {
        dailyTraffic[dateKey].queries++;
      }
    });

    const hourlyArray = Object.entries(hourlyTraffic)
      .map(([hour, data]) => ({ hour: parseInt(hour), ...data }))
      .sort((a, b) => a.hour - b.hour);

    const dailyArray = Object.entries(dailyTraffic)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setTrafficInsights({
      todayQueries,
      todayResponses,
      weekQueries,
      weekResponses,
      monthQueries,
      monthResponses,
      hourlyTraffic: hourlyArray,
      dailyTraffic: dailyArray
    });
  };

  const getEventTypeChartData = () => {
    return Object.entries(eventTypeCounts).map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  };

  const getLineCodeChartData = () => {
    return Object.entries(lineCodeCounts).map(([line, count]) => ({
      line: `Line ${line}`,
      count
    }));
  };

  const getLineSpecificEventTypeData = () => {
    const lineEventCounts: { [key: string]: number } = {};
    lineSpecificEvents.forEach(event => {
      lineEventCounts[event.event_type] = (lineEventCounts[event.event_type] || 0) + 1;
    });
    
    return Object.entries(lineEventCounts).map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  };

  const getLineSpecificTimeData = () => {
    const timeData: { [key: string]: number } = {};
    lineSpecificEvents.forEach(event => {
      const hour = new Date(event.created_at).toLocaleString('en-US', {
        hour: '2-digit',
        hour12: false,
        month: 'short',
        day: 'numeric'
      });
      timeData[hour] = (timeData[hour] || 0) + 1;
    });

    return Object.entries(timeData)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  const hasLineData = lineSpecificEvents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 py-4 sm:py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 text-sm sm:text-base">Real-time insights from your Metro Bus Route Planner</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="font-semibold text-xs sm:text-base">Live: {realTimeCount} new events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Combined Results Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Combined Results</h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">All Metro Lines</span>
          </div>

          {/* Combined Traffic Overview */}
          {trafficInsights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Queries</p>
                    <p className="text-2xl font-bold text-blue-600">{trafficInsights.todayQueries}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Responses</p>
                    <p className="text-2xl font-bold text-green-600">{trafficInsights.todayResponses}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Route className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Week Queries</p>
                    <p className="text-2xl font-bold text-purple-600">{trafficInsights.weekQueries}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Week Responses</p>
                    <p className="text-2xl font-bold text-indigo-600">{trafficInsights.weekResponses}</p>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Route className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Month Queries</p>
                    <p className="text-2xl font-bold text-orange-600">{trafficInsights.monthQueries}</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Month Responses</p>
                    <p className="text-2xl font-bold text-red-600">{trafficInsights.monthResponses}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Route className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Combined Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Event Types</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(eventTypeCounts).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Route className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Lines</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(lineCodeCounts).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => {
                      const today = new Date().toDateString();
                      const eventDate = new Date(e.created_at).toDateString();
                      return today === eventDate;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Traffic Patterns */}
          {trafficInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 overflow-x-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Hourly Traffic Pattern
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trafficInsights.hourlyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value, name) => [value, name === 'queries' ? 'Queries' : 'Responses']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="queries" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="responses" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Daily Traffic Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trafficInsights.dailyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'queries' ? 'Queries' : 'Responses']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="queries" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Combined Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 overflow-x-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Event Types Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getEventTypeChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="type" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Route className="h-5 w-5 mr-2 text-indigo-600" />
                Metro Line Usage
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getLineCodeChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ line, percent }) => `${line} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {getLineCodeChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMetroLineColor(entry.line.replace('Line ', ''))} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line-Specific Results Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getMetroLineColor(selectedLine)}20` }}
            >
              <Route 
                className="h-6 w-6" 
                style={{ color: getMetroLineColor(selectedLine) }} 
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Line-Specific Results</h2>
            <span 
              className="text-xs sm:text-sm text-white px-2 sm:px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: getMetroLineColor(selectedLine) }}
            >
              {selectedLine} Line
            </span>
          </div>

          {hasLineData ? (
            <>
              {/* Line-Specific Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div 
                  className="rounded-xl border p-6"
                  style={{
                    background: `linear-gradient(135deg, ${getMetroLineColor(selectedLine)}10, ${getMetroLineColor(selectedLine)}20)`,
                    borderColor: `${getMetroLineColor(selectedLine)}30`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${getMetroLineColor(selectedLine)}20` }}
                    >
                      <Activity 
                        className="h-6 w-6" 
                        style={{ color: getMetroLineColor(selectedLine) }} 
                      />
                    </div>
                    <div>
                      <p 
                        className="text-sm font-medium"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        Line Events
                      </p>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        {lineSpecificEvents.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div 
                  className="rounded-xl border p-6"
                  style={{
                    background: `linear-gradient(135deg, ${getMetroLineColor(selectedLine)}05, ${getMetroLineColor(selectedLine)}15)`,
                    borderColor: `${getMetroLineColor(selectedLine)}25`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${getMetroLineColor(selectedLine)}25` }}
                    >
                      <BarChart3 
                        className="h-6 w-6" 
                        style={{ color: getMetroLineColor(selectedLine) }} 
                      />
                    </div>
                    <div>
                      <p 
                        className="text-sm font-medium"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        Event Types
                      </p>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        {Object.keys(getLineSpecificEventTypeData()).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div 
                  className="rounded-xl border p-6"
                  style={{
                    background: `linear-gradient(135deg, ${getMetroLineColor(selectedLine)}08, ${getMetroLineColor(selectedLine)}18)`,
                    borderColor: `${getMetroLineColor(selectedLine)}28`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${getMetroLineColor(selectedLine)}30` }}
                    >
                      <Clock 
                        className="h-6 w-6" 
                        style={{ color: getMetroLineColor(selectedLine) }} 
                      />
                    </div>
                    <div>
                      <p 
                        className="text-sm font-medium"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        Today's Events
                      </p>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: getMetroLineColor(selectedLine) }}
                      >
                        {lineSpecificEvents.filter(e => {
                          const today = new Date().toDateString();
                          const eventDate = new Date(e.created_at).toDateString();
                          return today === eventDate;
                        }).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line-Specific Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 overflow-x-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" style={{ color: getMetroLineColor(selectedLine) }} />
                    {selectedLine} Line - Event Types
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getLineSpecificEventTypeData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="type" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Bar 
                        dataKey="count" 
                        style={{ fill: getMetroLineColor(selectedLine) }}
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" style={{ color: getMetroLineColor(selectedLine) }} />
                    {selectedLine} Line - Events Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getLineSpecificTimeData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke={getMetroLineColor(selectedLine)} 
                        strokeWidth={3} 
                        dot={{ 
                          fill: getMetroLineColor(selectedLine), 
                          strokeWidth: 2, 
                          r: 4 
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
                  <BarChart3 className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Analytics Data Available</h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                  There is currently no analytics data available for the{' '}
                  <span 
                    className="font-semibold"
                    style={{ color: getMetroLineColor(selectedLine) }}
                  >
                    {selectedLine} Line
                  </span>. 
                  Data will appear here once users start planning routes on this line.
                </p>
                <div className="mt-6 p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: `${getMetroLineColor(selectedLine)}10`,
                    borderColor: `${getMetroLineColor(selectedLine)}30`
                  }}
                >
                  <p 
                    className="text-sm"
                    style={{ color: getMetroLineColor(selectedLine) }}
                  >
                    💡 <strong>Tip:</strong> Try switching to a different metro line or wait for user activity to generate analytics data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
