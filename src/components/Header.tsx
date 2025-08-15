// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Bus, MessageCircle, Info, Train } from 'lucide-react';
// import { useMetroLine } from '../contexts/MetroLineContext';

// const Header: React.FC = () => {
//   const location = useLocation();
//   const { selectedLine, setSelectedLine, availableLines, currentLineInfo } = useMetroLine();

//   const isActive = (path: string) => {
//     return location.pathname === path;
//   };

//   const handleLineToggle = () => {
//     const newLine = selectedLine === 'GREEN' ? 'BLUE' : 'GREEN';
//     setSelectedLine(newLine);
//   };

//   const getLineColor = () => {
//     return currentLineInfo?.color || '#22c55e';
//   };

//   return (
//     <header className="bg-white shadow-md border-b border-gray-200">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2 text-metro-green hover:text-metro-dark transition-colors">
//             <Bus size={32} style={{ color: getLineColor() }} />
//             <div>
//               <h1 className="text-xl font-bold" style={{ color: getLineColor() }}>
//                 {currentLineInfo?.name || 'Metro'}
//               </h1>
//               <p className="text-xs text-gray-600">Route Planner</p>
//             </div>
//           </Link>

//           {/* Metro Line Toggler */}
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">Line:</span>
//               <button
//                 onClick={handleLineToggle}
//                 className="flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
//                 style={{
//                   borderColor: getLineColor(),
//                   backgroundColor: `${getLineColor()}10`,
//                   color: getLineColor()
//                 }}
//               >
//                 <Train size={16} />
//                 <span className="font-medium">{selectedLine}</span>
//                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLineColor() }}></div>
//               </button>
//             </div>

//             {/* Navigation */}
//             <nav className="flex items-center space-x-6">
//               <Link
//                 to="/"
//                 className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                   isActive('/') 
//                     ? 'text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//                 style={isActive('/') ? { backgroundColor: getLineColor() } : {}}
//               >
//                 <Bus size={20} />
//                 <span>Route Planner</span>
//               </Link>

//               <Link
//                 to="/chat"
//                 className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                   isActive('/chat') 
//                     ? 'text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//                 style={isActive('/chat') ? { backgroundColor: getLineColor() } : {}}
//               >
//                 <MessageCircle size={20} />
//                 <span>AI Assistant</span>
//               </Link>

//               <Link
//                 to="/about"
//                 className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                   isActive('/about') 
//                     ? 'text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//                 style={isActive('/about') ? { backgroundColor: getLineColor() } : {}}
//               >
//                 <Info size={20} />
//                 <span>About</span>
//               </Link>
//             </nav>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header; 

// "use client"

// import type React from "react"
// import { Link, useLocation } from "react-router-dom"
// import { Bus, MessageCircle, Info, Train } from "lucide-react"
// import { useMetroLine } from "../contexts/MetroLineContext"

// const Header: React.FC = () => {
//   const location = useLocation()
//   const { selectedLine, setSelectedLine, currentLineInfo } = useMetroLine()

//   const isActive = (path: string) => location.pathname === path

//   const handleLineToggle = () => {
//     const newLine = selectedLine === "GREEN" ? "BLUE" : "GREEN"
//     setSelectedLine(newLine)
//   }

//   const getLineColor = () => currentLineInfo?.color || "#22c55e"

//   return (
//     <>
//       <header className="bg-white shadow-lg border-b-4 border-emerald-500">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between h-20">
//             {/* Logo */}
//             <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
//               <img src="/logo.jpeg" alt="CMTA Logo" className="h-12 w-12 object-contain" />
//               <div>
//                 {/* <h1 className="text-2xl font-bold text-emerald-600">
//                   {currentLineInfo?.name || "Green Line"}
//                 </h1> */}
//                 <h1
//                   className="text-2xl font-bold bg-clip-text text-transparent"
//                   style={{
//                     backgroundImage:
//                       selectedLine === "GREEN"
//                         ? "linear-gradient(to right, #059669, #34d399)" // Green gradient
//                         : "linear-gradient(to right, #2563eb, #60a5fa)" // Blue gradient
//                   }}
//                 >
//                   {currentLineInfo?.name || (selectedLine === "GREEN" ? "Green Line" : "Blue Line")}
//                 </h1>

//                 <p className="text-sm text-gray-600 font-medium">Metro Route Planner</p>
//               </div>
//             </Link>

//             {/* Metro Line Toggler */}
//             <div className="flex items-center space-x-6">
//               <div className="flex items-center space-x-3">
//                 <span className="text-sm font-medium text-gray-700">Line:</span>
//                 <button
//                   onClick={handleLineToggle}
//                   className="flex items-center space-x-3 px-4 py-2 rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold"
//                   style={{
//                     borderColor: getLineColor(),
//                     backgroundColor: selectedLine === "GREEN" ? "#10b981" : "#3b82f6",
//                     color: "white",
//                   }}
//                 >
//                   <Train size={18} />
//                   <span>{selectedLine}</span>
//                   <div
//                     className="w-3 h-3 rounded-full border-2 border-white"
//                     style={{ backgroundColor: getLineColor() }}
//                   ></div>
//                 </button>
//               </div>

//               {/* Navigation */}
//               <nav className="flex items-center space-x-2">
//                 <Link
//                   to="/"
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/") ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
//                     }`}
//                   style={isActive("/") ? { backgroundColor: getLineColor() } : {}}
//                 >
//                   <Bus size={20} />
//                   <span>Route Planner</span>
//                 </Link>

//                 <Link
//                   to="/chat"
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/chat")
//                     ? "text-white shadow-md"
//                     : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
//                     }`}
//                   style={isActive("/chat") ? { backgroundColor: getLineColor() } : {}}
//                 >
//                   <MessageCircle size={20} />
//                   <span>AI Assistant</span>
//                 </Link>

//                 <Link
//                   to="/about"
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/about")
//                     ? "text-white shadow-md"
//                     : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
//                     }`}
//                   style={isActive("/about") ? { backgroundColor: getLineColor() } : {}}
//                 >
//                   <Info size={20} />
//                   <span>About</span>
//                 </Link>
//               </nav>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Header with Metro Buses (now under navbar) */}

//       <div className="relative w-full">
//         <img
//           src="/header.jpeg"
//           alt="Metro Buses"
//           className="w-full object-contain" // show full image without cutting
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
//       </div>

//     </>
//   )
// }

// export default Header
"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Bus, MessageCircle, Info, Train, BarChart3 } from "lucide-react"
import { useMetroLine } from "../contexts/MetroLineContext"

const Header: React.FC = () => {
  const location = useLocation()
  const { selectedLine, setSelectedLine, currentLineInfo } = useMetroLine()

  const isActive = (path: string) => location.pathname === path

  const handleLineToggle = () => {
    const newLine = selectedLine === "GREEN" ? "BLUE" : "GREEN"
    setSelectedLine(newLine)
  }

  const getLineColor = () => {
    if (selectedLine === "GREEN") return "#10b981" // green
    if (selectedLine === "BLUE") return "#5194f6" // blue for nav, buttons, and title
    return currentLineInfo?.color || "#22c55e"
  }

  return (
    <>
      {/* Header with dynamic bottom border */}
      <header
        className="bg-white shadow-lg"
        style={{
          borderBottom: `3px solid ${getLineColor()}`, // dynamic border thickness
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 flex-wrap md:flex-nowrap">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-4 hover:opacity-90 transition-opacity"
            >
              <img src="/logo.jpeg" alt="CMTA Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    color:
                      selectedLine === "GREEN"
                        ? "#10b981"
                        : "#5194f6", // updated blue title
                  }}
                >
                  {currentLineInfo?.name || (selectedLine === "GREEN" ? "Green Line" : "Blue Line")}
                </h1>
                <p className="text-sm text-gray-600 font-medium">Metro Route Planner</p>
              </div>
            </Link>

            {/* Metro Line Toggler + Navigation */}
            <div className="flex items-center space-x-6 flex-wrap md:flex-nowrap mt-2 md:mt-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Line:</span>
                <button
                  onClick={handleLineToggle}
                  className="flex items-center space-x-3 px-4 py-2 rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold"
                  style={{
                    borderColor: getLineColor(),
                    backgroundColor: getLineColor(),
                    color: "white",
                  }}
                >
                  <Train size={18} />
                  <span>{selectedLine}</span>
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: getLineColor() }}
                  ></div>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex items-center space-x-2 flex-wrap md:flex-nowrap mt-2 md:mt-0">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/") ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
                  }`}
                  style={isActive("/") ? { backgroundColor: getLineColor() } : {}}
                >
                  <Bus size={20} />
                  <span>Route Planner</span>
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/chat") ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
                  }`}
                  style={isActive("/chat") ? { backgroundColor: getLineColor() } : {}}
                >
                  <MessageCircle size={20} />
                  <span>AI Assistant</span>
                </Link>
                  
              <Link
                to="/analytics"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/analytics') 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive('/analytics') ? { backgroundColor: getLineColor() } : {}}
              >
                <BarChart3 size={20} />
                <span>Analytics</span>
              </Link>
                <Link
                  to="/about"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/about") ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
                  }`}
                  style={isActive("/about") ? { backgroundColor: getLineColor() } : {}}
                >
                  <Info size={20} />
                  <span>About</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header with Metro Buses */}
      <div
        className="relative w-full"
        style={{ borderTop: `4px solid ${getLineColor()}` }} // dynamic top line
      >
        <img
          src="/header.jpeg"
          alt="Metro Buses"
          className="w-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      </div>
    </>
  )
}

export default Header
