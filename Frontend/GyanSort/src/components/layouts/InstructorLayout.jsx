import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../stick/Navbar';
import Footer from '../stick/Footer';

const InstructorLayout = ({ children }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in and is an instructor
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    const userInfoStr = localStorage.getItem('user_info');
    
    if (!token || userRole !== 'instructor') {
      navigate('/login');
      return;
    }
    
    if (userInfoStr) {
      try {
        const parsedUserInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Error parsing user info:', error);
        navigate('/login');
      }
    }
  }, [navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white hidden md:block">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Instructor Panel</h2>
            
            <nav>
              <ul>
                <li className="mb-2">
                  <Link 
                    to="/instructor/dashboard" 
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="mb-2">
                  <Link 
                    to="/instructor/courses" 
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    My Courses
                  </Link>
                </li>
                <li className="mb-2">
                  <Link 
                    to="/instructor/create-course" 
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Create Course
                  </Link>
                </li>
                <li className="mb-2">
                  <Link 
                    to="/instructor/earnings" 
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Earnings
                  </Link>
                </li>
                <li className="mb-2">
                  <Link 
                    to="/instructor/profile" 
                    className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-100">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InstructorLayout;