import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import InstructorPanel from './InstructorPanel';
import { FaPlus, FaTrash, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const CreateLessons = () => {
  const { courseId, moduleId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  
  // Lessons data
  const [lessons, setLessons] = useState([
    { title: '', description: '', order: 1, content: [] }
  ]);
  
  // Fetch course and module details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const courseResponse = await axios.get(
          `http://localhost:8000/api/courses/${courseId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setCourseDetails(courseResponse.data);
        
        const moduleResponse = await axios.get(
          `http://localhost:8000/api/courses/modules/${moduleId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setModuleDetails(moduleResponse.data);
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Failed to fetch course or module details');
      }
    };
    
    fetchDetails();
  }, [courseId, moduleId, token]);
  
  // Handle lesson changes
  const handleLessonChange = (lessonIndex, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex] = {
      ...updatedLessons[lessonIndex],
      [name]: value
    };
    setLessons(updatedLessons);
  };
  
  // Add new lesson
  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', order: lessons.length + 1, content: [] }]);
  };
  
  // Remove lesson
  const removeLesson = (lessonIndex) => {
    if (lessons.length > 1) {
      const updatedLessons = [...lessons];
      updatedLessons.splice(lessonIndex, 1);
      // Update order for remaining lessons
      updatedLessons.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setLessons(updatedLessons);
    } else {
      toast.warning("You need at least one lesson");
    }
  };
  
  // Add content to a lesson
  const addContent = (lessonIndex, contentType) => {
    const updatedLessons = [...lessons];
    if (!updatedLessons[lessonIndex].content) {
      updatedLessons[lessonIndex].content = [];
    }
    updatedLessons[lessonIndex].content.push({
      title: '',
      content_type: contentType,
      file: null,
      text_content: '',
      order: updatedLessons[lessonIndex].content.length + 1
    });
    setLessons(updatedLessons);
  };
  
  // Handle content changes
  const handleContentChange = (lessonIndex, contentIndex, e) => {
    const { name, value, files } = e.target;
    const updatedLessons = [...lessons];
    
    if (name === 'file' && files) {
      updatedLessons[lessonIndex].content[contentIndex].file = files[0];
    } else {
      updatedLessons[lessonIndex].content[contentIndex][name] = value;
    }
    
    setLessons(updatedLessons);
  };
  
  // Remove content from a lesson
  const removeContent = (lessonIndex, contentIndex) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].content.splice(contentIndex, 1);
    // Update order for remaining content
    updatedLessons[lessonIndex].content.forEach((content, i) => {
      content.order = i + 1;
    });
    setLessons(updatedLessons);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate lessons
    if (lessons.some(lesson => !lesson.title)) {
      toast.error('Please provide a title for all lessons');
      return;
    }
    
    // Save lessons and content
    setLoading(true);
    try {
      for (const lesson of lessons) {
        // Create lesson
        const lessonData = {
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          module_id: moduleId
        };
        
        const lessonResponse = await axios.post(
          'http://localhost:8000/api/courses/lessons/create/',
          lessonData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Create content for this lesson
        if (lesson.content && lesson.content.length > 0) {
          for (const content of lesson.content) {
            const contentData = new FormData();
            contentData.append('title', content.title);
            contentData.append('content_type', content.content_type);
            contentData.append('order', content.order);
            contentData.append('lesson_id', lessonResponse.data.id);
            
            if (content.content_type === 'video' || content.content_type === 'pdf') {
              if (content.file) {
                contentData.append('file', content.file);
              }
            } else if (content.content_type === 'text') {
              contentData.append('text_content', content.text_content);
            }
            
            await axios.post(
              'http://localhost:8000/api/courses/content/create/',
              contentData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
          }
        }
      }
      
      toast.success('Lessons and content created successfully!');
      
      // Check if there are more modules to add lessons to
      const modulesResponse = await axios.get(
        `http://localhost:8000/api/courses/${courseId}/modules/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const modules = modulesResponse.data;
      const currentModuleIndex = modules.findIndex(m => m.id.toString() === moduleId);
      
      if (currentModuleIndex < modules.length - 1) {
        // Navigate to the next module's lessons page
        navigate(`/instructor/courses/${courseId}/modules/${modules[currentModuleIndex + 1].id}/lessons`);
      } else {
        // All modules have lessons, navigate to course list
        toast.success('Course creation completed!');
        navigate('/instructor/courses');
      }
    } catch (error) {
      console.error('Error creating lessons:', error);
      toast.error(error.response?.data?.error || 'Failed to create lessons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add Lessons</h1>
        {courseDetails && moduleDetails && (
          <div className="text-gray-400 mb-6">
            <p>Course: {courseDetails.title}</p>
            <p>Module: {moduleDetails.title}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
          {lessons.map((lesson, lessonIndex) => (
            <div key={lessonIndex} className="mb-8 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Lesson {lessonIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeLesson(lessonIndex)}
                  className="text-red-500 hover:text-red-600"
                  disabled={lessons.length === 1}
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-white mb-2">Lesson Title*</label>
                <input
                  type="text"
                  name="title"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(lessonIndex, e)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  placeholder="Enter lesson title"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white mb-2">Lesson Description</label>
                <textarea
                  name="description"
                  value={lesson.description}
                  onChange={(e) => handleLessonChange(lessonIndex, e)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  rows="3"
                  placeholder="Enter lesson description"
                ></textarea>
              </div>
              
              {/* Content section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-white">Content</h4>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => addContent(lessonIndex, 'video')}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Add Video
                    </button>
                    <button
                      type="button"
                      onClick={() => addContent(lessonIndex, 'pdf')}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Add PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => addContent(lessonIndex, 'text')}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Add Text
                    </button>
                  </div>
                </div>
                
                {lesson.content && lesson.content.map((content, contentIndex) => (
                  <div key={contentIndex} className="mb-3 border border-gray-600 rounded p-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white">{content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)} Content</span>
                      <button
                        type="button"
                        onClick={() => removeContent(lessonIndex, contentIndex)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-white text-sm mb-1">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={content.title}
                        onChange={(e) => handleContentChange(lessonIndex, contentIndex, e)}
                        className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm"
                        placeholder="Enter content title"
                        required
                      />
                    </div>
                    
                    {content.content_type === 'video' && (
                      <div>
                        <label className="block text-white text-sm mb-1">Video File*</label>
                        <input
                          type="file"
                          name="file"
                          onChange={(e) => handleContentChange(lessonIndex, contentIndex, e)}
                          className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm"
                          accept="video/*"
                          required
                        />
                      </div>
                    )}
                    
                    {content.content_type === 'pdf' && (
                      <div>
                        <label className="block text-white text-sm mb-1">PDF File*</label>
                        <input
                          type="file"
                          name="file"
                          onChange={(e) => handleContentChange(lessonIndex, contentIndex, e)}
                          className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm"
                          accept=".pdf"
                          required
                        />
                      </div>
                    )}
                    
                    {content.content_type === 'text' && (
                      <div>
                        <label className="block text-white text-sm mb-1">Text Content*</label>
                        <textarea
                          name="text_content"
                          value={content.text_content}
                          onChange={(e) => handleContentChange(lessonIndex, contentIndex, e)}
                          className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm"
                          rows="3"
                          placeholder="Enter text content"
                          required
                        ></textarea>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!lesson.content || lesson.content.length === 0) && (
                  <p className="text-gray-500 text-sm italic">No content added yet. Use the buttons above to add content.</p>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addLesson}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
          >
            <FaPlus className="mr-2" /> Add Another Lesson
          </button>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(`/instructor/courses/${courseId}/modules`)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center"
            >
              <span className="mr-2">←</span> Back to Modules
            </button>
            
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </InstructorPanel>
  );
};

export default CreateLessons;