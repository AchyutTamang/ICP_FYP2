import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Add FaStarHalfAlt to the imports
import { FaPlay, FaShoppingCart, FaHeart, FaStar, FaChevronDown, FaChevronUp, FaStarHalfAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../stick/Navbar';

const CourseDescription = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('introduction');

  // Add handleAddToCart function
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add courses to cart");
      navigate('/login');
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to cart");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/cart/add/',
        { course_id: courseId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.status === 201) {
        toast.success("Course added to cart successfully!");
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || "Failed to add course to cart");
    }
  };

  // Add handleBuyNow function
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase courses");
      navigate('/login');
      return;
    }
    navigate(`/payment/${courseId}`);
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Update the API endpoint to match your Django backend
        const response = await axios.get(`http://localhost:8000/api/courses/detail/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.data) {
          console.log('Course data:', response.data);
          console.log('Course price:', response.data.course_price);
          setCourse(response.data);
        } else {
          toast.error("No course data found");
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        setLoading(false);
        // More specific error messages
        if (error.response?.status === 404) {
          toast.error("Course not found");
        } else if (error.response?.status === 401) {
          toast.error("Please login to view course details");
        } else {
          toast.error("Failed to load course details. Please try again later.");
        }
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Add this section in the return statement after the Navbar
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Course Header with Instructor Info */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={course?.instructor?.profile_picture || "https://via.placeholder.com/40"}
              alt={course?.instructor?.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-white font-medium">{course?.instructor?.name}</h3>
              <p className="text-gray-400 text-sm">{course?.instructor?.title || 'Instructor'}</p>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">{course?.title}</h1>
          <p className="text-lg text-gray-300 mb-6">{course?.description}</p>
          
          {course?.demo_video && (
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <video
                className="w-full h-full object-cover"
                controls
                poster={course.course_thumbnail}
              >
                <source src={course.demo_video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
              <div className="space-y-2">
                {course?.modules?.map((module, index) => (
                  <div key={module.id} className="border border-gray-700 rounded-lg">
                    <button
                      className="w-full px-6 py-4 flex justify-between items-center text-white hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => toggleSection(module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#00FF40]">{index + 1}.</span>
                        <span>{module.title}</span>
                      </div>
                      {expandedSection === module.id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedSection === module.id && (
                      <div className="px-6 py-3 border-t border-gray-700">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <div 
                            key={lesson.id} 
                            className="flex items-center gap-3 py-3 text-gray-300 hover:text-white"
                          >
                            <FaPlay className="text-sm text-[#00FF40]" />
                            <span>{lesson.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg overflow-hidden sticky top-24">
              {course?.demo_video && (
                <div className="relative pt-[56.25%]">
                  <video
                    className="absolute top-0 left-0 w-full h-full"
                    controls
                    poster={course.course_thumbnail}
                  >
                    <source src={course.demo_video} type="video/mp4" />
                  </video>
                </div>
              )}
              <div className="p-6">
                <div className="text-3xl font-bold text-[#00FF40] mb-6">
                  {course?.is_free ? 'Free' : course?.price ? `Rs. ${course.price}` : 'Price not available'}
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 rounded-lg"
                  >
                    <FaShoppingCart className="inline mr-2" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="w-full bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 rounded-lg"
                  >
                    Buy Now
                  </button>
                  <button className="w-full border border-[#00FF40] text-[#00FF40] hover:bg-[#00FF40] hover:text-black font-bold py-3 rounded-lg">
                    <FaHeart className="inline mr-2" />
                    Add to Wishlist
                  </button>
                </div>
                <div className="mt-6 space-y-3 text-gray-300">
                  <p className="flex items-center gap-2">✓ {course?.total_hours || 0} hours of content</p>
                  <p className="flex items-center gap-2">✓ {course?.total_lessons || 0} lessons</p>
                  <p className="flex items-center gap-2">✓ Full lifetime access</p>
                  <p className="flex items-center gap-2">✓ Certificate of completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDescription;