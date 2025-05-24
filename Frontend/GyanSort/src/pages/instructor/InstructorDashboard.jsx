import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InstructorLayout from '../../components/layouts/InstructorLayout';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/instructors/dashboard/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Instructor Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Courses</h2>
                <p className="text-3xl font-bold text-[#00CC33]">{stats.totalCourses}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h2>
                <p className="text-3xl font-bold text-[#00CC33]">{stats.totalStudents}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h2>
                <p className="text-3xl font-bold text-[#00CC33]">₹{stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/instructor/create-course"
                  className="bg-[#00FF40] hover:bg-[#00CC33] text-black font-bold py-3 px-4 rounded text-center"
                >
                  Create New Course
                </Link>
                <Link 
                  to="/instructor/courses"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded text-center"
                >
                  Manage Courses
                </Link>
                <Link 
                  to="/instructor/profile"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded text-center"
                >
                  Update Profile
                </Link>
              </div>
            </div>
            
            {/* Recent Courses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Courses</h2>
              
              {stats.recentCourses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentCourses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={course.thumbnail} alt={course.title} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.students_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{course.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/instructor/courses/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Edit
                            </Link>
                            <Link to={`/course/${course.id}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
                  <Link 
                    to="/instructor/create-course"
                    className="inline-block bg-[#00FF40] hover:bg-[#00CC33] text-black font-bold py-2 px-4 rounded"
                  >
                    Create Your First Course
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;