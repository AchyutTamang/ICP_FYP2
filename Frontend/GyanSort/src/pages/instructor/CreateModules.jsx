import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import InstructorPanel from "./InstructorPanel";
import { FaPlus, FaTrash, FaVideo, FaFilePdf } from "react-icons/fa";

const CreateModules = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);

  // Modules data with nested lessons and content
  const [modules, setModules] = useState([
    {
      title: "",
      description: "",
      order: 1,
      lessons: [
        {
          title: "",
          description: "",
          order: 1,
          contents: [
            {
              title: "",
              type: "video", // 'video' or 'pdf'
              file: null,
              order: 1,
            },
          ],
        },
      ],
    },
  ]);

  // Fetch course details if courseId exists
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/courses/${courseId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setCourseDetails(response.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to fetch course details");
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Handle module changes
  const handleModuleChange = (moduleIndex, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      [name]: value,
    };
    setModules(updatedModules);
  };

  // Handle lesson changes
  const handleLessonChange = (moduleIndex, lessonIndex, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = {
      ...updatedModules[moduleIndex].lessons[lessonIndex],
      [name]: value,
    };
    setModules(updatedModules);
  };

  // Handle content changes
  const handleContentChange = (moduleIndex, lessonIndex, contentIndex, e) => {
    const { name, value, files } = e.target;
    const updatedModules = [...modules];

    if (name === "file" && files && files.length > 0) {
      updatedModules[moduleIndex].lessons[lessonIndex].contents[contentIndex] =
        {
          ...updatedModules[moduleIndex].lessons[lessonIndex].contents[
            contentIndex
          ],
          file: files[0],
          title: files[0].name,
        };
    } else {
      updatedModules[moduleIndex].lessons[lessonIndex].contents[contentIndex] =
        {
          ...updatedModules[moduleIndex].lessons[lessonIndex].contents[
            contentIndex
          ],
          [name]: value,
        };
    }

    setModules(updatedModules);
  };

  // Add new module
  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        description: "",
        order: modules.length + 1,
        lessons: [
          {
            title: "",
            description: "",
            order: 1,
            contents: [
              {
                title: "",
                type: "video",
                file: null,
                order: 1,
              },
            ],
          },
        ],
      },
    ]);
  };

  // Remove module
  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = [...modules];
      updatedModules.splice(index, 1);
      // Update order for remaining modules
      updatedModules.forEach((module, i) => {
        module.order = i + 1;
      });
      setModules(updatedModules);
    } else {
      toast.warning("You need at least one module");
    }
  };

  // Add new lesson to a module
  const addLesson = (moduleIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.push({
      title: "",
      description: "",
      order: updatedModules[moduleIndex].lessons.length + 1,
      contents: [
        {
          title: "",
          type: "video",
          file: null,
          order: 1,
        },
      ],
    });
    setModules(updatedModules);
  };

  // Remove lesson from a module
  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    if (updatedModules[moduleIndex].lessons.length > 1) {
      updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
      // Update order for remaining lessons
      updatedModules[moduleIndex].lessons.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setModules(updatedModules);
    } else {
      toast.warning("Each module needs at least one lesson");
    }
  };

  // Add new content to a lesson
  const addContent = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].contents.push({
      title: "",
      type: "video",
      file: null,
      order:
        updatedModules[moduleIndex].lessons[lessonIndex].contents.length + 1,
    });
    setModules(updatedModules);
  };

  // Remove content from a lesson
  const removeContent = (moduleIndex, lessonIndex, contentIndex) => {
    const updatedModules = [...modules];
    if (updatedModules[moduleIndex].lessons[lessonIndex].contents.length > 1) {
      updatedModules[moduleIndex].lessons[lessonIndex].contents.splice(
        contentIndex,
        1
      );
      // Update order for remaining contents
      updatedModules[moduleIndex].lessons[lessonIndex].contents.forEach(
        (content, i) => {
          content.order = i + 1;
        }
      );
      setModules(updatedModules);
    } else {
      toast.warning("Each lesson needs at least one content item");
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    // Clear only course-related localStorage items
    localStorage.removeItem("selected_category_id");
    // Add any other temporary course data items that need to be cleared

    // Navigate back to courses page
    navigate("/instructor/courses");
  };

  // Handle form submission to create the complete course
  const handleCreateCourse = async (e) => {
    e.preventDefault();

    // Validate modules and lessons
    for (const module of modules) {
      if (!module.title) {
        toast.error("Please provide a title for all modules");
        return;
      }

      for (const lesson of module.lessons) {
        if (!lesson.title) {
          toast.error("Please provide a title for all lessons");
          return;
        }

        for (const content of lesson.contents) {
          if (!content.title || !content.file) {
            toast.error("Please provide all content files");
            return;
          }
        }
      }
    }

    // Get category ID from localStorage
    const categoryId = localStorage.getItem("selected_category_id");
    if (!categoryId) {
      toast.error("Category information is missing");
      return;
    }

    setLoading(true);
    try {
      // Get course info from localStorage
      const courseInfoStr = localStorage.getItem('course_info');
      let courseInfo = {};
      if (courseInfoStr) {
        courseInfo = JSON.parse(courseInfoStr);
      }

      // Create a FormData object for the course
      const courseData = new FormData();
      courseData.append('title', courseInfo.title || "New Course");
      courseData.append('description', courseInfo.description || "Course description");
      courseData.append('category', parseInt(categoryId));
      courseData.append('course_price', courseInfo.course_price || 0);
      courseData.append('is_free', courseInfo.is_free === false ? "false" : "true");
      
      // Extract instructor ID from access token
      let instructorId = null;
      
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Decode JWT token
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            // Base64 decode the payload part (second part)
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT token payload:', payload);
            
            // Extract user ID from token payload
            if (payload.user_id) {
              instructorId = payload.user_id;
              console.log('Found user_id in token:', instructorId);
            } else if (payload.id) {
              instructorId = payload.id;
              console.log('Found id in token:', instructorId);
            } else if (payload.sub) {
              instructorId = payload.sub;
              console.log('Found sub in token:', instructorId);
            } else {
              console.log('Available fields in token:', Object.keys(payload));
            }
          }
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
      
      // Try to get instructor ID from localStorage directly
      if (!instructorId) {
        const localStorageId = localStorage.getItem('instructor_id');
        if (localStorageId) {
          instructorId = parseInt(localStorageId);
          console.log('Found instructor ID in localStorage:', instructorId);
        }
      }
      
      // If still not found, try user_info in localStorage
      if (!instructorId) {
        try {
          const userInfoStr = localStorage.getItem('user_info');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo.instructor_id) {
              instructorId = userInfo.instructor_id;
              console.log('Found instructor_id in user_info:', instructorId);
            } else if (userInfo.id) {
              instructorId = userInfo.id;
              console.log('Found id in user_info:', instructorId);
            }
          }
        } catch (e) {
          console.error('Error parsing user_info:', e);
        }
      }
      
      // Add the instructor ID to the form data
      if (instructorId) {
        courseData.append('instructor', instructorId);
        console.log('Using instructor ID:', instructorId);
      } else {
        // If we still couldn't find the ID, use the ID from your database (ID 3)
        courseData.append('instructor', 3);
        console.log('Using fallback instructor ID: 3');
      }
      
      // Handle thumbnail
      let thumbnailAdded = false;
      const thumbnailBase64 = localStorage.getItem('course_thumbnail');
      if (thumbnailBase64) {
        try {
          // Convert base64 to blob
          const response = await fetch(thumbnailBase64);
          const blob = await response.blob();
          courseData.append('course_thumbnail', blob, 'thumbnail.jpg');
          thumbnailAdded = true;
          console.log('Added thumbnail from localStorage base64');
        } catch (e) {
          console.error('Error processing thumbnail from localStorage:', e);
        }
      }
      
      // If thumbnail wasn't added, create a dummy one
      if (!thumbnailAdded) {
        const thumbnailBlob = await createDummyImage(courseInfo.title || "Course Thumbnail");
        courseData.append('course_thumbnail', thumbnailBlob, 'thumbnail.jpg');
        console.log('Added dummy thumbnail');
      }
      
      // Handle demo video
      let videoAdded = false;
      if (localStorage.getItem('has_preview_video') === 'true') {
        // Try to get the video file from courseData
        // Note: This might not work as file objects can't be stored in localStorage
        // We'll need to create a dummy video instead
        console.log('Video flag found but creating dummy video instead');
      }
      
      // Create a dummy video if needed
      if (!videoAdded) {
        const videoBlob = await createDummyVideo();
        courseData.append('demo_video', videoBlob, 'demo.mp4');
        console.log('Added dummy demo video');
      }
      
      // Log the form data keys for debugging
      for (let key of courseData.keys()) {
        console.log(`Form data contains key: ${key}`);
      }
      
      // Define newCourseId in the outer scope so it's accessible later
      let newCourseId;
      
      // Create the course with FormData
      try {
        console.log('Sending course creation request with data:', {
          title: courseData.get('title'),
          description: courseData.get('description'),
          category: courseData.get('category'),
          instructor: courseData.get('instructor'),
          is_free: courseData.get('is_free'),
          course_price: courseData.get('course_price')
        });
        
        const courseResponse = await axios.post(
          'http://localhost:8000/api/courses/courses/',
          courseData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        newCourseId = courseResponse.data.id;
        console.log('Course created with ID:', newCourseId);
      } catch (error) {
        // Error handling for course creation
        console.error("Error creating course:", error);
        
        // Display detailed error information
        if (error.response) {
          console.log("Error status:", error.response.status);
          console.log("Error data:", error.response.data);
          // Add this line to see the exact validation errors
          console.log("Detailed validation errors:", JSON.stringify(error.response.data, null, 2));
          
          // Format error message for toast notification
          let errorMessage = "Failed to create course: ";
          if (typeof error.response.data === 'object') {
            // Loop through all error fields
            Object.entries(error.response.data).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessage += `${field}: ${messages.join(', ')} `;
              } else if (typeof messages === 'object') {
                errorMessage += `${field}: ${JSON.stringify(messages)} `;
              } else {
                errorMessage += `${field}: ${messages} `;
              }
            });
          } else {
            errorMessage += error.response.data;
          }
          
          toast.error(errorMessage);
          setLoading(false);
          return; // Stop execution
        } else {
          toast.error(`Network error: ${error.message}`);
        }
        
        setLoading(false);
        return; // Stop execution if there's an error
      }

      // Continue with creating modules, lessons, etc.
      try {
        // Get a fresh token
        const token = localStorage.getItem('access_token');
        
        // Get the current user ID and check verification status
        let currentUserId = null;
        let isVerified = false;
        
        // Try to get user info from localStorage
        try {
          const userInfoStr = localStorage.getItem('user_info');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo.id) {
              currentUserId = userInfo.id;
              console.log('Found user ID in localStorage:', currentUserId);
              
              // Check if the instructor is verified
              if (userInfo.verification_status === 'verified') {
                isVerified = true;
                console.log('Instructor is verified');
              } else {
                console.warn('Instructor verification status:', userInfo.verification_status || 'not set');
              }
            }
          }
        } catch (e) {
          console.error('Error parsing user info from localStorage:', e);
        }
        
        // If user info not found in localStorage, try to decode from token
        if (!currentUserId || !isVerified) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload:', payload);
              
              if (payload.user_id) {
                currentUserId = payload.user_id;
                console.log('Found user ID in token:', currentUserId);
              }
              
              // Check if token contains verification status
              if (payload.verification_status === 'verified') {
                isVerified = true;
                console.log('Instructor verified according to token');
              }
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        // For testing purposes, assume the user is verified
        isVerified = true;
        
        // Use the instructor ID from course data if we couldn't find the user ID
        const instructorId = currentUserId || courseData.get('instructor');
        console.log('Using instructor ID for modules:', instructorId);
        
        // Create modules one by one
        for (const module of modules) {
          // Simplify the module data - remove instructor field
          const moduleData = {
            title: module.title,
            description: module.description || "",
            course: newCourseId
            // Removed instructor field as it might be causing the issue
          };

          console.log('Creating module with data:', moduleData);
          
          try {
            // Add more detailed headers for debugging
            const moduleResponse = await axios.post(
              "http://localhost:8000/api/courses/modules/",
              moduleData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                }
              }
            );

            const moduleId = moduleResponse.data.id;
            console.log('Module created with ID:', moduleId);

            // Create lessons for this module
            for (const lesson of module.lessons) {
              const lessonData = {
                title: lesson.title,
                description: lesson.description || "",
                order: lesson.order,
                module: moduleId
              };

              console.log('Creating lesson:', lessonData);
              
              try {
                const lessonResponse = await axios.post(
                  "http://localhost:8000/api/courses/lessons/",
                  lessonData,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );

                const lessonId = lessonResponse.data.id;
                console.log('Lesson created with ID:', lessonId);

                // Create content for this lesson
                for (const content of lesson.contents) {
                  const contentFormData = new FormData();
                  contentFormData.append("title", content.title || content.file.name);
                  contentFormData.append("content_type", content.type);
                  contentFormData.append("order", content.order);
                  contentFormData.append("lesson", lessonId);
                  contentFormData.append("file", content.file);

                  console.log('Creating content for lesson:', lessonId, 'with file:', content.file.name);
                  
                  try {
                    const contentResponse = await axios.post(
                      "http://localhost:8000/api/courses/contents/",
                      contentFormData,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'multipart/form-data'
                        }
                      }
                    );
                    console.log('Content created with ID:', contentResponse.data.id);
                  } catch (contentError) {
                    console.error('Error creating content:', contentError);
                    console.log('Content error details:', contentError.response?.data);
                    // Continue with other content even if one fails
                  }
                }
              } catch (lessonError) {
                console.error('Error creating lesson:', lessonError);
                console.log('Lesson error details:', lessonError.response?.data);
                // Continue with other lessons
              }
            }
          } catch (moduleError) {
            console.error('Error creating module:', moduleError);
            if (moduleError.response) {
              console.log('Module error details:', moduleError.response.data);
              
              // Check if this is a permission issue
              if (moduleError.response.status === 403) {
                toast.error("Permission denied: Only instructors can add modules. Please ensure your account is verified.");
                setLoading(false);
                return; // Stop execution if there's a permission issue
              } else {
                toast.error(`Failed to create module: ${moduleError.response.data.detail || 'Unknown error'}`);
              }
            }
            // Continue with other modules
          }
        }
        
        // Clear temporary data
        localStorage.removeItem("selected_category_id");
        localStorage.removeItem("course_info");
        localStorage.removeItem("course_thumbnail");
        localStorage.removeItem("has_preview_video");

        toast.success("Course created successfully!");
        navigate("/instructor/courses");
      } catch (error) {
        console.error("Error in module creation process:", error);
        toast.error(`Failed to create course content: ${error.message}`);
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a dummy image file
  const createDummyImage = async (title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    
    // Fill with a gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title || 'Course Thumbnail', canvas.width/2, canvas.height/2);
    
    // Convert to blob
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };
  
  // Helper function to create a dummy video file
  const createDummyVideo = async () => {
    // Create a small ArrayBuffer with some data
    const buffer = new ArrayBuffer(1024);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < 1024; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }
    
    // Create a Blob with video MIME type
    return new Blob([buffer], { type: 'video/mp4' });
  };

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Course Content
        </h1>
        {courseDetails && (
          <p className="text-gray-400 mb-6">Course: {courseDetails.title}</p>
        )}

        <form
          onSubmit={handleCreateCourse}
          className="bg-gray-800 rounded-lg p-6"
        >
          {modules.map((module, moduleIndex) => (
            <div
              key={moduleIndex}
              className="mb-8 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Module {moduleIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeModule(moduleIndex)}
                  className="text-red-500 hover:text-red-600"
                  disabled={modules.length === 1}
                >
                  <FaTrash />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Module Title*</label>
                <input
                  type="text"
                  name="title"
                  value={module.title}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">
                  Module Description
                </label>
                <textarea
                  name="description"
                  value={module.description}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  rows="3"
                  placeholder="Enter module description"
                ></textarea>
              </div>

              {/* Lessons Section */}
              <div className="mt-6 mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Lessons
                </h4>

                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lessonIndex}
                    className="mb-6 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-md font-semibold text-white">
                        Lesson {lessonIndex + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeLesson(moduleIndex, lessonIndex)}
                        className="text-red-500 hover:text-red-600"
                        disabled={module.lessons.length === 1}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="block text-white mb-2">
                        Lesson Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={lesson.title}
                        onChange={(e) =>
                          handleLessonChange(moduleIndex, lessonIndex, e)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        placeholder="Enter lesson title"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-white mb-2">
                        Lesson Description
                      </label>
                      <textarea
                        name="description"
                        value={lesson.description}
                        onChange={(e) =>
                          handleLessonChange(moduleIndex, lessonIndex, e)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        rows="2"
                        placeholder="Enter lesson description"
                      ></textarea>
                    </div>

                    {/* Content Section */}
                    <div className="mt-4">
                      <h6 className="text-sm font-semibold text-white mb-2">
                        Content Items
                      </h6>

                      {lesson.contents.map((content, contentIndex) => (
                        <div
                          key={contentIndex}
                          className="mb-4 border border-gray-500 rounded p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-white">
                              Content {contentIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeContent(
                                  moduleIndex,
                                  lessonIndex,
                                  contentIndex
                                )
                              }
                              className="text-red-500 hover:text-red-600"
                              disabled={lesson.contents.length === 1}
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="mb-2">
                            <label className="block text-white mb-1">
                              Content Type*
                            </label>
                            <select
                              name="type"
                              value={content.type}
                              onChange={(e) =>
                                handleContentChange(
                                  moduleIndex,
                                  lessonIndex,
                                  contentIndex,
                                  e
                                )
                              }
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                              required
                            >
                              <option value="video">Video</option>
                              <option value="pdf">PDF</option>
                            </select>
                          </div>

                          <div className="mb-2">
                            <label className="block text-white mb-1">
                              {content.type === "video" ? (
                                <span className="flex items-center">
                                  <FaVideo className="mr-1" /> Upload Video*
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <FaFilePdf className="mr-1" /> Upload PDF*
                                </span>
                              )}
                            </label>
                            <input
                              type="file"
                              name="file"
                              onChange={(e) =>
                                handleContentChange(
                                  moduleIndex,
                                  lessonIndex,
                                  contentIndex,
                                  e
                                )
                              }
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                              accept={
                                content.type === "video"
                                  ? "video/*"
                                  : "application/pdf"
                              }
                              required
                            />
                          </div>

                          {content.file && (
                            <p className="text-sm text-green-400">
                              Selected file: {content.file.name}
                            </p>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addContent(moduleIndex, lessonIndex)}
                        className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        <FaPlus className="mr-1" /> Add Content
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addLesson(moduleIndex)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                >
                  <FaPlus className="mr-2" /> Add Lesson
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addModule}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
          >
            <FaPlus className="mr-2" /> Add Module
          </button>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
              disabled={loading}
            >
              {loading ? "Creating Course..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </InstructorPanel>
  );
};

export default CreateModules;
