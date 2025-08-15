// import React from 'react';
// import { Bus, MapPin, Clock, Users, Shield, Zap } from 'lucide-react';

// const About: React.FC = () => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           About Green Metro Bus
//         </h1>
//         <p className="text-gray-600">
//           Islamabad's modern public transportation system
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* System Overview */}
//         <div className="card">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//             <Bus className="w-5 h-5 mr-2 text-metro-green" />
//             System Overview
//           </h2>
//           <p className="text-gray-600 mb-4">
//             The Green Metro Bus system serves Islamabad and Rawalpindi with modern, 
//             efficient public transportation. Our AI-powered route planner helps you 
//             navigate the network with ease.
//           </p>
//           <ul className="space-y-2 text-sm text-gray-600">
//             <li>• 42 feeder routes covering major areas</li>
//             <li>• 238 stops across the network</li>
//             <li>• Real-time route optimization</li>
//             <li>• AI-powered travel assistance</li>
//           </ul>
//         </div>

//         {/* Features */}
//         <div className="card">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//             <Zap className="w-5 h-5 mr-2 text-metro-green" />
//             Key Features
//           </h2>
//           <div className="space-y-3">
//             <div className="flex items-center space-x-3">
//               <MapPin className="w-5 h-5 text-metro-green" />
//               <span className="text-gray-700">Smart Route Planning</span>
//             </div>
//             <div className="flex items-center space-x-3">
//               <Clock className="w-5 h-5 text-metro-green" />
//               <span className="text-gray-700">Real-time Schedules</span>
//             </div>
//             <div className="flex items-center space-x-3">
//               <Users className="w-5 h-5 text-metro-green" />
//               <span className="text-gray-700">AI Travel Assistant</span>
//             </div>
//             <div className="flex items-center space-x-3">
//               <Shield className="w-5 h-5 text-metro-green" />
//               <span className="text-gray-700">Safe & Reliable</span>
//             </div>
//           </div>
//         </div>

//         {/* How to Use */}
//         <div className="card">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             How to Use
//           </h2>
//           <div className="space-y-4">
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-metro-green text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
//                 1
//               </div>
//               <div>
//                 <h3 className="font-medium text-gray-800">Plan Your Route</h3>
//                 <p className="text-sm text-gray-600">Enter your origin and destination to find the best routes.</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-metro-green text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
//                 2
//               </div>
//               <div>
//                 <h3 className="font-medium text-gray-800">Get AI Guidance</h3>
//                 <p className="text-sm text-gray-600">Chat with our AI assistant for personalized travel advice.</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-metro-green text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
//                 3
//               </div>
//               <div>
//                 <h3 className="font-medium text-gray-800">Travel Smart</h3>
//                 <p className="text-sm text-gray-600">Follow the detailed instructions and enjoy your journey.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Contact & Support */}
//         <div className="card">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Contact & Support
//           </h2>
//           <div className="space-y-3 text-sm text-gray-600">
//             <p>
//               <strong>Emergency:</strong> 1122<br />
//               <strong>Metro Information:</strong> 051-111-123-456<br />
//               <strong>Customer Service:</strong> 051-111-789-012
//             </p>
//             <p>
//               <strong>Operating Hours:</strong><br />
//               Monday - Sunday: 6:00 AM - 11:00 PM
//             </p>
//             <p>
//               <strong>Website:</strong> www.greenmetro.gov.pk<br />
//               <strong>Email:</strong> info@greenmetro.gov.pk
//             </p>
//           </div>
//         </div>
//       </div>


//     </div>
//   );
// };

// export default About; 

import React from "react";
import { Bus, MapPin, Clock, Users, Shield, Zap } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
      {/* Page Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1
          style={{
            color: "#008080",
            fontWeight: "bold",
            borderBottom: "3px solid #008080",
            paddingBottom: "0.5rem",
          }}
          className="text-3xl sm:text-4xl mb-4 sm:mb-6"
        >
          About
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Learn more about our modern public transportation system connecting Islamabad and Rawalpindi, designed for speed, safety, and convenience.
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Bus className="w-6 h-6 mr-2 text-green-600" />
            System Overview
          </h2>
          <p className="text-gray-600 mb-4">
            Our metro bus network connects key points in the twin cities with
            modern, efficient public transportation. The AI-powered route
            planner ensures you reach your destination smoothly.
          </p>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• 42 feeder routes covering major areas</li>
            <li>• 238 stops across the network</li>
            <li>• Real-time route optimization</li>
            <li>• AI-powered travel assistance</li>
          </ul>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-green-600" />
            Key Features
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>Smart Route Planning</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span>Real-time Schedules</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <span>AI Travel Assistant</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Safe & Reliable</span>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How to Use
          </h2>
          <div className="space-y-5">
            {[
              {
                step: "1",
                title: "Plan Your Route",
                desc: "Enter your origin and destination to find the best routes.",
              },
              {
                step: "2",
                title: "Get AI Guidance",
                desc: "Chat with our AI assistant for personalized travel advice.",
              },
              {
                step: "3",
                title: "Travel Smart",
                desc: "Follow the detailed instructions and enjoy your journey.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contact & Support
          </h2>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              <strong>Emergency:</strong> 1122
              <br />
              <strong>Metro Information:</strong> 051-111-123-456
              <br />
              <strong>Customer Service:</strong> 051-111-789-012
            </p>
            <p>
              <strong>Operating Hours:</strong>
              <br />
              Monday - Sunday: 6:00 AM - 11:00 PM
            </p>
            <p>
              <strong>Website:</strong> www.greenmetro.gov.pk
              <br />
              <strong>Email:</strong> info@greenmetro.gov.pk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
