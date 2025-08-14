import React, { useState, useEffect } from 'react';
import { AnalyticsService, AnalyticsEvent, UserBehaviorMetrics } from '../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Clock, MapPin, TrendingUp, Users, Route, Activity } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function EnhancedAnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserBehaviorMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeCount, setRealTimeCount] = useState<number>(0);

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription
    const subscription = AnalyticsService.subscribeToEvents((newEvent) => {
      setRealTimeCount(prev => prev + 1);
      // Refresh data after a short delay to avoid too many API calls
      setTimeout(() => {
        fetchData();
      }, 2000);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summary, timeSeries, metrics] = await Promise.all([
        AnalyticsService.getAnalyticsSummary(),
        AnalyticsService.getTimeSeriesData(timeRange),
        AnalyticsService.getUserBehaviorMetrics()
      ]);

      setUserMetrics(metrics);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getHourLabel = (hour: number) => {
    return `${hour}:00`;
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Enhanced Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights and user behavior analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Live: {realTimeCount} new events
                </span>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={1}>Last Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
              <option value={720}>Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Behavior Metrics */}
      {userMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Origins */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Popular Origins
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userMetrics.popularOrigins.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="origin" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Destinations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Route className="w-5 h-5 mr-2 text-green-600" />
              Popular Destinations
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userMetrics.popularDestinations.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="destination" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Peak Usage Hours */}
      {userMetrics && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Peak Usage Hours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userMetrics.peakUsageHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={getHourLabel}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00`}
                formatter={(value) => [value, 'Route Plans']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Metrics */}
      {userMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Planning Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(userMetrics.averageRoutePlanningTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Origins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userMetrics.popularOrigins.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Route className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Destinations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userMetrics.popularDestinations.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Events Feed */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Real-time Events Feed</h3>
          <p className="text-sm text-gray-500">Live updates from your Metro Bus Route Planner</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    {event.line_code && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Line {event.line_code}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
