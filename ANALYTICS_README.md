# Metro Bus Route Planner - Analytics & Real-time Dashboards

This document explains how to use the analytics features and real-time dashboards in your Metro Bus Route Planner application.

## Overview

Your application now includes comprehensive analytics capabilities that track user interactions and provide real-time insights into how users are using your route planning service.

## Database Schema

The analytics data is stored in the `analytics_events` table:

```sql
create table public.analytics_events (
  id uuid not null default gen_random_uuid (),
  event_type text null,
  event_details jsonb null,
  created_at timestamp with time zone not null default now(),
  line_code text null,
  constraint analytics_events_pkey primary key (id)
);
```

## Analytics Events Being Tracked

Currently, your app tracks these events:

1. **`auto_route_planned_response`** - When automatic route planning is successful
   - Includes route plans, timestamp, and line code
   - Used for user behavior analysis

2. **Additional events you can add:**
   - `route_search_initiated` - When user starts searching
   - `route_plan_viewed` - When user views route details
   - `error_occurred` - When errors happen
   - `user_feedback` - User ratings or feedback

## Components Available

### 1. Basic Analytics Dashboard (`/analytics`)
- Real-time event counts
- Event type distribution charts
- Metro line usage statistics
- Time series analysis
- Recent events table

### 2. Enhanced Analytics Dashboard (`/enhanced-analytics`)
- User behavior metrics
- Popular origins and destinations
- Peak usage hours analysis
- Performance metrics
- Real-time event feed

## How to Use

### Accessing the Dashboard
1. Navigate to `/analytics` in your app
2. Use the navigation menu to switch between dashboards
3. The dashboard updates in real-time using Supabase subscriptions

### Real-time Features
- **Live Updates**: New events appear automatically
- **Real-time Counters**: See new events as they happen
- **Auto-refresh**: Data refreshes every 2 seconds after new events

### Time Range Selection
- Last Hour
- Last 24 Hours  
- Last Week
- Last Month

## Adding New Analytics Events

To track additional user interactions, use the `logAnalytics` function:

```typescript
import { logAnalytics } from '../supabase/helpers/logAnalytics';

// Track a new event
await logAnalytics('user_feedback', {
  rating: 5,
  comment: 'Great service!',
  route_quality: 'excellent'
}, selectedLine.toString());
```

## Customizing the Dashboard

### Adding New Charts
1. Create new chart components using Recharts
2. Add them to the dashboard layout
3. Connect them to the AnalyticsService

### Custom Metrics
1. Extend the `AnalyticsService` class
2. Add new methods for your specific metrics
3. Update the dashboard to display them

## Supabase Real-time Features Used

### 1. Database Changes Subscription
```typescript
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
      // Handle real-time updates
    }
  )
  .subscribe();
```

### 2. Row Level Security (RLS)
Ensure your `analytics_events` table has appropriate RLS policies:

```sql
-- Allow authenticated users to read analytics
CREATE POLICY "Allow authenticated users to read analytics" ON public.analytics_events
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert analytics
CREATE POLICY "Allow service role to insert analytics" ON public.analytics_events
FOR INSERT WITH CHECK (true);
```

## Performance Considerations

### 1. Data Retention
- Consider implementing data archiving for old events
- Use time-based partitioning for large datasets
- Implement cleanup jobs for old analytics data

### 2. Real-time Optimization
- Debounce real-time updates to avoid excessive API calls
- Use pagination for large event lists
- Implement caching for frequently accessed metrics

### 3. Database Indexing
```sql
-- Add indexes for better query performance
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_line_code ON public.analytics_events(line_code);
```

## Advanced Analytics Features

### 1. User Segmentation
Track user behavior patterns:
- Frequent users vs. occasional users
- Peak usage times
- Preferred routes and stops

### 2. Performance Monitoring
- Route planning response times
- Error rates and types
- API endpoint usage

### 3. Business Intelligence
- Most popular routes
- User satisfaction metrics
- Service optimization opportunities

## Troubleshooting

### Common Issues

1. **Real-time updates not working**
   - Check Supabase connection
   - Verify RLS policies
   - Check browser console for errors

2. **Charts not displaying data**
   - Verify data exists in the database
   - Check API responses
   - Ensure proper data formatting

3. **Performance issues**
   - Implement data pagination
   - Add database indexes
   - Optimize query patterns

### Debug Mode
Enable debug logging in the AnalyticsService:

```typescript
// Add to AnalyticsService methods
console.log('Analytics data:', data);
console.log('Processing metrics:', metrics);
```

## Future Enhancements

### 1. Export Functionality
- CSV/Excel export of analytics data
- Scheduled reports
- Email notifications

### 2. Advanced Visualizations
- Heat maps for popular routes
- Network graphs for stop connections
- Predictive analytics

### 3. Integration
- Google Analytics integration
- Custom webhook notifications
- Third-party BI tools

## Security Considerations

1. **Data Privacy**: Ensure analytics don't capture PII
2. **Access Control**: Limit dashboard access to authorized users
3. **Data Encryption**: Use encrypted connections for sensitive data
4. **Audit Logging**: Track who accesses analytics data

## Support

For questions or issues with the analytics features:
1. Check the browser console for errors
2. Verify Supabase configuration
3. Review database permissions
4. Check network connectivity

---

**Note**: This analytics system is designed to provide insights while maintaining user privacy. Always ensure compliance with relevant data protection regulations.
