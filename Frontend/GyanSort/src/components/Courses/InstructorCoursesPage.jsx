import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { FaPlus } from "react-icons/fa";

const InstructorCoursesPage = () => {
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userRole, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is an instructor
    if (!isAuthenticated || userRole !== "instructor") {
      navigate("/");
      return;
    }

    const fetchInstructorCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/courses/courses/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          // Filter courses created by this instructor
          // You might need to adjust this based on your API response structure
          const myCourses = response.data.filter(
            (course) => course.instructor === userId
          );
          setInstructorCourses(myCourses);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching instructor courses:", err);
        setError("Failed to load your courses. Please try again later.");
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [isAuthenticated, userRole, navigate, userId]);

  const handleCreateCourse = () => {
    navigate("/instructor/create-course");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Courses</h1>
            <button
              onClick={handleCreateCourse}
              className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-4 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Create New Course
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Create Course Card */}
              <div
                onClick={handleCreateCourse}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-dashed border-gray-600 hover:border-[#00FF40] cursor-pointer transition-all duration-300 flex flex-col items-center justify-center h-64"
              >
                <FaPlus className="text-[#00FF40] text-5xl mb-4" />
                <h3 className="text-xl font-semibold text-white">
                  Create New Course
                </h3>
                <p className="text-gray-400 mt-2 text-center px-4">
                  Share your knowledge with students around the world
                </p>
              </div>

              {/* Instructor's Courses */}
              {instructorCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-40 bg-gray-700 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span className="text-gray-500">No thumbnail</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-[#00FF40] font-bold">
                        Rs{course.price}
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/instructor/edit-course/${course.id}`)
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Edit Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 GyanSort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InstructorCoursesPage;
