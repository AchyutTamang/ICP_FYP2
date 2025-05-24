import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InstructorPanel = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get the current path to highlight active link
  const currentPath = location.pathname;

  // Sidebar links for instructors
  const sidebarLinks = [
    { name: 'My Courses', path: '/instructor/courses', icon: '📚' },
    { name: 'Create Course', path: '/instructor/create-course', icon: '➕' },
    { name: 'Earnings', path: '/instructor/earnings', icon: '💰' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-green-400">Instructor Panel</h2>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user?.fullname || 'Instructor'}</p>
        </div>
        <nav className="mt-6">
          <ul>
            {sidebarLinks.map((link, index) => (
              <li key={index} className="mb-2">
                <Link
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    currentPath === link.path 
                      ? 'bg-green-500 text-black font-bold' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Added bottom padding to prevent navbar overlap */}
        {children}
      </div>
    </div>
  );
};

export default InstructorPanel;