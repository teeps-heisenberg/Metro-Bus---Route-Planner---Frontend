import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Stop {
  name: string;
}

export interface MetroLine {
  GREEN: 'GREEN';
  BLUE: 'BLUE';
}

export type MetroLineCode = 'GREEN' | 'BLUE';

export interface LineInfo {
  line_code: MetroLineCode;
  name: string;
  color: string;
  theme_color: string;
  total_stops: number;
}

export interface RouteSegment {
  route_name: string;
  direction: string;
  trip_id: string;
  start_stop: string;
  end_stop: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  metro_line: MetroLineCode;
}

export interface RoutePlan {
  origin: string;
  destination: string;
  total_duration: number;
  segments: RouteSegment[];
  total_wait_time: number;
  instructions: string[];
  metro_lines: MetroLineCode[];
}

export interface RoutePlanningRequest {
  origin: string;
  destination: string;
  preferred_time?: string;
  max_wait_time: number;
  metro_line?: MetroLineCode;
}

export interface RoutePlanningResponse {
  success: boolean;
  message: string;
  route_plans: RoutePlan[];
  alternative_routes?: RoutePlan[];
}

export interface ChatMessage {
  message: string;
  user_id?: string;
  preferred_time?: string; // optional, for route planning
  metro_line?: MetroLineCode; // optional, for line-specific requests
}

export interface ChatResponse {
  response: string;
  status: string;
  route_suggestion?: RoutePlan;
}

export interface StopsResponse {
  success: boolean;
  stops: string[];
  count: number;
  metro_line?: MetroLineCode;
}

// API functions
export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get all stops (optionally filtered by metro line)
  getAllStops: async (metroLine?: MetroLineCode): Promise<StopsResponse> => {
    const params = metroLine ? { metro_line: metroLine } : {};
    const response = await api.get('/stops', { params });
    return response.data;
  },

  // Search stops (optionally filtered by metro line)
  searchStops: async (query: string, metroLine?: MetroLineCode) => {
    const params = { query, ...(metroLine && { metro_line: metroLine }) };
    const response = await api.get('/search-stops', { params });
    return response.data;
  },

  // Get all available metro lines
  getAvailableLines: async (): Promise<LineInfo[]> => {
    const response = await api.get('/lines');
    return response.data;
  },

  // Get specific line information
  getLineInfo: async (lineCode: MetroLineCode): Promise<LineInfo> => {
    const response = await api.get(`/line/${lineCode}`);
    return response.data;
  },

  // Plan route
  planRoute: async (request: RoutePlanningRequest): Promise<RoutePlanningResponse> => {
    const response = await api.post('/plan-route', request);
    return response.data;
  },

  // Chat with AI
  chat: async (message: ChatMessage): Promise<ChatResponse> => {
    const response = await api.post('/chat', message);
    return response.data;
  },

  // Get route explanation
  explainRoute: async (routePlan: RoutePlan) => {
    const response = await api.post('/explain-route', routePlan);
    return response.data;
  },

  // Get travel tips
  getTravelTips: async (routePlan: RoutePlan) => {
    const response = await api.post('/travel-tips', routePlan);
    return response.data;
  },

  // Get API info
  getApiInfo: async () => {
    const response = await api.get('/api-info');
    return response.data;
  },
};

export default api; 