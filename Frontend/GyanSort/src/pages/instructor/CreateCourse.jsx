import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import InstructorPanel from "./InstructorPanel";

const CreateCourse = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Course basic info
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    thumbnail: null,
    preview_video: null,
  });

  // Get token on component mount - KEEP ONLY THIS ONE useEffect for token checking
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
    
    if (!storedToken) {
      console.error("No authentication token found");
      toast.error("You need to be logged in to create a course");
      navigate("/");
    } else {
      console.log("Token available:", !!storedToken);
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, [navigate]);

  // Handle course data changes
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  const handleCourseFileChange = (e) => {
    const { name, files } = e.target;
    setCourseData({
      ...courseData,
      [name]: files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    // Validate course data
    if (!courseData.title || !courseData.description || !courseData.category || !courseData.thumbnail) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Get the token again to ensure it's the latest
    const currentToken = localStorage.getItem('access_token');
    
    // Check if token exists
    if (!currentToken) {
      toast.error('Authentication token not found. Please log in again.');
      navigate('/');
      return;
    }
    
    // Create the course
    setLoading(true);
    try {
      console.log("Creating course...", courseData);
      const data = new FormData();
      data.append('title', courseData.title);
      data.append('description', courseData.description);
      data.append('price', courseData.price || 0);
      data.append('category', courseData.category);
      data.append('is_free', courseData.price === '0' || courseData.price === '' ? 'true' : 'false');
      
      if (courseData.thumbnail) {
        data.append('thumbnail', courseData.thumbnail);
        console.log("Thumbnail added to form data");
      }
      
      if (courseData.preview_video) {
        data.append('preview_video', courseData.preview_video);
        console.log("Preview video added to form data");
      }

      console.log("Sending request to API...");
      const response = await axios.post(
        'http://localhost:8000/api/courses/create/',
        data,
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("Course created:", response.data);
      toast.success('Course information saved! Now add modules.');
      
      // Navigate to the module creation page with the course ID
      if (response.data && response.data.id) {
        navigate(`/instructor/courses/${response.data.id}/modules`);
      } else {
        console.error("No course ID in response:", response.data);
        toast.error("Failed to get course ID from server");
      }
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        toast.error(`Error: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Check your connection.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // REMOVE THIS SECOND useEffect - it's causing the issue
  // useEffect(() => {
  //   if (!token) {
  //     console.error("No authentication token found");
  //     toast.error("You need to be logged in to create a course");
  //     navigate("/");
  //   } else {
  //     console.log("Token available:", token ? "Yes" : "No");
  //   }
  // }, [token, navigate]);

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Create New Course
        </h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-white mb-2">Course Title*</label>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Description*</label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              rows="5"
              placeholder="Enter course description"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">Price ($)*</label>
              <input
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              <p className="text-gray-400 text-sm mt-1">
                Set to 0 for a free course
              </p>
            </div>

            <div>
              <label className="block text-white mb-2">Category*</label>
              <input
                type="text"
                name="category"
                value={courseData.category}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                placeholder="e.g., Programming, Design, Business"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Course Thumbnail*</label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleCourseFileChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              accept="image/*"
              required
            />
            <p className="text-gray-400 text-sm mt-1">
              Recommended size: 1280x720 pixels (16:9 ratio)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">
              Preview Video (Optional)
            </label>
            <input
              type="file"
              name="preview_video"
              onChange={handleCourseFileChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              accept="video/*"
            />
            <p className="text-gray-400 text-sm mt-1">
              Upload a short preview video of your course (max 50MB)
            </p>
          </div>

          <div className="flex justify-end">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => console.log("Test button clicked")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Test Console
              </button>
              
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
                disabled={loading}
              >
                {loading ? "Creating..." : "Next"}
                {!loading && <span className="ml-2">→</span>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </InstructorPanel>
  );
};

export default CreateCourse;
