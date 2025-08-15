"use client"

import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Bus, MessageCircle, Info, Train, BarChart3, Menu, X } from "lucide-react"
import { useMetroLine } from "../contexts/MetroLineContext"

const Header: React.FC = () => {
  const location = useLocation()
  const { selectedLine, setSelectedLine, currentLineInfo } = useMetroLine()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          borderBottom: `3px solid ${getLineColor()}`,
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
                        : "#5194f6",
                  }}
                >
                  {currentLineInfo?.name || (selectedLine === "GREEN" ? "Green Line" : "Blue Line")}
                </h1>
                <p className="text-sm text-gray-600 font-medium">Metro Route Planner</p>
              </div>
            </Link>

            {/* Hamburger menu for mobile */}
            <button
              className="md:hidden ml-auto p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Metro Line Toggler + Navigation (Desktop) */}
            <div className="hidden md:flex items-center space-x-6 flex-wrap md:flex-nowrap mt-2 md:mt-0">
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-100 px-4 py-4 z-50 w-full absolute left-0">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 mb-2">
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
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/") ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-emerald-600"
                  }`}
                  style={isActive("/") ? { backgroundColor: getLineColor() } : {}}
                  onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info size={20} />
                  <span>About</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Header with Metro Buses */}
      <div
        className="relative w-full"
        style={{ borderTop: `4px solid ${getLineColor()}` }}
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
