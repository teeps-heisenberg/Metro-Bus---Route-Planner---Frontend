import { supabase } from '../supabase/client';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_details: any;
  created_at: string;
  line_code: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  eventTypeCounts: { [key: string]: number };
  lineCodeCounts: { [key: string]: number };
  todayEvents: number;
  weeklyEvents: number;
  monthlyEvents: number;
}

export interface TimeSeriesData {
  time: string;
  count: number;
  eventTypes: { [key: string]: number };
}

export interface UserBehaviorMetrics {
  popularOrigins: { origin: string; count: number }[];
  popularDestinations: { destination: string; count: number }[];
  peakUsageHours: { hour: number; count: number }[];
  averageRoutePlanningTime: number;
}

export class AnalyticsService {
  // Get real-time analytics summary
  static async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*');

      if (error) throw error;

      if (!data) return this.getEmptySummary();

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

      const eventTypeCounts: { [key: string]: number } = {};
      const lineCodeCounts: { [key: string]: number } = {};
      let todayEvents = 0;
      let weeklyEvents = 0;
      let monthlyEvents = 0;

      data.forEach(event => {
        // Count event types
        eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1;
        
        // Count line codes
        if (event.line_code) {
          lineCodeCounts[event.line_code] = (lineCodeCounts[event.line_code] || 0) + 1;
        }

        // Time-based filtering
        const eventDate = new Date(event.created_at);
        if (eventDate >= today) todayEvents++;
        if (eventDate >= weekAgo) weeklyEvents++;
        if (eventDate >= monthAgo) monthlyEvents++;
      });

      return {
        totalEvents: data.length,
        eventTypeCounts,
        lineCodeCounts,
        todayEvents,
        weeklyEvents,
        monthlyEvents
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return this.getEmptySummary();
    }
  }

  // Get time series data for charts
  static async getTimeSeriesData(hours: number = 24): Promise<TimeSeriesData[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      const timeData: { [key: string]: { count: number; eventTypes: { [key: string]: number } } } = {};

      data.forEach(event => {
        const hour = new Date(event.created_at).toLocaleString('en-US', {
          hour: '2-digit',
          hour12: false,
          month: 'short',
          day: 'numeric'
        });

        if (!timeData[hour]) {
          timeData[hour] = { count: 0, eventTypes: {} };
        }

        timeData[hour].count++;
        timeData[hour].eventTypes[event.event_type] = (timeData[hour].eventTypes[event.event_type] || 0) + 1;
      });

      return Object.entries(timeData)
        .map(([time, data]) => ({
          time,
          count: data.count,
          eventTypes: data.eventTypes
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  // Get user behavior metrics
  static async getUserBehaviorMetrics(): Promise<UserBehaviorMetrics> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'auto_route_planned_response');

      if (error) throw error;

      if (!data) return this.getEmptyUserBehaviorMetrics();

      const origins: { [key: string]: number } = {};
      const destinations: { [key: string]: number } = {};
      const hourlyUsage: { [key: number]: number } = {};
      let totalPlanningTime = 0;
      let planningCount = 0;

      data.forEach(event => {
        if (event.event_details?.route_plans) {
          const routePlan = event.event_details.route_plans[0];
          if (routePlan?.segments) {
            // Extract origin and destination from route details
            const firstSegment = routePlan.segments[0];
            const lastSegment = routePlan.segments[routePlan.segments.length - 1];
            
            if (firstSegment?.origin) {
              origins[firstSegment.origin] = (origins[firstSegment.origin] || 0) + 1;
            }
            if (lastSegment?.destination) {
              destinations[lastSegment.destination] = (destinations[lastSegment.destination] || 0) + 1;
            }

            // Calculate planning time if available
            if (event.event_details.timestamp) {
              const planningTime = new Date().getTime() - new Date(event.event_details.timestamp).getTime();
              if (planningTime > 0 && planningTime < 60000) { // Reasonable range: 0-60 seconds
                totalPlanningTime += planningTime;
                planningCount++;
              }
            }
          }
        }

        // Count hourly usage
        const hour = new Date(event.created_at).getHours();
        hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
      });

      // Sort and limit to top 10
      const popularOrigins = Object.entries(origins)
        .map(([origin, count]) => ({ origin, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const popularDestinations = Object.entries(destinations)
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const peakUsageHours = Object.entries(hourlyUsage)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return {
        popularOrigins,
        popularDestinations,
        peakUsageHours,
        averageRoutePlanningTime: planningCount > 0 ? totalPlanningTime / planningCount : 0
      };
    } catch (error) {
      console.error('Error fetching user behavior metrics:', error);
      return this.getEmptyUserBehaviorMetrics();
    }
  }

  // Get real-time events stream
  static subscribeToEvents(callback: (event: AnalyticsEvent) => void) {
    return supabase
      .channel('analytics_events_stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events'
        },
        (payload) => {
          callback(payload.new as AnalyticsEvent);
        }
      )
      .subscribe();
  }

  // Get events by type with pagination
  static async getEventsByType(eventType: string, limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', eventType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching events by type ${eventType}:`, error);
      return [];
    }
  }

  // Get events by line code
  static async getEventsByLine(lineCode: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('line_code', lineCode)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching events by line ${lineCode}:`, error);
      return [];
    }
  }

  private static getEmptySummary(): AnalyticsSummary {
    return {
      totalEvents: 0,
      eventTypeCounts: {},
      lineCodeCounts: {},
      todayEvents: 0,
      weeklyEvents: 0,
      monthlyEvents: 0
    };
  }

  private static getEmptyUserBehaviorMetrics(): UserBehaviorMetrics {
    return {
      popularOrigins: [],
      popularDestinations: [],
      peakUsageHours: [],
      averageRoutePlanningTime: 0
    };
  }
}
