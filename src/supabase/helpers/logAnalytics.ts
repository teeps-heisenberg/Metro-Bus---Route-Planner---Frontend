import { supabase } from '../client'; // Adjust the import path as necessary
export async function logAnalytics(eventType: string, details: object,line_code:string) {
  try {
    await supabase.from('analytics_events').insert([
      {
        event_type: eventType,
        event_details: details,
        line_code: line_code,
        // timestamp is auto-set by Supabase
      }
    ]);
  } catch (err) {
    // Optionally log error to console, but don't break app
    console.error('Analytics log failed:', err);
  }
}