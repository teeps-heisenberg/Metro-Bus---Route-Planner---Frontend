// import React, { useState, useRef, useEffect } from 'react';
// import { Search, MapPin, Clock, Navigation, Bus } from 'lucide-react';
// import { apiService, RoutePlan } from '../services/api';
// import { useMetroLine } from '../contexts/MetroLineContext';
// import { logAnalytics } from '../supabase/helpers/logAnalytics';
// import { log } from 'console';
// // Utility function to convert 24-hour time to 12-hour format
// const formatTime12Hour = (time24: string): string => {
//   try {
//     const [hours, minutes] = time24.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const hour12 = hour % 12 || 12;
//     return `${hour12}:${minutes} ${ampm}`;
//   } catch {
//     return time24;
//   }
// };

// // Utility function to convert HTML time input (24-hour) to API format
// const convertTimeInputToAPI = (timeInput: string): string => {
//   try {
//     // HTML time input returns "HH:MM" format, we need "HH:MM:SS"
//     return `${timeInput}:00`;
//   } catch {
//     return timeInput;
//   }
// };

// const RoutePlanner: React.FC = () => {
//   const [origin, setOrigin] = useState('');
//   const [destination, setDestination] = useState('');
//   const [preferredTime, setPreferredTime] = useState('');
//   const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [allStops, setAllStops] = useState<string[]>([]);
//   const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
//   const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
//   const [nextBusTime, setNextBusTime] = useState<string | null>(null);
//   const [originSelected, setOriginSelected] = useState(false);
//   const [destinationSelected, setDestinationSelected] = useState(false);
//   const originInputRef = useRef<HTMLInputElement>(null);
//   const destinationInputRef = useRef<HTMLInputElement>(null);
//   const { selectedLine } = useMetroLine();

//   // Fetch all stops on mount
//   useEffect(() => {
//     const fetchStops = async () => {
//       try {
//         const res = await apiService.getAllStops(selectedLine);
//         setAllStops(res.stops || []);
//       } catch {
//         setAllStops([]);
//       }
//     };
//     fetchStops();
//   }, [selectedLine]);

//   // Filter suggestions from all stops
//   const filterSuggestions = (query: string) => {
//     if (!query) return [];
//     const q = query.toLowerCase();
//     return allStops.filter(stop => stop.toLowerCase().includes(q)).slice(0, 10);
//   };

//   // Handlers for input changes
//   const handleOriginChange = (value: string) => {
//     setOrigin(value);
//     setOriginSelected(false);
//     setOriginSuggestions(filterSuggestions(value));
//     setNextBusTime(null);
//     setRoutePlans([]);
//   };

//   const handleDestinationChange = (value: string) => {
//     setDestination(value);
//     setDestinationSelected(false);
//     setDestinationSuggestions(filterSuggestions(value));
//     setNextBusTime(null);
//     setRoutePlans([]);
//   };

//   // Select suggestion
//   const selectOrigin = (stop: string) => {
//     setOrigin(stop);
//     setOriginSelected(true);
//     setOriginSuggestions([]);
//     originInputRef.current?.blur();
//     // If destination is already selected, auto-plan route
//     if (destinationSelected) {
//       autoPlanRoute(stop, destination);
//     }
//   };

//   const selectDestination = (stop: string) => {
//     setDestination(stop);
//     setDestinationSelected(true);
//     setDestinationSuggestions([]);
//     destinationInputRef.current?.blur();
//     // If origin is already selected, auto-plan route
//     if (originSelected) {
//       autoPlanRoute(origin, stop);
//     }
//   };

//   // Auto-plan route with current time
//   const autoPlanRoute = async (originVal: string, destinationVal: string) => {
//     setLoading(true);
//     setError('');
//     setRoutePlans([]);
//     setNextBusTime(null);
//     try {
//       const now = new Date();
//       const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
//       const request = {
//         origin: originVal,
//         destination: destinationVal,
//         preferred_time: currentTime,
//         max_wait_time: 60,
//         metro_line: selectedLine
//       };
//       logAnalytics('auto_route_planned_request', {
//         origin: originVal,
//         destination: destinationVal,
//         preferred_time: currentTime,
//         timestamp: new Date().toISOString()
//       });
//       const response = await apiService.planRoute(request);
//       if (response.success && response.route_plans.length > 0) {
//         logAnalytics('auto_route_planned_response', {
//           route_plans: response.route_plans,
//           timestamp: new Date().toISOString()
//         });
//         setRoutePlans(response.route_plans);
//         // Show next bus time (departure of first segment)
//         const firstSegment = response.route_plans[0].segments[0];
//         if (firstSegment) {
//           setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)));
//         }
//       } else {
//         setError(response.message);
//       }
//     } catch (err) {
//       setError('Failed to plan route. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Manual plan route (with user-selected preferred time)
//   const planRoute = async () => {
//     if (!originSelected || !destinationSelected) {
//       setError('Please select both origin and destination from the dropdown');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     setRoutePlans([]);
//     setNextBusTime(null);
//     try {
//       const request = {
//         origin,
//         destination,
//         preferred_time: preferredTime ? convertTimeInputToAPI(preferredTime) : undefined,
//         max_wait_time: 60,
//         metro_line: selectedLine
//       };
//       const response = await apiService.planRoute(request);
//       if (response.success && response.route_plans.length > 0) {
//         setRoutePlans(response.route_plans);
//         const firstSegment = response.route_plans[0].segments[0];
//         if (firstSegment) {
//           setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)));
//         }
//       } else {
//         setError(response.message);
//       }
//     } catch (err) {
//       setError('Failed to plan route. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           Green Metro Bus Route Planner
//         </h1>
//         <p className="text-gray-600">
//           Find the best routes between stops in Islamabad
//         </p>
//       </div>
//       <div className="card mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           {/* Origin */}
//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <MapPin className="inline w-4 h-4 mr-1" />
//               From <span className="text-red-500">*</span>
//             </label>
//             <input
//               ref={originInputRef}
//               type="text"
//               value={origin}
//               onChange={e => handleOriginChange(e.target.value)}
//               onBlur={() => setTimeout(() => setOriginSuggestions([]), 100)}
//               placeholder="Type to search for a stop..."
//               className={`input-field ${!originSelected && origin ? 'border-red-300' : ''}`}
//               autoComplete="off"
//             />
//             {!originSelected && origin && (
//               <p className="text-red-500 text-xs mt-1">Please select a stop from the dropdown</p>
//             )}
//             {originSuggestions.length > 0 && (
//               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                 {originSuggestions.map((stop, idx) => (
//                   <div
//                     key={stop + idx}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                     onMouseDown={() => selectOrigin(stop)}
//                   >
//                     {stop}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           {/* Destination */}
//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <Navigation className="inline w-4 h-4 mr-1" />
//               To <span className="text-red-500">*</span>
//             </label>
//             <input
//               ref={destinationInputRef}
//               type="text"
//               value={destination}
//               onChange={e => handleDestinationChange(e.target.value)}
//               onBlur={() => setTimeout(() => setDestinationSuggestions([]), 100)}
//               placeholder="Type to search for a stop..."
//               className={`input-field ${!destinationSelected && destination ? 'border-red-300' : ''}`}
//               autoComplete="off"
//             />
//             {!destinationSelected && destination && (
//               <p className="text-red-500 text-xs mt-1">Please select a stop from the dropdown</p>
//             )}
//             {destinationSuggestions.length > 0 && (
//               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                 {destinationSuggestions.map((stop, idx) => (
//                   <div
//                     key={stop + idx}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                     onMouseDown={() => selectDestination(stop)}
//                   >
//                     {stop}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             <Clock className="inline w-4 h-4 mr-1" />
//             Preferred Time (Optional)
//           </label>
//           <div className="flex items-center space-x-2">
//             <input
//               type="time"
//               value={preferredTime}
//               onChange={e => setPreferredTime(e.target.value)}
//               className="input-field max-w-xs"
//             />
//             <span className="text-sm text-gray-500">
//               {preferredTime && `(${formatTime12Hour(preferredTime)})`}
//             </span>
//           </div>
//         </div>
//         <button
//           onClick={planRoute}
//           disabled={loading || !originSelected || !destinationSelected}
//           className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <div className="spinner mr-2"></div>
//               Planning Route...
//             </div>
//           ) : (
//             <div className="flex items-center justify-center">
//               <Search className="w-4 h-4 mr-2" />
//               Find Route
//             </div>
//           )}
//         </button>
//         {nextBusTime && !loading && (
//           <div className="mt-4 p-3 bg-green-50 border border-metro-green text-metro-green rounded-lg text-center">
//             <Clock className="inline w-4 h-4 mr-1" />
//             Next bus departs at: <span className="font-semibold">{nextBusTime}</span>
//           </div>
//         )}
//         {error && (
//           <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}
//       </div>
//       {routePlans.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//             Route Options
//           </h2>
//           {routePlans.map((plan, index) => (
//             <div key={index} className="card slide-up">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                 Option {index + 1} 
//               </h3>
//               <div className="space-y-3">
//                 {plan.segments.map((segment, segIndex) => (
//                   <div key={segIndex} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
//                     <Bus className="w-5 h-5 text-metro-green flex-shrink-0" />
//                     <div className="flex-1">
//                       <div className="font-medium text-gray-800">
//                         {segment.route_name} ({segment.direction})
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         {segment.start_stop} → {segment.end_stop}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm font-medium text-gray-800">
//                         {formatTime12Hour(segment.departure_time.substring(0, 5))} - {formatTime12Hour(segment.arrival_time.substring(0, 5))}
//                       </div>
//                       <div className="text-xs text-gray-600">
//                         {segment.duration_minutes}m
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
//                 <ul className="space-y-1">
//                   {plan.instructions.map((instruction, instIndex) => (
//                     <li key={instIndex} className="text-sm text-gray-600 flex items-start">
//                       <span className="w-2 h-2 bg-metro-green rounded-full mt-2 mr-2 flex-shrink-0"></span>
//                       {instruction}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoutePlanner;

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Clock, Navigation, Bus, Route, ArrowRight } from "lucide-react"
import { apiService, type RoutePlan } from "../services/api"
import { useMetroLine } from "../contexts/MetroLineContext"
import { logAnalytics } from "../supabase/helpers/logAnalytics"

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string): string => {
  try {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  } catch {
    return time24
  }
}

// Utility function to convert HTML time input (24-hour) to API format
const convertTimeInputToAPI = (timeInput: string): string => {
  try {
    return `${timeInput}:00`
  } catch {
    return timeInput
  }
}

const RoutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [allStops, setAllStops] = useState<string[]>([])
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [nextBusTime, setNextBusTime] = useState<string | null>(null)
  const [originSelected, setOriginSelected] = useState(false)
  const [destinationSelected, setDestinationSelected] = useState(false)
  const originInputRef = useRef<HTMLInputElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)
  const { selectedLine } = useMetroLine()

  // Fetch all stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await apiService.getAllStops(selectedLine)
        setAllStops(res.stops || [])
      } catch {
        setAllStops([])
      }
    }
    fetchStops()
  }, [selectedLine])

  const filterSuggestions = (query: string) => {
    if (!query) return []
    const q = query.toLowerCase()
    return allStops.filter((stop) => stop.toLowerCase().includes(q)).slice(0, 10)
  }

  const handleOriginChange = (value: string) => {
    setOrigin(value)
    setOriginSelected(false)
    setOriginSuggestions(filterSuggestions(value))
    setNextBusTime(null)
    setRoutePlans([])
  }

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    setDestinationSelected(false)
    setDestinationSuggestions(filterSuggestions(value))
    setNextBusTime(null)
    setRoutePlans([])
  }

  const selectOrigin = (stop: string) => {
    setOrigin(stop)
    setOriginSelected(true)
    setOriginSuggestions([])
    originInputRef.current?.blur()
    if (destinationSelected) {
      autoPlanRoute(stop, destination)
    }
  }

  const selectDestination = (stop: string) => {
    setDestination(stop)
    setDestinationSelected(true)
    setDestinationSuggestions([])
    destinationInputRef.current?.blur()
    if (originSelected) {
      autoPlanRoute(origin, stop)
    }
  }

  const autoPlanRoute = async (originVal: string, destinationVal: string) => {
    setLoading(true)
    setError("")
    setRoutePlans([])
    setNextBusTime(null)
    try {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 8)
      const request = {
        origin: originVal,
        destination: destinationVal,
        preferred_time: currentTime,
        max_wait_time: 60,
        metro_line: selectedLine,
      }
      logAnalytics("auto_route_planned_request", {
        origin: originVal,
        destination: destinationVal,
        preferred_time: currentTime,
        timestamp: new Date().toISOString(),
      },selectedLine.toString())
      const response = await apiService.planRoute(request)
      if (response.success && response.route_plans.length > 0) {
        logAnalytics("auto_route_planned_response", {
          route_plans: response.route_plans,
          timestamp: new Date().toISOString(),
        },selectedLine.toString())
        setRoutePlans(response.route_plans)
        const firstSegment = response.route_plans[0].segments[0]
        if (firstSegment) {
          setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)))
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to plan route. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const planRoute = async () => {
    if (!originSelected || !destinationSelected) {
      setError("Please select both origin and destination from the dropdown")
      return
    }
    setLoading(true)
    setError("")
    setRoutePlans([])
    setNextBusTime(null)
    try {
      const request = {
        origin,
        destination,
        preferred_time: preferredTime ? convertTimeInputToAPI(preferredTime) : undefined,
        max_wait_time: 60,
        metro_line: selectedLine,
      }
      const response = await apiService.planRoute(request)
      if (response.success && response.route_plans.length > 0) {
        setRoutePlans(response.route_plans)
        const firstSegment = response.route_plans[0].segments[0]
        if (firstSegment) {
          setNextBusTime(formatTime12Hour(firstSegment.departure_time.substring(0, 5)))
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError("Failed to plan route. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6"> {/* increased width and padding */}
      <div className="text-center mb-6">
        <h1
          className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent leading-tight"
          style={{
            backgroundImage:
              selectedLine === "GREEN"
                ? "linear-gradient(135deg, #059669, #34d399, #10b981)"
                : "linear-gradient(135deg, #2563eb, #60a5fa, #3b82f6)",
          }}
        >
          {selectedLine === "GREEN" ? "Green" : "Blue"} Metro Bus Route Planner
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Find the best routes between stops in Islamabad with real-time scheduling
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6 backdrop-blur-sm"> {/* increased padding */}
        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Origin */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mr-2">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              From <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              ref={originInputRef}
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onBlur={() => setTimeout(() => setOriginSuggestions([]), 100)}
              placeholder="Type to search for a stop..."
              className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-sm ${
                !originSelected && origin ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-emerald-400 bg-white"
              }`}
              autoComplete="off"
            />
            {!originSelected && origin && (
              <p className="text-red-600 text-xs mt-1 font-medium flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Please select a stop from the dropdown
              </p>
            )}
            {originSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {originSuggestions.map((stop, idx) => (
                  <div
                    key={stop + idx}
                    className="px-3 py-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    onMouseDown={() => selectOrigin(stop)}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-emerald-600 mr-2" />
                      <span className="font-medium text-gray-800 text-sm">{stop}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                <Navigation className="w-3 h-3 text-white" />
              </div>
              To <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              ref={destinationInputRef}
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onBlur={() => setTimeout(() => setDestinationSuggestions([]), 100)}
              placeholder="Type to search for a stop..."
              className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm ${
                !destinationSelected && destination ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400 bg-white"
              }`}
              autoComplete="off"
            />
            {!destinationSelected && destination && (
              <p className="text-red-600 text-xs mt-1 font-medium flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Please select a stop from the dropdown
              </p>
            )}
            {destinationSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {destinationSuggestions.map((stop, idx) => (
                  <div
                    key={stop + idx}
                    className="px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    onMouseDown={() => selectDestination(stop)}
                  >
                    <div className="flex items-center">
                      <Navigation className="w-3 h-3 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-800 text-sm">{stop}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preferred Time */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-2">
              <Clock className="w-3 h-3 text-white" />
            </div>
            Preferred Time (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 hover:border-orange-400 bg-white shadow-sm max-w-xs"
            />
            {preferredTime && (
              <span className="text-sm text-gray-700 font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                {formatTime12Hour(preferredTime)}
              </span>
            )}
          </div>
        </div>

        {/* Plan Route Button */}
        <button
          onClick={planRoute}
          disabled={loading || !originSelected || !destinationSelected}
          className={`w-full md:w-auto px-6 py-2 text-base rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md ${
            selectedLine === "GREEN"
              ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 hover:shadow-emerald-500/30"
              : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:shadow-blue-500/30"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Planning Your Route...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Search className="w-4 h-4 mr-2" />
              Find Best Route
            </div>
          )}
        </button>

        {/* Next Bus Time */}
        {nextBusTime && !loading && (
          <div
            className={`mt-4 p-3 rounded-lg border-2 text-center font-semibold text-sm shadow-sm ${
              selectedLine === "GREEN"
                ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-800"
                : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-800"
            }`}
          >
            <Clock className="inline w-4 h-4 mr-1" />
            Next bus departs at: <span className="text-lg font-bold">{nextBusTime}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 rounded-lg font-medium text-sm shadow-sm">
            {error}
          </div>
        )}
      </div>

      {/* Route Plans */}
      {routePlans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <Route className="w-5 h-5 mr-2" />
            Available Route Options
          </h2>
          {routePlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-lg" 
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 shadow-sm ${
                    selectedLine === "GREEN"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                >
                  {index + 1}
                </div>
                Route Option {index + 1}
              </h3>
              <div className="space-y-3">
                {plan.segments.map((segment, segIndex) => (
                  <div
                    key={segIndex}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        selectedLine === "GREEN"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                    >
                      <Bus className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-base mb-1">
                        {segment.route_name} ({segment.direction})
                      </div>
                      <div className="text-gray-600 font-medium text-sm flex items-center">
                        {segment.start_stop} <ArrowRight className="w-3 h-3 mx-2" /> {segment.end_stop}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800 mb-1">
                        {formatTime12Hour(segment.departure_time.substring(0, 5))} -{" "}
                        {formatTime12Hour(segment.arrival_time.substring(0, 5))}
                      </div>
                      <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                        {segment.duration_minutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 text-base flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      selectedLine === "GREEN" ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  ></span>
                  Step-by-Step Instructions:
                </h4>
                <ul className="space-y-2">
                  {plan.instructions.map((instruction, instIndex) => (
                    <li key={instIndex} className="text-gray-700 flex items-start font-medium text-sm">
                      <span
                        className={`w-2 h-2 rounded-full mt-1 mr-2 flex-shrink-0 ${
                          selectedLine === "GREEN" ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                      ></span>
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
  )
}

export default RoutePlanner
