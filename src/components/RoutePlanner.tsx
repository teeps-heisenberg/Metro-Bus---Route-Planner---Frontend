import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, Navigation, Bus } from 'lucide-react';
import { apiService, RoutePlan } from '../services/api';
import { useMetroLine } from '../contexts/MetroLineContext';
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

// Utility function to convert HTML time input (24-hour) to API format
const convertTimeInputToAPI = (timeInput: string): string => {
  try {
    // HTML time input returns "HH:MM" format, we need "HH:MM:SS"
    return `${timeInput}:00`;
  } catch {
    return timeInput;
  }
};

const RoutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allStops, setAllStops] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [nextBusTime, setNextBusTime] = useState<string | null>(null);
  const [originSelected, setOriginSelected] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const { selectedLine } = useMetroLine();

  // Fetch all stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await apiService.getAllStops(selectedLine);
        setAllStops(res.stops || []);
      } catch {
        setAllStops([]);
      }
    };
    fetchStops();
  }, [selectedLine]);

  // Filter suggestions from all stops
  const filterSuggestions = (query: string) => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allStops.filter(stop => stop.toLowerCase().includes(q)).slice(0, 10);
  };

  // Handlers for input changes
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    setOriginSelected(false);
    setOriginSuggestions(filterSuggestions(value));
    setNextBusTime(null);
    setRoutePlans([]);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setDestinationSelected(false);
    setDestinationSuggestions(filterSuggestions(value));
    setNextBusTime(null);
    setRoutePlans([]);
  };

  // Select suggestion
  const selectOrigin = (stop: string) => {
    setOrigin(stop);
    setOriginSelected(true);
    setOriginSuggestions([]);
    originInputRef.current?.blur();
    // If destination is already selected, auto-plan route
    if (destinationSelected) {
      autoPlanRoute(stop, destination);
    }
  };

  const selectDestination = (stop: string) => {
    setDestination(stop);
    setDestinationSelected(true);
    setDestinationSuggestions([]);
    destinationInputRef.current?.blur();
    // If origin is already selected, auto-plan route
    if (originSelected) {
      autoPlanRoute(origin, stop);
    }
  };

  // Auto-plan route with current time
  const autoPlanRoute = async (originVal: string, destinationVal: string) => {
    setLoading(true);
    setError('');
    setRoutePlans([]);
    setNextBusTime(null);
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
      const request = {
        origin: originVal,
        destination: destinationVal,
        preferred_time: currentTime,
        max_wait_time: 60,
        metro_line: selectedLine
      };
      logAnalytics('auto_route_planned_request', {
        origin: originVal,
        destination: destinationVal,
        preferred_time: currentTime,
        timestamp: new Date().toISOString()
      });
      const response = await apiService.planRoute(request);
      if (response.success && response.route_plans.length > 0) {
        logAnalytics('auto_route_planned_response', {
          route_plans: response.route_plans,
          timestamp: new Date().toISOString()
        });
        setRoutePlans(response.route_plans);
        // Show next bus time (departure of first segment)
        const firstSegment = response.route_plans[0].segments[0];
        if (firstSegment) {
          setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)));
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to plan route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual plan route (with user-selected preferred time)
  const planRoute = async () => {
    if (!originSelected || !destinationSelected) {
      setError('Please select both origin and destination from the dropdown');
      return;
    }
    setLoading(true);
    setError('');
    setRoutePlans([]);
    setNextBusTime(null);
    try {
      const request = {
        origin,
        destination,
        preferred_time: preferredTime ? convertTimeInputToAPI(preferredTime) : undefined,
        max_wait_time: 60,
        metro_line: selectedLine
      };
      const response = await apiService.planRoute(request);
      if (response.success && response.route_plans.length > 0) {
        setRoutePlans(response.route_plans);
        const firstSegment = response.route_plans[0].segments[0];
        if (firstSegment) {
          setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)));
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to plan route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Green Metro Bus Route Planner
        </h1>
        <p className="text-gray-600">
          Find the best routes between stops in Islamabad
        </p>
      </div>
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Origin */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              From <span className="text-red-500">*</span>
            </label>
            <input
              ref={originInputRef}
              type="text"
              value={origin}
              onChange={e => handleOriginChange(e.target.value)}
              onBlur={() => setTimeout(() => setOriginSuggestions([]), 100)}
              placeholder="Type to search for a stop..."
              className={`input-field ${!originSelected && origin ? 'border-red-300' : ''}`}
              autoComplete="off"
            />
            {!originSelected && origin && (
              <p className="text-red-500 text-xs mt-1">Please select a stop from the dropdown</p>
            )}
            {originSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {originSuggestions.map((stop, idx) => (
                  <div
                    key={stop + idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => selectOrigin(stop)}
                  >
                    {stop}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Navigation className="inline w-4 h-4 mr-1" />
              To <span className="text-red-500">*</span>
            </label>
            <input
              ref={destinationInputRef}
              type="text"
              value={destination}
              onChange={e => handleDestinationChange(e.target.value)}
              onBlur={() => setTimeout(() => setDestinationSuggestions([]), 100)}
              placeholder="Type to search for a stop..."
              className={`input-field ${!destinationSelected && destination ? 'border-red-300' : ''}`}
              autoComplete="off"
            />
            {!destinationSelected && destination && (
              <p className="text-red-500 text-xs mt-1">Please select a stop from the dropdown</p>
            )}
            {destinationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destinationSuggestions.map((stop, idx) => (
                  <div
                    key={stop + idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => selectDestination(stop)}
                  >
                    {stop}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Preferred Time (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={preferredTime}
              onChange={e => setPreferredTime(e.target.value)}
              className="input-field max-w-xs"
            />
            <span className="text-sm text-gray-500">
              {preferredTime && `(${formatTime12Hour(preferredTime)})`}
            </span>
          </div>
        </div>
        <button
          onClick={planRoute}
          disabled={loading || !originSelected || !destinationSelected}
          className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              Planning Route...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Search className="w-4 h-4 mr-2" />
              Find Route
            </div>
          )}
        </button>
        {nextBusTime && !loading && (
          <div className="mt-4 p-3 bg-green-50 border border-metro-green text-metro-green rounded-lg text-center">
            <Clock className="inline w-4 h-4 mr-1" />
            Next bus departs at: <span className="font-semibold">{nextBusTime}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
      {routePlans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Route Options
          </h2>
          {routePlans.map((plan, index) => (
            <div key={index} className="card slide-up">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Option {index + 1} 
              </h3>
              <div className="space-y-3">
                {plan.segments.map((segment, segIndex) => (
                  <div key={segIndex} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
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
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                <ul className="space-y-1">
                  {plan.instructions.map((instruction, instIndex) => (
                    <li key={instIndex} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-metro-green rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;