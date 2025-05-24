import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import InstructorPanel from './InstructorPanel'; 

const InstructorCourses = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/courses/instructor-courses/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Wrap the content with InstructorPanel
  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <Link
            to="/instructor/create-course"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
          >
            Create New Course
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-white">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl text-white mb-4">No courses yet</h2>
            <p className="text-gray-400 mb-6">You haven't created any courses yet. Start creating your first course now!</p>
            <Link
              to="/instructor/create-course"
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="relative pb-[56.25%]">
                  <img
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    className="absolute h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
                  <p className="text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-bold">${course.price}</span>
                    <span className="text-gray-400 text-sm">{course.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InstructorPanel>
  );
};

export default InstructorCourses;