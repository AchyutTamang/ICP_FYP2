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
    thumbnail: null,
    preview_video: null,
  });

  // Get token and user info on component mount
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
      
      // Get current user info
      fetchUserInfo(storedToken);
    }
  }, [navigate]);
  
  // Function to fetch user info
  const fetchUserInfo = async (token) => {
    try {
      // Try the current-user endpoint
      let response;
      try {
        response = await axios.get('http://localhost:8000/api/users/current-user/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        // If that fails, try the me endpoint which is more common
        console.log("Trying alternative endpoint for user info");
        response = await axios.get('http://localhost:8000/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Store user info in localStorage
      localStorage.setItem('user_info', JSON.stringify(response.data));
      console.log('User info stored:', response.data);
      
      // Store user ID separately for easier access
      if (response.data.id) {
        localStorage.setItem('user_id', response.data.id);
      } else if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      
      // Extract user ID from token as fallback
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.user_id) {
          console.log("Extracted user ID from token:", tokenData.user_id);
          localStorage.setItem('user_id', tokenData.user_id);
        }
      } catch (e) {
        console.error("Could not extract user info from token:", e);
      }
      
      toast.warning("Could not retrieve your account information. Some features may be limited.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", courseData);
    
    // Validate course data
    if (!courseData.title || !courseData.description || !courseData.thumbnail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (!userInfo.id) {
        toast.error('User information not found. Please log in again.');
        return;
      }
      
      // Store the course data temporarily
      setTempCourseData(courseData);
      
      // Store the course info in localStorage
      const courseInfo = {
        title: courseData.title,
        description: courseData.description,
        course_price: courseData.price || 0,
        is_free: courseData.price === "0" || courseData.price === "" || parseFloat(courseData.price) === 0,
        instructor: userInfo.id // Add instructor ID
      };
      
      localStorage.setItem('course_info', JSON.stringify(courseInfo));
      
      // Store the actual files in FormData objects
      if (courseData.thumbnail) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(courseData.thumbnail);
        reader.onload = () => {
          localStorage.setItem('course_thumbnail', reader.result);
        };
        localStorage.setItem('course_thumbnail_name', courseData.thumbnail.name);
      }
      
      if (courseData.preview_video) {
        // For preview video, just store the name as the file might be too large for localStorage
        localStorage.setItem('course_preview_video_name', courseData.preview_video.name);
        
        // Store a reference that we have a video file
        localStorage.setItem('has_preview_video', 'true');
      }
      
      // Redirect to category management page with course data
      navigate('/instructor/category-management', { 
        state: { 
          fromCourseCreation: true,
          courseInfo: courseInfo,
          hasThumbnail: !!courseData.thumbnail,
          hasPreviewVideo: !!courseData.preview_video,
          instructorId: userInfo.id
        } 
      });
    } catch (error) {
      console.error("Error preparing course data:", error);
      toast.error("Error preparing course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  // Add state to store form data temporarily
  const [tempCourseData, setTempCourseData] = useState(null);

  // Remove the entire duplicate handleSubmit function (lines ~158-219)
  
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

          <div className="mb-4">
            <label className="block text-white mb-2">Price</label>
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
              Demo Video of Course
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
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
              disabled={loading}
            >
              {loading ? "Creating..." : "Next"}
              {!loading && <span className="ml-2">→</span>}
            </button>
          </div>
        </form>
      </div>
    </InstructorPanel>
  )
}

export default CreateCourse;
